import { CommonModule } from '@angular/common';
import {
  Component,
  effect,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
  untracked,
} from '@angular/core';
import { District, Place, Region } from '../../shared/models/properties';
import { ServiceCategory } from '../../shared/enums/Services';
import { ServiceFilter } from '../../shared/models/services';
import { LocationService } from '../../shared/services/location.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/**
 * Everything in ServiceFilter except the free-text search, which lives in the page header, and
 * `kind`, which is driven by the page's intent toggle rather than by this panel.
 */
export type ServiceCriteria = Omit<ServiceFilter, 'search' | 'kind'>;

@Component({
  selector: 'app-service-filter',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './service-filter.html',
})
export class ServiceFilterComponent {
  @Input() isFilterOpen = false;
  @Output() filterChange = new EventEmitter<ServiceCriteria>();
  /** Fires when the user is done with the panel, so the mobile overlay can close. */
  @Output() apply = new EventEmitter<void>();

  readonly categories = Object.values(ServiceCategory);

  private locationService = inject(LocationService);
  private i18n = inject(I18nService);

  regions = signal<Region[]>([]);
  districts = signal<District[]>([]);
  places = signal<Place[]>([]);
  criteria = signal<ServiceCriteria>(emptyCriteria());

  constructor() {
    // Location names come from the backend in the UI language, so reload them when it changes.
    effect(() => {
      this.i18n.lang();
      untracked(() => {
        this.locationService.getRegions().subscribe((regions) => this.regions.set(regions));
        const { regionId, districtId } = this.criteria();
        if (regionId) this.loadDistricts(regionId);
        if (districtId) this.loadPlaces(districtId);
      });
    });
  }

  onRegionChange(value: string) {
    const regionId = value ? Number(value) : null;
    this.districts.set([]);
    this.places.set([]);
    if (regionId) this.loadDistricts(regionId);
    this.update({ regionId, districtId: null, placeId: null });
  }

  onDistrictChange(value: string) {
    const districtId = value ? Number(value) : null;
    this.places.set([]);
    if (districtId) this.loadPlaces(districtId);
    this.update({ districtId, placeId: null });
  }

  onPlaceChange(value: string) {
    this.update({ placeId: value ? Number(value) : null });
  }

  toggleCategory(value: ServiceCategory) {
    const current = this.criteria().categories;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    this.update({ categories: next });
  }

  isChecked(value: ServiceCategory): boolean {
    return this.criteria().categories.includes(value);
  }

  onNumber(key: 'priceFrom' | 'priceTo', value: string) {
    const parsed = Number(value);
    this.update({ [key]: value.trim() !== '' && Number.isFinite(parsed) ? parsed : null });
  }

  onApply() {
    this.filterChange.emit(this.criteria());
    this.apply.emit();
  }

  reset() {
    this.districts.set([]);
    this.places.set([]);
    this.criteria.set(emptyCriteria());
    this.filterChange.emit(this.criteria());
  }

  private update(patch: Partial<ServiceCriteria>) {
    this.criteria.update((c) => ({ ...c, ...patch }));
    this.filterChange.emit(this.criteria());
  }

  private loadDistricts(regionId: number) {
    this.locationService
      .getDistrictsByRegion(regionId)
      .subscribe((districts) => this.districts.set(districts));
  }

  private loadPlaces(districtId: number) {
    this.locationService
      .getPlacesByDistrict(districtId)
      .subscribe((places) => this.places.set(places));
  }
}

function emptyCriteria(): ServiceCriteria {
  return {
    listingStatus: null,
    categories: [],
    regionId: null,
    districtId: null,
    placeId: null,
    priceFrom: null,
    priceTo: null,
  };
}
