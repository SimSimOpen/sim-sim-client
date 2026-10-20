import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  effect,
  inject,
  OnDestroy,
  untracked,
  ViewChild,
} from '@angular/core';
import { I18nService } from '../../../shared/i18n/i18n.service';
import { ProductStateService } from '../../../shared/services/product/state/product-state.service';
import { ProductApiService } from '../../../shared/services/product/state/product-api.service';
import { BaseModalComponent } from '../../../components/modal/baseModal';
import { Property, PropertyFilter } from '../../../shared/models/properties';
import { Subscription } from 'rxjs';
import { ListingStatus } from '../../../shared/enums/PropertyStatus';
import { Filter, FilterCriteria } from './filter';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { PropertyCard } from '../../../components/property-card/property-card';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ViewProperty } from '../../../components/view-property-models/view-property/view-property';

const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 350;

@Component({
  selector: 'app-browse',
  imports: [CommonModule, Filter, PropertyCard, ModalComponent, ViewProperty, TranslatePipe],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class Browse extends BaseModalComponent implements OnDestroy {
  @ViewChild(ModalComponent) modal!: ModalComponent;
  isFilterOpen: boolean = false;
  filteredProperties: Property[] = [];
  totalFound = 0;
  hasMore = false;
  isLoading = false;
  sort = '';

  isViewPropertyModalOpen: boolean = false;
  selectedProperty: Property | null = null;

  private page = 0;
  private criteria: FilterCriteria | null = null;
  private search = '';
  private searchTimer: ReturnType<typeof setTimeout> | null = null;
  private requestSub?: Subscription;

  constructor() {
    super();
    // Listing addresses come back in the UI language, so re-run the current query when it changes.
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      untracked(() => this.fetch(0, false));
    });
  }

  private productApiService = inject(ProductApiService);
  public productStateService = inject(ProductStateService);
  private ctr = inject(ChangeDetectorRef);

  ngOnDestroy(): void {
    this.clearSearchTimer();
    this.requestSub?.unsubscribe();
  }

  onFilterChange(criteria: FilterCriteria) {
    this.criteria = criteria;
    this.fetch(0, false);
  }

  onSearchInput(value: string) {
    this.search = value;
    this.clearSearchTimer();
    this.searchTimer = setTimeout(() => this.fetch(0, false), SEARCH_DEBOUNCE_MS);
  }

  onSortChange(value: string) {
    this.sort = value;
    this.fetch(0, false);
  }

  loadMore() {
    this.fetch(this.page + 1, true);
  }

  private clearSearchTimer() {
    if (this.searchTimer) {
      clearTimeout(this.searchTimer);
      this.searchTimer = null;
    }
  }

  private fetch(page: number, append: boolean) {
    // Drop any in-flight request so a slow earlier response can't overwrite newer results.
    this.requestSub?.unsubscribe();
    this.isLoading = true;
    this.requestSub = this.productApiService
      .filterProperties(this.buildFilter(), page, PAGE_SIZE, this.sort || undefined)
      .subscribe({
        next: (data) => {
          this.filteredProperties = append
            ? [...this.filteredProperties, ...data.content]
            : data.content;
          this.page = data.number;
          this.totalFound = data.totalElements;
          this.hasMore = !data.last;
          this.isLoading = false;
          this.ctr.detectChanges();
        },
        error: () => {
          this.isLoading = false;
          this.ctr.detectChanges();
        },
      });
  }

  private buildFilter(): PropertyFilter {
    const criteria = this.criteria;
    return {
      search: this.search.trim(),
      listingStatus: ListingStatus.ACTIVE,
      type: null,
      regionId: criteria?.regionId ?? null,
      districtId: criteria?.districtId ?? null,
      placeId: criteria?.placeId ?? null,
      types: criteria?.types ?? [],
      priceFrom: criteria?.priceFrom ?? null,
      priceTo: criteria?.priceTo ?? null,
      roomsFrom: criteria?.roomsFrom ?? null,
      floorFrom: criteria?.floorFrom ?? null,
      amenities: criteria?.amenities ?? [],
    };
  }

  override closeModal(): void {
    this.isViewPropertyModalOpen = false;
    this.selectedProperty = null;
    super.closeModal();
  }

  openViewPropertyModal(property: Property): void {
    this.selectedProperty = property;
    this.isViewPropertyModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.view-property-component') as HTMLElement;
      if (modalContent) modalContent.scrollTop = 0;
    }, 50);
  }
}
