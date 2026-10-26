import { Component, computed, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Car } from '../../shared/models/cars';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { CarApiService } from '../../shared/services/car/car-api.service';
import { GlobalService } from '../../shared/services/global.service';
import { YandexMapComponent } from '../view-property-models/yandex-map';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-view-car',
  imports: [CommonModule, YandexMapComponent, TranslatePipe],
  templateUrl: './view-car.html',
  styleUrl: '../view-property-models/view-property/view-property.scss',
  host: {
    '(document:keydown)': 'handleKeydown($event)',
  },
})
export class ViewCar implements OnInit {
  readonly car = input.required<Car>();
  @Output() closeModal = new EventEmitter<void>();

  private carApi = inject(CarApiService);
  private global = inject(GlobalService);
  readonly OfferType = OfferType;

  readonly views = signal(0);
  readonly selected = signal(0);

  /** Lightbox state, mirroring the property modal so every product zooms the same way. */
  selectedImageIndex: number | null = null;
  allImages: string[] = [];

  /** Cover first, then the rest in upload order. */
  readonly images = computed(() => {
    const medias = this.car().medias ?? [];
    const sorted = [...medias.filter((m) => m.isCoverImage), ...medias.filter((m) => !m.isCoverImage)];
    return sorted.length
      ? sorted.map((m) => m.mediaUrl)
      : [`${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`];
  });

  readonly name = computed(() => {
    const c = this.car();
    return [c.brand, c.model, c.year].filter(Boolean).join(' ') || c.title || '';
  });

  readonly address = computed(() => [...this.car().location].reverse().filter(Boolean).join(', '));

  /** [translation key, already-translated-or-raw value, is the value an enum key] */
  readonly specs = computed(() => {
    const c = this.car();
    const rows: { label: string; value: string | null; enumKey?: boolean }[] = [
      { label: 'cars.year', value: c.year != null ? String(c.year) : null },
      { label: 'cars.mileage', value: c.mileage != null ? c.mileage.toLocaleString() : null },
      { label: 'cars.bodyType', value: c.bodyType, enumKey: true },
      { label: 'cars.fuelType', value: c.fuelType, enumKey: true },
      { label: 'cars.transmission', value: c.transmission, enumKey: true },
      { label: 'cars.driveType', value: c.driveType, enumKey: true },
      { label: 'cars.engineVolume', value: c.engineVolume != null ? String(c.engineVolume) : null },
      { label: 'cars.color', value: c.color },
      { label: 'cars.condition', value: c.condition, enumKey: true },
      { label: 'cars.customsCleared', value: c.customsCleared == null ? null : c.customsCleared ? 'cars.yes' : 'cars.no' },
    ];
    return rows.filter((r) => !!r.value);
  });

  get hasPoint(): boolean {
    return this.car().latitude != null && this.car().longitude != null;
  }

  ngOnInit() {
    this.views.set(this.car().views);
    this.carApi.incrementViews(this.car().id).subscribe({
      next: (views) => this.views.set(views),
      error: () => {
        // A missed view count must not break the page.
      },
    });
  }

  prev() {
    this.selected.update((i) => (i - 1 + this.images().length) % this.images().length);
  }

  next() {
    this.selected.update((i) => (i + 1) % this.images().length);
  }

  openLightbox(index: number) {
    this.allImages = this.images();
    this.selectedImageIndex = index;
    document.body.style.overflow = 'hidden';
    this.global.ProductImageOpened = true;
  }

  closeLightbox() {
    this.selectedImageIndex = null;
    this.allImages = [];
    document.body.style.overflow = '';
    this.global.ProductImageOpened = false;
  }

  prevImage(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedImageIndex !== null && this.selectedImageIndex > 0) {
      this.selectedImageIndex--;
    } else {
      this.selectedImageIndex = this.allImages.length - 1; // wrap around
    }
  }

  nextImage(event: MouseEvent) {
    event.stopPropagation();
    if (this.selectedImageIndex !== null && this.selectedImageIndex < this.allImages.length - 1) {
      this.selectedImageIndex++;
    } else {
      this.selectedImageIndex = 0; // wrap around
    }
  }

  get selectedImage(): string | null {
    if (this.selectedImageIndex === null) return null;
    return this.allImages[this.selectedImageIndex] ?? null;
  }

  /** Arrow keys walk the lightbox; Escape closes it (the modal itself stays open). */
  handleKeydown(event: Event) {
    if (!(event instanceof KeyboardEvent) || this.selectedImageIndex === null) return;
    switch (event.key) {
      case 'Escape':
        this.closeLightbox();
        break;
      case 'ArrowRight':
        this.nextImage(new MouseEvent('click', { bubbles: true }));
        break;
      case 'ArrowLeft':
        this.prevImage(new MouseEvent('click', { bubbles: true }));
        break;
    }
  }
}
