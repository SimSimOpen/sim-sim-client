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
import {
  CarBodyType,
  CarCondition,
  DriveType,
  FuelType,
  Transmission,
} from '../../shared/enums/CarStatus';
import { CarFilter } from '../../shared/models/cars';
import { LocationService } from '../../shared/services/location.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** Everything in CarFilter except the free-text search, which lives in the page header. */
export type CarCriteria = Omit<CarFilter, 'search'>;

type ListKey = 'bodyTypes' | 'fuelTypes' | 'transmissions' | 'driveTypes';

@Component({
  selector: 'app-car-filter',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './car-filter.html',
})
export class CarFilterComponent {
  @Input() isFilterOpen = false;
  @Output() filterChange = new EventEmitter<CarCriteria>();
  /** Fires when the user is done with the panel, so the mobile overlay can close. */
  @Output() apply = new EventEmitter<void>();

  readonly conditions = Object.values(CarCondition);
  readonly groups: { key: ListKey; label: string; values: string[] }[] = [
    { key: 'bodyTypes', label: 'cars.bodyType', values: Object.values(CarBodyType) },
    { key: 'fuelTypes', label: 'cars.fuelType', values: Object.values(FuelType) },
    { key: 'transmissions', label: 'cars.transmission', values: Object.values(Transmission) },
    { key: 'driveTypes', label: 'cars.driveType', values: Object.values(DriveType) },
  ];

  private locationService = inject(LocationService);
  private i18n = inject(I18nService);

  regions = signal<Region[]>([]);
  districts = signal<District[]>([]);
  criteria = signal<CarCriteria>(emptyCriteria());

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

  setCondition(condition: CarCondition | null) {
    this.update({ condition });
  }

  toggle(key: ListKey, value: string) {
    const current = this.criteria()[key] as string[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    this.update({ [key]: next } as Partial<CarCriteria>);
  }

  isChecked(key: ListKey, value: string): boolean {
    return (this.criteria()[key] as string[]).includes(value);
  }

  onNumber(key: 'priceFrom' | 'priceTo' | 'yearFrom' | 'yearTo' | 'mileageTo', value: string) {
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

  private update(patch: Partial<CarCriteria>) {
    this.criteria.update((c) => ({ ...c, ...patch }));
    this.filterChange.emit(this.criteria());
  }

  private loadDistricts(regionId: number) {
    this.locationService
      .getDistrictsByRegion(regionId)
      .subscribe((districts) => this.districts.set(districts));
  }
}

function emptyCriteria(): CarCriteria {
  return {
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
}
