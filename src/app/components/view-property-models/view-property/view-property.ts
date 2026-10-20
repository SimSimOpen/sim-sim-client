import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  inject,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { Property } from '../../../shared/models/properties';
import { CommonModule } from '@angular/common';
import { EnvironmentTs } from '../../../environments/environment';
import { ListingStatus, OfferType } from '../../../shared/enums/PropertyStatus';
import { AboutAgent } from '../view-property-agent';
import { AboutProperty } from '../view-property-about';
import { GlobalService } from '../../../shared/services/global.service';
import { ProductApiService } from '../../../shared/services/product/state/product-api.service';
import { YandexMapComponent } from '../yandex-map';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-view-property',
  imports: [CommonModule, AboutAgent, AboutProperty, YandexMapComponent, TranslatePipe],
  templateUrl: './view-property.html',
  styleUrl: './view-property.scss',
  host: {
    '(document:keydown)': 'handleEscape($event)',
  },
})
export class ViewProperty {
  @Input() property: Property | null = null;
  @Output() closeModal = new EventEmitter<any>();
  @ViewChild('mainContainer') mainContainer!: ElementRef<HTMLDivElement>;

  @ViewChild('scrollContainer') set scrollContainer(el: ElementRef<HTMLDivElement>) {
    if (el) {
      this._scrollContainer = el;
      this.attachScrollListener(el.nativeElement);
    } else {
      // element destroyed (@if became false)
      this.removeScrollListener();
      this.arrow = 'down'; // reset arrow
    }
  }
  arrow: 'down' | 'up' = 'down';
  private _scrollContainer?: ElementRef<HTMLDivElement>;
  private scrollListener?: () => void; // store reference
  hasScroll: boolean = false;

  selectedImageIndex: number | null = null;
  allImages: string[] = [];

  private ctr = inject(ChangeDetectorRef);
  private global = inject(GlobalService);

  private productApiServer = inject(ProductApiService);

  incrementViewCountOfProperty(): void {
    if (this.property && this.property.id) {
      this.productApiServer.updatePropertyViews(this.property.id).subscribe({
        next: (updatedViews) => {
          if (this.property) {
            this.property = { ...this.property, views: updatedViews };
            this.ctr.detectChanges();
          }
        },
        error: (err) => {
          console.error('Failed to update property views:', err);
        },
      });
    }
  }

  /** The backend sends the short address as [region, district, place, address]. */
  private get locationParts() {
    const [region, district, place, address] = this.property?.location ?? [];
    return { region, district, place, address };
  }

  get fullAddresForMap(): string {
    const { region, district, place, address } = this.locationParts;
    return [address, place, district, region].filter(Boolean).join(', ') || 'Tashkent, Uzbekistan';
  }

  private attachScrollListener(container: HTMLDivElement) {
    this.removeScrollListener();

    setTimeout(() => {
      this.hasScroll = container.scrollHeight > container.clientHeight;
      this.ctr.detectChanges();
    }, 200);

    this.scrollListener = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      this.arrow = isAtBottom ? 'up' : 'down';
      this.ctr.detectChanges();
    };

    container.addEventListener('scroll', this.scrollListener);

    // Check after images load
    setTimeout(() => this.ctr.detectChanges(), 100);
  }
  private removeScrollListener() {
    if (this._scrollContainer && this.scrollListener) {
      this._scrollContainer.nativeElement.removeEventListener('scroll', this.scrollListener);
      this.scrollListener = undefined;
    }
  }

  get selectedProperty() {
    if (!this.property) return null;
    const { region, district, place, address } = this.locationParts;
    const publishedDate = (this.property as any)['updatedAt'];
    return { ...this.property, place, district, region, address, dateListed: publishedDate };
  }

  get propertiesCoverImage() {
    var property = this.selectedProperty;
    var defaultPath = `${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`;
    if (property?.medias && property.medias.length > 0) {
      const coverImage = property.medias.find((media) => media.isCoverImage === true);
      return coverImage ? coverImage.mediaUrl : defaultPath;
    }
    return defaultPath;
  }
  get isRent() {
    return this.selectedProperty?.offerType === OfferType.FOR_RENT;
  }
  get isPublished() {
    return this.selectedProperty?.listingStatus === ListingStatus.ACTIVE;
  }
  ngOnInit() {
    this.incrementViewCountOfProperty();
  }

  ngOnDestroy() {
    this.removeScrollListener();
  }

  openLightbox(index: number) {
    // Build full image list: cover image first, then gallery images
    this.allImages = [
      this.propertiesCoverImage,
      ...(this.selectedProperty?.medias?.filter((m) => !m.isCoverImage).map((m) => m.mediaUrl) ??
        []),
    ];
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
  get offerTypeInText() {
    if (!this.property) return '';
    switch (this.property.offerType) {
      case OfferType.FOR_SALE:
        return 'enum.offer.FOR_SALE';
      case OfferType.FOR_RENT:
        return 'enum.offer.FOR_RENT';
      default:
        return 'common.notGiven';
    }
  }

  handleEscape(event: Event) {
    if (!(event instanceof KeyboardEvent)) return;
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
