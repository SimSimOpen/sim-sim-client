import { CommonModule } from '@angular/common';
import {
  afterNextRender,
  Component,
  effect,
  EnvironmentInjector,
  EventEmitter,
  inject,
  Input,
  Output,
  runInInjectionContext,
  signal,
  untracked,
} from '@angular/core';
import { I18nService } from '../../shared/i18n/i18n.service';
import { District, Place, Region } from '../../shared/models/properties';
import { PropertyType } from '../../shared/enums/PropertyStatus';
import { LocationService } from '../../shared/services/location.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** Everything the browse page needs to build a query, minus search text and sorting. */
export interface FilterCriteria {
  regionId: number | null;
  districtId: number | null;
  placeId: number | null;
  types: PropertyType[];
  priceFrom: number | null;
  priceTo: number | null;
  roomsFrom: number | null;
  floorFrom: number | null;
  amenities: string[];
}

const ACTIVE_BUTTON = 'border-blue-600 bg-blue-50 text-blue-600';
const IDLE_BUTTON =
  'border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors';

@Component({
  selector: 'app-filter',
  imports: [CommonModule, TranslatePipe],
  template: ` <div
    class="absolute md:static z-10 w-full md:w-64 shrink-0"
    [ngClass]="isFilterOpen ? 'block' : 'hidden md:block'"
  >
    <div class="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-28 space-y-8">
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-funnel h-5 w-5"
            aria-hidden="true"
          >
            <path
              d="M10 20a1 1 0 0 0 .553.895l2 1A1 1 0 0 0 14 21v-7a2 2 0 0 1 .517-1.341L21.74 4.67A1 1 0 0 0 21 3H3a1 1 0 0 0-.742 1.67l7.225 7.989A2 2 0 0 1 10 14z"
            ></path>
          </svg>
          {{ 'filter.title' | t }}
        </h2>
        <button
          type="button"
          class="text-sm text-blue-600 font-medium hover:text-blue-800"
          (click)="reset()"
        >
          {{ 'filter.reset' | t }}
        </button>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'filter.location' | t }}</h3>
        <select
          class="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm px-3 py-2 outline-none"
          [value]="regionId() ?? ''"
          (change)="onRegionChange($any($event.target).value)"
        >
          <option value="">{{ 'filter.allCities' | t }}</option>
          @for (region of regions(); track region.id) {
            <option [value]="region.id">{{ region.name_en }}</option>
          }
        </select>
        <select
          class="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm px-3 py-2 outline-none mt-3 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          [disabled]="!regionId()"
          [value]="districtId() ?? ''"
          (change)="onDistrictChange($any($event.target).value)"
        >
          <option value="">{{ 'filter.allDistricts' | t }}</option>
          @for (district of districts(); track district.id) {
            <option [value]="district.id">{{ district.name_en }}</option>
          }
        </select>
        <select
          class="block w-full rounded-md border border-gray-300 bg-white shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm px-3 py-2 outline-none mt-3 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
          [disabled]="!districtId() || !places().length"
          [value]="placeId() ?? ''"
          (change)="onPlaceChange($any($event.target).value)"
        >
          <option value="">
            {{ (districtId() && placesLoaded() && !places().length ? 'filter.noAreas' : 'filter.allAreas') | t }}
          </option>
          @for (place of places(); track place.id) {
            <option [value]="place.id">{{ place.name_en }}</option>
          }
        </select>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'filter.propertyType' | t }}</h3>
        <div class="space-y-2">
          @for (type of propertyTypes; track type) {
            <label class="flex items-center gap-2 cursor-pointer"
              ><input
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                [checked]="types().includes(type)"
                (change)="toggleType(type)"
              /><span class="text-sm text-gray-700">{{ 'enum.type.' + type | t }}</span></label
            >
          }
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'filter.priceRange' | t }}</h3>
        <div class="flex items-center gap-2">
          <div class="w-full">
            <div class="relative">
              <input
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 border px-3 py-2"
                [placeholder]="'filter.min' | t"
                type="number"
                min="0"
                [value]="priceFrom() ?? ''"
                (change)="onPriceFromChange($any($event.target).value)"
              />
            </div>
          </div>
          <span class="text-gray-400">-</span>
          <div class="w-full">
            <div class="relative">
              <input
                class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm disabled:bg-gray-50 disabled:text-gray-500 border px-3 py-2"
                [placeholder]="'filter.max' | t"
                type="number"
                min="0"
                [value]="priceTo() ?? ''"
                (change)="onPriceToChange($any($event.target).value)"
              />
            </div>
          </div>
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'property.rooms' | t }}</h3>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-1.5 text-sm border rounded-md"
            [ngClass]="roomsFrom() === null ? activeButton : idleButton"
            (click)="setRooms(null)"
          >
            {{ 'filter.any' | t }}
          </button>
          @for (num of steps; track num) {
            <button
              type="button"
              class="flex-1 py-1.5 text-sm border rounded-md"
              [ngClass]="roomsFrom() === num ? activeButton : idleButton"
              (click)="setRooms(num)"
            >
              {{ num }}+
            </button>
          }
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'property.floor' | t }}</h3>
        <div class="flex gap-2">
          <button
            type="button"
            class="flex-1 py-1.5 text-sm border rounded-md"
            [ngClass]="floorFrom() === null ? activeButton : idleButton"
            (click)="setFloor(null)"
          >
            {{ 'filter.any' | t }}
          </button>
          @for (num of steps; track num) {
            <button
              type="button"
              class="flex-1 py-1.5 text-sm border rounded-md"
              [ngClass]="floorFrom() === num ? activeButton : idleButton"
              (click)="setFloor(num)"
            >
              {{ num }}+
            </button>
          }
        </div>
      </div>
      <div>
        <h3 class="text-sm font-semibold text-gray-900 mb-3">{{ 'filter.amenities' | t }}</h3>
        <div class="space-y-2">
          @for (amenity of amenityKeys; track amenity) {
            <label class="flex items-center gap-2 cursor-pointer"
              ><input
                type="checkbox"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                [checked]="amenities().includes(amenity)"
                (change)="toggleAmenity(amenity)"
              /><span class="text-sm text-gray-700">{{ 'amenity.' + amenity | t }}</span></label
            >
          }
        </div>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-700 shadow-sm h-10 px-4 py-2 text-sm w-full"
        (click)="onApply()"
      >
        {{ 'filter.apply' | t }}
      </button>
    </div>
  </div>`,
})
export class Filter {
  @Input() isFilterOpen: boolean = false;
  @Output() filterChange = new EventEmitter<FilterCriteria>();
  /** Fires when the user is done with the panel, so the mobile overlay can close. */
  @Output() apply = new EventEmitter<void>();

  readonly activeButton = ACTIVE_BUTTON;
  readonly idleButton = IDLE_BUTTON;
  readonly steps = [1, 2, 3, 4];
  /** Residential first: those are what almost every searcher is after. */
  readonly propertyTypes: PropertyType[] = [
    PropertyType.APARTMENT,
    PropertyType.FLAT,
    PropertyType.HOUSE,
    PropertyType.VILLA,
    PropertyType.STUDIO,
    PropertyType.OFFICE,
    PropertyType.SHOP,
    PropertyType.WAREHOUSE,
    PropertyType.FACTORY,
    PropertyType.LAND_PLOT,
  ];
  /** Only the amenities the backend can actually filter on. */
  readonly amenityKeys = ['parking', 'swimmingPool', 'gym', 'airConditioning', 'washingMachine'];

  private locationService = inject(LocationService);
  private injector = inject(EnvironmentInjector);

  regions = signal<Region[]>([]);
  districts = signal<District[]>([]);
  places = signal<Place[]>([]);
  placesLoaded = signal(false);

  regionId = signal<number | null>(null);
  districtId = signal<number | null>(null);
  placeId = signal<number | null>(null);
  /** False while the region only shows the auto-preselected city; the query must stay unscoped then. */
  private regionUserSet = false;
  types = signal<PropertyType[]>([]);
  priceFrom = signal<number | null>(null);
  priceTo = signal<number | null>(null);
  roomsFrom = signal<number | null>(null);
  floorFrom = signal<number | null>(null);
  amenities = signal<string[]>([]);

  private i18n = inject(I18nService);

  constructor() {
    // Location names come from the backend in the UI language, so reload the lists (keeping the
    // current selection) whenever it changes.
    effect(() => {
      this.i18n.lang();
      untracked(() => this.loadLists());
    });
  }

  onPriceFromChange(value: string) {
    this.priceFrom.set(this.toNumber(value));
    this.emitCriteria();
  }

  onPriceToChange(value: string) {
    this.priceTo.set(this.toNumber(value));
    this.emitCriteria();
  }

  setRooms(value: number | null) {
    this.roomsFrom.set(value);
    this.emitCriteria();
  }

  setFloor(value: number | null) {
    this.floorFrom.set(value);
    this.emitCriteria();
  }

  onApply() {
    this.emitCriteria();
    this.apply.emit();
  }

  private toNumber(value: string): number | null {
    const parsed = Number(value);
    return value.trim() !== '' && Number.isFinite(parsed) ? parsed : null;
  }

  toggleType(type: PropertyType) {
    this.types.update((current) =>
      current.includes(type) ? current.filter((t) => t !== type) : [...current, type],
    );
    this.emitCriteria();
  }

  toggleAmenity(amenity: string) {
    this.amenities.update((current) =>
      current.includes(amenity)
        ? current.filter((a) => a !== amenity)
        : [...current, amenity],
    );
    this.emitCriteria();
  }

  private loadLists() {
    this.locationService.getRegions().subscribe((regions) => {
      this.regions.set(regions);
      // Single-city dataset: preselect it, otherwise the district select stays disabled forever.
      // Deferred past this render because the select's [value] binding is written before the
      // option it should match exists, which would leave the box showing "All cities".
      if (regions.length === 1 && !this.regionId()) {
        runInInjectionContext(this.injector, () =>
          afterNextRender(() => this.selectOnlyRegion(regions[0].id)),
        );
      }
    });
    const regionId = this.regionId();
    if (regionId) {
      this.locationService
        .getDistrictsByRegion(regionId)
        .subscribe((districts) => this.districts.set(districts));
    }
    const districtId = this.districtId();
    if (districtId) {
      this.locationService
        .getPlacesByDistrict(districtId)
        .subscribe((places) => this.places.set(places));
    }
  }

  private selectOnlyRegion(regionId: number) {
    if (this.regionId()) return;
    this.regionId.set(regionId);
    this.locationService
      .getDistrictsByRegion(regionId)
      .subscribe((districts) => this.districts.set(districts));
    // Deliberately not emitted: some listings predate the location feature and carry no region, so
    // scoping the default query to the preselected city would hide them. The preselect exists only
    // to unblock the district dropdown; scoping starts when the user actually picks something.
  }

  onRegionChange(value: string) {
    this.regionUserSet = true;
    this.regionId.set(value ? Number(value) : null);
    this.districtId.set(null);
    this.placeId.set(null);
    this.districts.set([]);
    this.places.set([]);
    const regionId = this.regionId();
    if (regionId) {
      this.locationService
        .getDistrictsByRegion(regionId)
        .subscribe((districts) => this.districts.set(districts));
    }
    this.emitCriteria();
  }

  onDistrictChange(value: string) {
    this.districtId.set(value ? Number(value) : null);
    this.placeId.set(null);
    this.places.set([]);
    this.placesLoaded.set(false);
    const districtId = this.districtId();
    if (districtId) {
      this.locationService.getPlacesByDistrict(districtId).subscribe((places) => {
        this.places.set(places);
        this.placesLoaded.set(true);
      });
    }
    this.emitCriteria();
  }

  onPlaceChange(value: string) {
    this.placeId.set(value ? Number(value) : null);
    this.emitCriteria();
  }

  reset() {
    this.regionUserSet = false;
    this.regionId.set(null);
    this.districtId.set(null);
    this.placeId.set(null);
    this.districts.set([]);
    this.places.set([]);
    this.placesLoaded.set(false);
    this.types.set([]);
    this.priceFrom.set(null);
    this.priceTo.set(null);
    this.roomsFrom.set(null);
    this.floorFrom.set(null);
    this.amenities.set([]);
    this.emitCriteria();
  }

  private emitCriteria() {
    this.filterChange.emit({
      regionId: this.regionUserSet ? this.regionId() : null,
      districtId: this.districtId(),
      placeId: this.placeId(),
      types: this.types(),
      priceFrom: this.priceFrom(),
      priceTo: this.priceTo(),
      roomsFrom: this.roomsFrom(),
      floorFrom: this.floorFrom(),
      amenities: this.amenities(),
    });
  }
}
