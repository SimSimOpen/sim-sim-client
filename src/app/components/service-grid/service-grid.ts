import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceItem } from '../../shared/models/services';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { ServiceCard } from '../service-card/service-card';
import { ModalComponent } from '../modal/modal.component';
import { ViewService } from '../view-service/view-service';

/** Services counterpart of AdGrid: results, load-more, empty and loading states, and the detail modal. */
@Component({
  selector: 'app-service-grid',
  imports: [CommonModule, ServiceCard, ModalComponent, ViewService, TranslatePipe],
  templateUrl: './service-grid.html',
})
export class ServiceGrid {
  @Input() items: ServiceItem[] = [];
  @Input() totalFound = 0;
  @Input() hasMore = false;
  @Input() loading = false;
  @Output() loadMore = new EventEmitter<void>();

  selected: ServiceItem | null = null;

  open(item: ServiceItem) {
    this.selected = item;
  }

  close() {
    this.selected = null;
  }
}
