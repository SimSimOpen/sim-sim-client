import { Component, computed, EventEmitter, inject, input, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondHandItem } from '../../shared/models/second-hand';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { SecondHandApiService } from '../../shared/services/second-hand/second-hand-api.service';
import { GlobalService } from '../../shared/services/global.service';
import { YandexMapComponent } from '../view-property-models/yandex-map';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-view-second-hand',
  imports: [CommonModule, YandexMapComponent, TranslatePipe],
  templateUrl: './view-second-hand.html',
  styleUrl: '../view-property-models/view-property/view-property.scss',
  host: {
    '(document:keydown)': 'handleKeydown($event)',
  },
})
export class ViewSecondHand implements OnInit {
  readonly item = input.required<SecondHandItem>();
  @Output() closeModal = new EventEmitter<void>();

  private itemApi = inject(SecondHandApiService);
  private global = inject(GlobalService);
  readonly OfferType = OfferType;

  readonly views = signal(0);
  readonly selected = signal(0);

  /** Lightbox state, mirroring the property modal so every product zooms the same way. */
  selectedImageIndex: number | null = null;
  allImages: string[] = [];

  /** Cover first, then the rest in upload order. */
  readonly images = computed(() => {
    const medias = this.item().medias ?? [];
    const sorted = [...medias.filter((m) => m.isCoverImage), ...medias.filter((m) => !m.isCoverImage)];
    return sorted.length
      ? sorted.map((m) => m.mediaUrl)
      : [`${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`];
  });

  readonly name = computed(() => this.item().title || '');

  readonly address = computed(() => [...this.item().location].reverse().filter(Boolean).join(', '));

  /** [translation key, value, is the value an enum key rendered via enum.secondhand.*] */
  readonly specs = computed(() => {
    const i = this.item();
    const rows: { label: string; value: string | null; enumKey?: boolean }[] = [
      { label: 'secondHand.subCategory', value: i.subCategory, enumKey: true },
      { label: 'secondHand.condition', value: i.condition, enumKey: true },
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
