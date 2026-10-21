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
import { I18nService } from '../../shared/i18n/i18n.service';
import { Region } from '../../shared/models/properties';
import { LocationService } from '../../shared/services/location.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** The subset of query criteria every future category can filter on, before category-specific fields exist. */
export interface GenericCriteria {
  regionId: number | null;
  priceFrom: number | null;
  priceTo: number | null;
}

@Component({
  selector: 'app-generic-filter',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './generic-filter.html',
})
export class GenericFilter {
  @Input() isFilterOpen: boolean = false;
  @Output() filterChange = new EventEmitter<GenericCriteria>();
  /** Fires when the user is done with the panel, so the mobile overlay can close. */
  @Output() apply = new EventEmitter<void>();

  regions = signal<Region[]>([]);
  regionId = signal<number | null>(null);
  priceFrom = signal<number | null>(null);
  priceTo = signal<number | null>(null);

  private locationService = inject(LocationService);
  private i18n = inject(I18nService);

  constructor() {
    // Region names come from the backend in the UI language, so reload the list when it changes.
    effect(() => {
      this.i18n.lang();
      untracked(() =>
        this.locationService.getRegions().subscribe((regions) => this.regions.set(regions)),
      );
    });
  }

  onRegionChange(value: string) {
    this.regionId.set(value ? Number(value) : null);
    this.emitCriteria();
  }

  onPriceFromChange(value: string) {
    this.priceFrom.set(this.toNumber(value));
    this.emitCriteria();
  }

  onPriceToChange(value: string) {
    this.priceTo.set(this.toNumber(value));
    this.emitCriteria();
  }

  onApply() {
    this.emitCriteria();
    this.apply.emit();
  }

  reset() {
    this.regionId.set(null);
    this.priceFrom.set(null);
    this.priceTo.set(null);
    this.emitCriteria();
  }

  private toNumber(value: string): number | null {
    const parsed = Number(value);
    return value.trim() !== '' && Number.isFinite(parsed) ? parsed : null;
  }

  private emitCriteria() {
    this.filterChange.emit({
      regionId: this.regionId(),
      priceFrom: this.priceFrom(),
      priceTo: this.priceTo(),
    });
  }
}
