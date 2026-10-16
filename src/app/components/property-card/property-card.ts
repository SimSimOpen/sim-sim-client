import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { EnvironmentTs } from '../../environments/environment';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './property-card.html',
  styleUrl: './property-card.scss',
})
export class PropertyCard {
  @Input() property?: Property;

  get propertiesCoverImage() {
    var defaultPath = `${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`;
    if (this.property?.medias && this.property.medias.length > 0) {
      const coverImage = this.property.medias.find((media) => media.isCoverImage === true);
      return coverImage ? coverImage.mediaUrl : defaultPath;
    }
    return defaultPath;
  }
  get OfferType() {
    return OfferType;
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
  get propertyMediaLength() {
    return this.property?.medias?.length ? this.property.medias.length - 1 : 0;
  }
  get propertyViews() {
    return this.property?.views || 0;
  }
}
