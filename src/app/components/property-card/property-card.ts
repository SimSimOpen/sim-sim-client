import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { EnvironmentTs } from '../../environments/environment';

@Component({
  selector: 'app-property-card',
  imports: [],
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
}
