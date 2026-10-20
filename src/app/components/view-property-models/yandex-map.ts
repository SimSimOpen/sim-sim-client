import {
  AfterViewInit,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { YandexMapsLoaderService } from '../../shared/services/yandex-maps-loader.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

/** Waits for the address to stop changing (e.g. while a form is being filled in) before geocoding. */
const GEOCODE_DEBOUNCE_MS = 400;
/** Initial viewport for a listing that carries neither coordinates nor a resolvable address. */
const TASHKENT = { lon: 69.2401, lat: 41.2995 };

@Component({
  selector: 'app-yandex-map',
  imports: [TranslatePipe],
  template: `<div class="relative w-full my-4 aspect-video">
    <div class="border border-gray-400 rounded-2xl overflow-hidden w-full h-full" #mapContainer></div>
    @if (error()) {
      <div
        class="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-50 border border-gray-200 text-sm text-gray-500 text-center px-6"
      >
        {{ error()! | t }}
      </div>
    }
  </div>`,
})
export class YandexMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() latitude: number | null = null;
  @Input() longitude: number | null = null;
  @Input() zoom = 13;
  @Input() address = '';

  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLElement>;

  readonly error = signal<string | null>(null);

  private loader = inject(YandexMapsLoaderService);
  private ymaps: any;
  private mapInstance: any;
  private markerElement: any;
  private geocodeTimer?: ReturnType<typeof setTimeout>;
  /** Incremented per geocode so a slow, outdated response can't move the marker back. */
  private geocodeRequestId = 0;
  private destroyed = false;

  async ngAfterViewInit() {
    try {
      this.ymaps = await this.loader.load();
    } catch (err) {
      console.error(err);
      this.error.set('map.unavailable');
      return;
    }
    if (this.destroyed) return;
    this.initMap();
  }

  ngOnChanges(changes: SimpleChanges) {
    // The first value is handled by initMap; later ones (form edits, a different property) re-locate.
    if (!this.mapInstance) return;
    if (changes['address'] || changes['latitude'] || changes['longitude']) {
      this.locate();
    }
  }

  private initMap() {
    const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer } = this.ymaps;

    this.mapInstance = new YMap(this.mapContainer.nativeElement, {
      location: {
        center: this.hasPoint() ? [this.longitude!, this.latitude!] : [TASHKENT.lon, TASHKENT.lat],
        zoom: this.zoom,
      },
    });

    this.mapInstance.addChild(new YMapDefaultSchemeLayer());
    this.mapInstance.addChild(new YMapDefaultFeaturesLayer());

    this.locate();
  }

  private locate() {
    clearTimeout(this.geocodeTimer);
    // The agent picked this point on the admin map, so it wins over geocoding: resolving the
    // address text drifts the pin to a nearby building. Geocoding stays as a fallback only.
    if (this.hasPoint()) {
      this.showPoint(this.longitude!, this.latitude!);
      return;
    }
    if (this.hasAddress()) {
      this.geocodeTimer = setTimeout(() => this.geocodeAddress(this.address), GEOCODE_DEBOUNCE_MS);
    }
  }

  private hasPoint(): boolean {
    return this.latitude != null && this.longitude != null;
  }

  private hasAddress(): boolean {
    return !!this.address && this.address.trim() !== '' && this.address !== 'null';
  }

  private showPoint(lon: number, lat: number) {
    this.setCenter(lon, lat, 15);
    this.placeMarker(lon, lat);
  }

  private createMarkerElement(): HTMLElement {
    const el = document.createElement('div');
    el.style.cssText = `
      width: 28px;
      height: 28px;
      background: #e63b3b;
      border: 3px solid #fff;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 6px rgba(0,0,0,0.35);
      cursor: pointer;
    `;
    return el;
  }

  private placeMarker(lon: number, lat: number) {
    const { YMapMarker } = this.ymaps;

    if (this.markerElement) {
      this.mapInstance.removeChild(this.markerElement);
    }

    this.markerElement = new YMapMarker(
      {
        coordinates: [lon, lat],
        anchor: [0.5, 1], // bottom-center of the pin tip
      },
      this.createMarkerElement(),
    );

    this.mapInstance.addChild(this.markerElement);
  }

  private setCenter(lon: number, lat: number, zoom?: number) {
    if (!this.mapInstance) return;
    this.mapInstance.update({
      location: {
        center: [lon, lat],
        zoom: zoom ?? this.zoom,
        duration: 300,
      },
    });
  }

  /**
   * Uses the JS API's own search, which runs on the same key as the map. The separate Geocoder
   * HTTP API (geocode-maps.yandex.ru) needs its own key, and the map key is rejected there.
   */
  private async geocodeAddress(address: string) {
    const requestId = ++this.geocodeRequestId;
    try {
      const results = await this.ymaps.search({ text: address, limit: 1 });
      if (requestId !== this.geocodeRequestId || this.destroyed) return;

      const coordinates = results?.[0]?.geometry?.coordinates;
      if (!coordinates) return;
      const [lon, lat] = coordinates;
      this.showPoint(lon, lat);
    } catch (err) {
      console.error('Geocoding error:', err);
    }
  }

  ngOnDestroy() {
    this.destroyed = true;
    clearTimeout(this.geocodeTimer);
    this.mapInstance?.destroy?.();
  }
}
