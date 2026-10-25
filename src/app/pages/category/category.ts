import { Component, computed, effect, inject, OnDestroy, signal, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../shared/services/category.service';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { Property, PropertyFilter } from '../../shared/models/properties';
import { ListingStatus } from '../../shared/enums/PropertyStatus';
import { CategorySlug, MarketplaceCategory, findCategory } from '../../shared/constants/categories';
import { Filter, FilterCriteria } from '../../components/filter/filter';
import { GenericCriteria, GenericFilter } from '../../components/filter/generic-filter';
import { AdGrid } from '../../components/ad-grid/ad-grid';
import { CategoryIcon } from '../../components/category-icon/category-icon';
import { CarCriteria, CarFilterComponent } from '../../components/car-filter/car-filter';
import { CarGrid } from '../../components/car-grid/car-grid';
import { CarApiService } from '../../shared/services/car/car-api.service';
import { Car, CarFilter } from '../../shared/models/cars';
import {
  SecondHandCriteria,
  SecondHandFilterComponent,
} from '../../components/second-hand-filter/second-hand-filter';
import { SecondHandGrid } from '../../components/second-hand-grid/second-hand-grid';
import { SecondHandApiService } from '../../shared/services/second-hand/second-hand-api.service';
import { SecondHandFilter, SecondHandItem } from '../../shared/models/second-hand';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_SORT = 'createdAt,desc';

@Component({
  selector: 'app-category',
  imports: [
    CommonModule,
    Filter,
    GenericFilter,
    CarFilterComponent,
    SecondHandFilterComponent,
    AdGrid,
    CarGrid,
    SecondHandGrid,
    CategoryIcon,
    TranslatePipe,
  ],
  templateUrl: './category.html',
  styleUrl: './category.scss',
})
export class CategoryBrowse implements OnDestroy {
  private route = inject(ActivatedRoute);
  readonly categoryService = inject(CategoryService);
  private productApiService = inject(ProductApiService);
  private carApi = inject(CarApiService);
  private secondHandApi = inject(SecondHandApiService);

  readonly slug = this.route.snapshot.data['category'] as CategorySlug;
  readonly category = computed<MarketplaceCategory>(
    () =>
      this.categoryService.categories().find((c) => c.slug === this.slug) ??
      (findCategory(this.slug) as MarketplaceCategory),
  );
  /** Only categories the backend can serve listings for may hit the ads API. */
  readonly supported = computed(() => this.category().available === true);

  ads = signal<Property[]>([]);
  cars = signal<Car[]>([]);
  items = signal<SecondHandItem[]>([]);
  totalFound = signal(0);
  hasMore = signal(false);
  isLoading = signal(false);
  sort = signal(DEFAULT_SORT);
  isFilterOpen = false;

  private page = 0;
  private criteria: FilterCriteria | null = null;
  private generic: GenericCriteria | null = null;
  private carCriteria: CarCriteria | null = null;
  private secondHandCriteria: SecondHandCriteria | null = null;
  private search = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private requestSub?: Subscription;

  constructor() {
    // Listing addresses come back in the UI language, so re-run the current query when it changes.
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      untracked(() => this.fetch(0, false));
    });
  }

  ngOnDestroy(): void {
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.requestSub?.unsubscribe();
  }

  onFilterChange(criteria: FilterCriteria) {
    this.criteria = criteria;
    this.fetch(0, false);
  }

  onGenericFilterChange(criteria: GenericCriteria) {
    this.generic = criteria;
    this.fetch(0, false);
  }

  onCarFilterChange(criteria: CarCriteria) {
    this.carCriteria = criteria;
    this.fetch(0, false);
  }

  onSecondHandFilterChange(criteria: SecondHandCriteria) {
    this.secondHandCriteria = criteria;
    this.fetch(0, false);
  }

  onSearchInput(value: string) {
    this.search = value;
    if (this.searchTimer) clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.fetch(0, false), SEARCH_DEBOUNCE_MS);
  }

  onSortChange(value: string) {
    this.sort.set(value);
    this.fetch(0, false);
  }

  loadMore() {
    this.fetch(this.page + 1, true);
  }

  private fetch(page: number, append: boolean) {
    if (!this.supported()) {
      this.ads.set([]);
      this.totalFound.set(0);
      this.hasMore.set(false);
      this.isLoading.set(false);
      return;
    }
    // Drop any in-flight request so a slow earlier response can't overwrite newer results.
    this.requestSub?.unsubscribe();
    this.isLoading.set(true);
    if (this.slug === 'cars') {
      this.fetchCars(page, append);
      return;
    }
    if (this.slug === 'second-hand') {
      this.fetchSecondHand(page, append);
      return;
    }
    this.requestSub = this.productApiService
      .filterProperties(this.buildFilter(), page, PAGE_SIZE, this.sort() || undefined)
      .subscribe({
        next: (data) => {
          this.ads.set(append ? [...this.ads(), ...data.content] : data.content);
          this.page = data.number;
          this.totalFound.set(data.totalElements);
          this.hasMore.set(!data.last);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }

  private fetchCars(page: number, append: boolean) {
    this.requestSub = this.carApi
      .filter(this.buildCarFilter(), page, PAGE_SIZE, this.sort() || undefined)
      .subscribe({
        next: (data) => {
          this.cars.set(append ? [...this.cars(), ...data.content] : data.content);
          this.page = data.number;
          this.totalFound.set(data.totalElements);
          this.hasMore.set(!data.last);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private buildCarFilter(): CarFilter {
    const c = this.carCriteria;
    return {
      search: this.search.trim(),
      regionId: c?.regionId ?? null,
      districtId: c?.districtId ?? null,
      condition: c?.condition ?? null,
      bodyTypes: c?.bodyTypes ?? [],
      fuelTypes: c?.fuelTypes ?? [],
      transmissions: c?.transmissions ?? [],
      driveTypes: c?.driveTypes ?? [],
      priceFrom: c?.priceFrom ?? null,
      priceTo: c?.priceTo ?? null,
      yearFrom: c?.yearFrom ?? null,
      yearTo: c?.yearTo ?? null,
      mileageTo: c?.mileageTo ?? null,
    };
  }

  private fetchSecondHand(page: number, append: boolean) {
    this.requestSub = this.secondHandApi
      .filter(this.buildSecondHandFilter(), page, PAGE_SIZE, this.sort() || undefined)
      .subscribe({
        next: (data) => {
          this.items.set(append ? [...this.items(), ...data.content] : data.content);
          this.page = data.number;
          this.totalFound.set(data.totalElements);
          this.hasMore.set(!data.last);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  private buildSecondHandFilter(): SecondHandFilter {
    const c = this.secondHandCriteria;
    return {
      search: this.search.trim(),
      regionId: c?.regionId ?? null,
      districtId: c?.districtId ?? null,
      subCategories: c?.subCategories ?? [],
      conditions: c?.conditions ?? [],
      priceFrom: c?.priceFrom ?? null,
      priceTo: c?.priceTo ?? null,
    };
  }

  private buildFilter(): PropertyFilter {
    const criteria = this.criteria;
    const generic = this.generic;
    return {
      search: this.search.trim(),
      listingStatus: ListingStatus.ACTIVE,
      type: null,
      regionId: criteria?.regionId ?? generic?.regionId ?? null,
      districtId: criteria?.districtId ?? null,
      placeId: criteria?.placeId ?? null,
      types: criteria?.types ?? [],
      priceFrom: criteria?.priceFrom ?? generic?.priceFrom ?? null,
      priceTo: criteria?.priceTo ?? generic?.priceTo ?? null,
      roomsFrom: criteria?.roomsFrom ?? null,
      floorFrom: criteria?.floorFrom ?? null,
      amenities: criteria?.amenities ?? [],
    };
  }
}
