import { Component, computed, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceItem } from '../../shared/models/services';
import { PriceMode, ServiceKind } from '../../shared/enums/Services';
import { ServicesApiService } from '../../shared/services/services/services-api.service';
import { GlobalService } from '../../shared/services/global.service';
import { YandexMapComponent } from '../view-property-models/yandex-map';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-view-service',
  imports: [CommonModule, YandexMapComponent, TranslatePipe],
  templateUrl: './view-service.html',
  styleUrl: '../view-property-models/view-property/view-property.scss',
  host: {
    '(document:keydown)': 'handleKeydown($event)',
  },
})
export class ViewService implements OnInit {
  readonly item = input.required<ServiceItem>();
  @Output() closeModal = new EventEmitter<void>();

  private itemApi = inject(ServicesApiService);
  private global = inject(GlobalService);
  readonly ServiceKind = ServiceKind;
  readonly PriceMode = PriceMode;

  readonly views = signal(0);
  readonly selected = signal(0);

  /** Lightbox state, mirroring the property modal so every product zooms the same way. */
  selectedImageIndex: number | null = null;
  allImages: string[] = [];

  /** Cover first, then the rest in upload order. Photos are optional; fall back to the placeholder. */
  readonly images = computed(() => {
    const medias = this.item().medias ?? [];
    const sorted = [...medias.filter((m) => m.isCoverImage), ...medias.filter((m) => !m.isCoverImage)];
    return sorted.length
      ? sorted.map((m) => m.mediaUrl)
      : [`${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`];
  });

  readonly name = computed(() => this.item().title || '');

  readonly address = computed(() => [...this.item().location].reverse().filter(Boolean).join(', '));

  readonly isSeeking = computed(() => this.item().kind === ServiceKind.SEEKING);

  /** "$40" when the listing has a concrete price; null renders the Negotiable fallback. */
  readonly priceAmount = computed(() => {
    const i = this.item();
    if (i.price == null || i.priceMode == null || i.priceMode === PriceMode.NEGOTIABLE) return null;
    return `$${new Intl.NumberFormat('en-US').format(i.price)}`;
  });

  readonly isHourly = computed(() => this.item().priceMode === PriceMode.HOURLY);

  /** On a SEEKING listing the price is the poster's budget; on OFFERING it is their rate. */
  readonly priceCaption = computed(() => {
    if (this.isSeeking()) return 'services.budget';
    if (this.isHourly()) return 'enum.priceMode.HOURLY';
    if (this.priceAmount() == null) return 'enum.priceMode.NEGOTIABLE';
    return 'enum.priceMode.FIXED';
  });

  /** The poster is a provider on OFFERING listings and a client on SEEKING ones. */
  readonly posterLabel = computed(() =>
    this.isSeeking() ? 'services.client' : 'services.provider',
  );

  /** [translation key, value, prefix of the enum.* block the value is rendered from] */
  readonly specs = computed(() => {
    const i = this.item();
    const rows: { label: string; value: string | null; enumPrefix?: string }[] = [
      { label: 'services.category', value: i.category, enumPrefix: 'enum.service.' },
      { label: 'services.kind', value: i.kind, enumPrefix: 'enum.serviceKind.' },
      { label: 'services.priceMode', value: i.priceMode, enumPrefix: 'enum.priceMode.' },
    ];
    return rows.filter((r) => !!r.value);
  });

  get hasPoint(): boolean {
    return this.item().latitude != null && this.item().longitude != null;
  }

  ngOnInit() {
    this.views.set(this.item().views);
    this.itemApi.incrementViews(this.item().id).subscribe({
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
