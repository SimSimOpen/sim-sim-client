import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { EnvironmentTs } from '../../environments/environment';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-property-card',
  imports: [CommonModule],
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
        return 'For Sale';
      case OfferType.FOR_RENT:
        return 'For Rent';
      default:
        return 'Jimi';
    }
  }
  get propertyMediaLength() {
    return this.property?.medias?.length ? this.property.medias.length - 1 : 0;
  }
}
