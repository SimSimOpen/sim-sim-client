import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Car } from '../../shared/models/cars';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { EnvironmentTs } from '../../environments/environment';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-car-card',
  imports: [CommonModule, TranslatePipe],
  templateUrl: './car-card.html',
})
export class CarCard {
  readonly car = input.required<Car>();
  readonly OfferType = OfferType;

  readonly cover = computed(() => {
    const medias = this.car().medias ?? [];
    return (
      (medias.find((m) => m.isCoverImage) ?? medias[0])?.mediaUrl ??
      `${EnvironmentTs.MEDIA_URL}/real-estate-media/default/house.png`
    );
  });

  readonly name = computed(() => {
    const c = this.car();
    return [c.brand, c.model].filter(Boolean).join(' ') || c.title || '';
  });

  readonly place = computed(() =>
    this.car().location.slice(0, 2).filter(Boolean).reverse().join(', '),
  );
}
