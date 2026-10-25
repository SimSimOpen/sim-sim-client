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
import { District, Region } from '../../shared/models/properties';
import { ItemCondition, SecondHandCategory } from '../../shared/enums/SecondHand';
import { SecondHandFilter } from '../../shared/models/second-hand';
import { LocationService } from '../../shared/services/location.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** Everything in SecondHandFilter except the free-text search, which lives in the page header. */
export type SecondHandCriteria = Omit<SecondHandFilter, 'search'>;

type ListKey = 'subCategories' | 'conditions';

@Component({
  selector: 'app-second-hand-filter',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './second-hand-filter.html',
})
export class SecondHandFilterComponent {
  @Input() isFilterOpen = false;
  @Output() filterChange = new EventEmitter<SecondHandCriteria>();
  /** Fires when the user is done with the panel, so the mobile overlay can close. */
  @Output() apply = new EventEmitter<void>();

  readonly subCategories = Object.values(SecondHandCategory);
  readonly conditions = Object.values(ItemCondition);

  private locationService = inject(LocationService);
  private i18n = inject(I18nService);

  regions = signal<Region[]>([]);
  districts = signal<District[]>([]);
  criteria = signal<SecondHandCriteria>(emptyCriteria());

  constructor() {
    // Location names come from the backend in the UI language, so reload them when it changes.
    effect(() => {
      this.i18n.lang();
      untracked(() => {
        this.locationService.getRegions().subscribe((regions) => this.regions.set(regions));
        const regionId = this.criteria().regionId;
        if (regionId) this.loadDistricts(regionId);
      });
    });
  }

  onRegionChange(value: string) {
    const regionId = value ? Number(value) : null;
    this.districts.set([]);
    if (regionId) this.loadDistricts(regionId);
    this.update({ regionId, districtId: null });
  }

  onDistrictChange(value: string) {
    this.update({ districtId: value ? Number(value) : null });
  }

  toggle(key: ListKey, value: string) {
    const current = this.criteria()[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.update({ [key]: next } as Partial<SecondHandCriteria>);
  }

  isChecked(key: ListKey, value: string): boolean {
    return (this.criteria()[key] as string[]).includes(value);
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
    this.criteria.set(emptyCriteria());
    this.filterChange.emit(this.criteria());
  }

  private update(patch: Partial<SecondHandCriteria>) {
    this.criteria.update((c) => ({ ...c, ...patch }));
    this.filterChange.emit(this.criteria());
  }

  private loadDistricts(regionId: number) {
    this.locationService
      .getDistrictsByRegion(regionId)
      .subscribe((districts) => this.districts.set(districts));
  }
}

function emptyCriteria(): SecondHandCriteria {
  return {
    regionId: null,
    districtId: null,
    subCategories: [],
    conditions: [],
    priceFrom: null,
    priceTo: null,
  };
}
