import { Component, effect, inject, OnDestroy, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription, forkJoin, of } from 'rxjs';
import { CategoryService } from '../../shared/services/category.service';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { CarApiService } from '../../shared/services/car/car-api.service';
import { SecondHandApiService } from '../../shared/services/second-hand/second-hand-api.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { CategoryIcon } from '../../components/category-icon/category-icon';
import { MixedAdGrid, AdItem } from '../../components/mixed-ad-grid/mixed-ad-grid';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { Property } from '../../shared/models/properties';
import { Car, CarFilter } from '../../shared/models/cars';
import { SecondHandFilter, SecondHandItem } from '../../shared/models/second-hand';
import { ListingStatus } from '../../shared/enums/PropertyStatus';
import { categoryThumb } from '../../shared/constants/categories';

const PAGE_SIZE = 12;
const RECENT_SORT = 'createdAt,desc';

/** "Any" car criteria — the landing only wants the newest live cars. */
const EMPTY_CAR_FILTER: CarFilter = {
  search: '',
  regionId: null,
  districtId: null,
  condition: null,
  bodyTypes: [],
  fuelTypes: [],
  transmissions: [],
  driveTypes: [],
  priceFrom: null,
  priceTo: null,
  yearFrom: null,
  yearTo: null,
  mileageTo: null,
};

/** "Any" second-hand criteria — the landing only wants the newest live items. */
const EMPTY_SECOND_HAND_FILTER: SecondHandFilter = {
  search: '',
  regionId: null,
  districtId: null,
  subCategories: [],
  conditions: [],
  priceFrom: null,
  priceTo: null,
};

const ts = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoryIcon, MixedAdGrid, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnDestroy {
  readonly categoryService = inject(CategoryService);
  readonly categories = this.categoryService.categories;
  readonly thumb = categoryThumb;

  /** The single mixed feed (properties + cars) shown on the landing, newest first. */
  ads = signal<AdItem[]>([]);
  totalFound = signal(0);
  hasMore = signal(false);
  isLoading = signal(true);

  private productApiService = inject(ProductApiService);
  private carApi = inject(CarApiService);
  private secondHandApi = inject(SecondHandApiService);

  // Accumulators so all feeds can be paginated in lockstep and re-sorted together on each page.
  private propItems: Property[] = [];
  private carItems: Car[] = [];
  private itemItems: SecondHandItem[] = [];
  private propPage = 0;
  private carPage = 0;
  private itemPage = 0;
  private propHasMore = true;
  private carHasMore = true;
  private itemHasMore = true;
  private propTotal = 0;
  private carTotal = 0;
  private itemTotal = 0;
  private sub?: Subscription;

  constructor() {
    // Listing addresses come back in the UI language, so reload the feed when it changes.
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      untracked(() => this.reload());
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  loadMore(): void {
    this.fetchPage();
  }

  private reload(): void {
    this.propItems = [];
    this.carItems = [];
    this.itemItems = [];
    this.propPage = 0;
    this.carPage = 0;
    this.itemPage = 0;
    this.propHasMore = true;
    this.carHasMore = true;
    this.itemHasMore = true;
    this.propTotal = 0;
    this.carTotal = 0;
    this.itemTotal = 0;
    this.ads.set([]);
    this.isLoading.set(true);
    this.fetchPage();
  }

  /**
   * Fetch the next page of whichever feeds still have more, then re-merge and re-sort the whole
   * accumulated set by publish date. Paging both in lockstep keeps the interleaving correct even
   * when one category has far more listings than the other.
   */
  private fetchPage(): void {
    this.sub?.unsubscribe();
    this.isLoading.set(true);

    const prop$ = this.propHasMore
      ? this.productApiService.filterProperties(
          { search: '', listingStatus: ListingStatus.ACTIVE, type: null },
          this.propPage,
          PAGE_SIZE,
          RECENT_SORT,
        )
      : of(null);

    // The public car endpoint only ever returns live (ACTIVE) cars, so no status filter is needed.
    const car$ = this.carHasMore
      ? this.carApi.filter(EMPTY_CAR_FILTER, this.carPage, PAGE_SIZE, RECENT_SORT)
      : of(null);

    // Same for second-hand items: the public endpoint only returns live (ACTIVE) items.
    const item$ = this.itemHasMore
      ? this.secondHandApi.filter(EMPTY_SECOND_HAND_FILTER, this.itemPage, PAGE_SIZE, RECENT_SORT)
      : of(null);

    this.sub = forkJoin({ prop: prop$, car: car$, item: item$ }).subscribe({
      next: ({ prop, car, item }) => {
        if (prop) {
          this.propItems = [...this.propItems, ...prop.content];
          this.propPage = prop.number + 1;
          this.propHasMore = !prop.last;
          this.propTotal = prop.totalElements;
        }
        if (car) {
          this.carItems = [...this.carItems, ...car.content];
          this.carPage = car.number + 1;
          this.carHasMore = !car.last;
          this.carTotal = car.totalElements;
        }
        if (item) {
          this.itemItems = [...this.itemItems, ...item.content];
          this.itemPage = item.number + 1;
          this.itemHasMore = !item.last;
          this.itemTotal = item.totalElements;
        }
        this.merge();
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  private merge(): void {
    const items: AdItem[] = [
      ...this.propItems.map((p) => ({
        kind: 'property' as const,
        id: p.id ?? 0,
        createdAt: p.createdAt ?? '',
        property: p,
      })),
      ...this.carItems.map((c) => ({
        kind: 'car' as const,
        id: c.id,
        createdAt: c.createdAt,
        car: c,
      })),
      ...this.itemItems.map((i) => ({
        kind: 'second-hand' as const,
        id: i.id,
        createdAt: i.createdAt,
        item: i,
      })),
    ];
    items.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
    this.ads.set(items);
    this.totalFound.set(this.propTotal + this.carTotal + this.itemTotal);
    this.hasMore.set(this.propHasMore || this.carHasMore || this.itemHasMore);
  }
}
