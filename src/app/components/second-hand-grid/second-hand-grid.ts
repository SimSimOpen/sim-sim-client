import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SecondHandItem } from '../../shared/models/second-hand';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { SecondHandCard } from '../second-hand-card/second-hand-card';
import { ModalComponent } from '../modal/modal.component';
import { ViewSecondHand } from '../view-second-hand/view-second-hand';

/** Second-hand counterpart of AdGrid: results, load-more, empty and loading states, and the detail modal. */
@Component({
  selector: 'app-second-hand-grid',
  imports: [CommonModule, SecondHandCard, ModalComponent, ViewSecondHand, TranslatePipe],
  templateUrl: './second-hand-grid.html',
})
export class SecondHandGrid {
  @Input() items: SecondHandItem[] = [];
  @Input() totalFound = 0;
  @Input() hasMore = false;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<void>();

  selected: SecondHandItem | null = null;

  open(item: SecondHandItem) {
    this.selected = item;
  }

  close() {
    this.selected = null;
  }
}
