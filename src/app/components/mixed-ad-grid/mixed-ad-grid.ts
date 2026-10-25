import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../shared/models/properties';
import { Car } from '../../shared/models/cars';
import { SecondHandItem } from '../../shared/models/second-hand';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { PropertyCard } from '../property-card/property-card';
import { CarCard } from '../car-card/car-card';
import { SecondHandCard } from '../second-hand-card/second-hand-card';
import { ModalComponent } from '../modal/modal.component';
import { ViewProperty } from '../view-property-models/view-property/view-property';
import { ViewCar } from '../view-car/view-car';
import { ViewSecondHand } from '../view-second-hand/view-second-hand';

/**
 * One entry of the landing's mixed feed. Exactly one of `property` / `car` / `item` is set, but they
 * are modelled as optional fields (rather than a discriminated union) so the template can narrow with
 * a simple truthiness check and still satisfy strict null checks on the card inputs.
 */
export interface AdItem {
  kind: 'property' | 'car' | 'second-hand';
  id: number;
  /** ISO publish timestamp; the feed is sorted by this, newest first. */
  createdAt: string;
  property?: Property;
  car?: Car;
  item?: SecondHandItem;
}

/**
 * Renders property, car and second-hand ads together in a single grid (interleaved by publish date by
 * the caller), with load-more, empty and loading states, plus a detail modal for each ad kind.
 */
@Component({
  selector: 'app-mixed-ad-grid',
  imports: [
    CommonModule,
    PropertyCard,
    CarCard,
    SecondHandCard,
    ModalComponent,
    ViewProperty,
    ViewCar,
    ViewSecondHand,
    TranslatePipe,
  ],
  templateUrl: './mixed-ad-grid.html',
})
export class MixedAdGrid {
  @Input() ads: AdItem[] = [];
  @Input() totalFound = 0;
  @Input() hasMore = false;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<void>();

  selected: AdItem | null = null;

  trackAd = (_: number, ad: AdItem) => `${ad.kind}-${ad.id}`;

  get selectedProperty(): Property | null {
    return this.selected?.property ?? null;
  }

  get selectedCar(): Car | null {
    return this.selected?.car ?? null;
  }

  get selectedItem(): SecondHandItem | null {
    return this.selected?.item ?? null;
  }

  open(ad: AdItem): void {
    this.selected = ad;
    if (ad.property) {
      setTimeout(() => {
        const modalContent = document.querySelector('.view-property-component') as HTMLElement;
        if (modalContent) modalContent.scrollTop = 0;
      }, 50);
    }
  }

  close(): void {
    this.selected = null;
  }
}
