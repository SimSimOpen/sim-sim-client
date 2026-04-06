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

@Component({
  selector: 'app-view-property',
  imports: [CommonModule, AboutAgent, AboutProperty],
  templateUrl: './view-property.html',
  styleUrl: './view-property.scss',
  host: {
    '(document:keydown)': 'handleEscape($event)',
  },
})
export class ViewProperty {
  @Input() property: Property | null = null;
  @Output() closeModal = new EventEmitter<any>();

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
    const place = (this.property as any)['location'][0];
    const district = (this.property as any)['location'][1];
    const region = (this.property as any)['location'][2];
    const publishedDate = (this.property as any)['updatedAt'];
    return { ...this.property, place, district, region, dateListed: publishedDate };
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
        return 'For Sale';
      case OfferType.FOR_RENT:
        return 'For Rent';
      default:
        return 'Not given';
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
