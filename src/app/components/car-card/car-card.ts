import { CardGallery } from '../card-gallery/card-gallery';
import { ViewCount } from '../view-count/view-count';
import { PricesPipe } from '../../shared/utils/price';
import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Car } from '../../shared/models/cars';
import { OfferType } from '../../shared/enums/PropertyStatus';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';

@Component({
  selector: 'app-car-card',
  imports: [CardGallery, ViewCount, PricesPipe, CommonModule, TranslatePipe],
  templateUrl: './car-card.html',
})
export class CarCard {
  readonly car = input.required<Car>();
  readonly OfferType = OfferType;


  readonly name = computed(() => {
    const c = this.car();
    return [c.brand, c.model].filter(Boolean).join(' ') || c.title || '';
  });

  readonly place = computed(() =>
    this.car().location.slice(0, 2).filter(Boolean).reverse().join(', '),
  );
}
