import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Car } from '../../shared/models/cars';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { CarCard } from '../car-card/car-card';
import { ModalComponent } from '../modal/modal.component';
import { ViewCar } from '../view-car/view-car';

/** Car counterpart of AdGrid: results, load-more, empty and loading states, and the detail modal. */
@Component({
  selector: 'app-car-grid',
  imports: [CommonModule, CarCard, ModalComponent, ViewCar, TranslatePipe],
  templateUrl: './car-grid.html',
})
export class CarGrid {
  @Input() cars: Car[] = [];
  @Input() totalFound = 0;
  @Input() hasMore = false;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<void>();

  selected: Car | null = null;

  open(car: Car) {
    this.selected = car;
  }

  close() {
    this.selected = null;
  }
}
