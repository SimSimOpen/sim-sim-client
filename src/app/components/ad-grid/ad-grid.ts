import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Property } from '../../shared/models/properties';
import { TranslationKey } from '../../shared/i18n/translations';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { PropertyCard } from '../property-card/property-card';
import { ModalComponent } from '../modal/modal.component';
import { ViewProperty } from '../view-property-models/view-property/view-property';

@Component({
  selector: 'app-ad-grid',
  imports: [CommonModule, PropertyCard, ModalComponent, ViewProperty, TranslatePipe],
  templateUrl: './ad-grid.html',
})
export class AdGrid {
  @Input() ads: Property[] = [];
  @Input() totalFound = 0;
  @Input() hasMore = false;
  @Input() loading = false;
  @Input() countKey: TranslationKey = 'category.adsFound';
  @Input() loadMoreLabel: TranslationKey = 'category.loadMore';
  @Input() emptyTitle: TranslationKey = 'category.emptyTitle';
  @Input() emptyBody: TranslationKey = 'category.emptyBody';
  @Output() loadMore = new EventEmitter<void>();

  isViewPropertyModalOpen = false;
  selectedProperty: Property | null = null;

  openViewPropertyModal(property: Property): void {
    this.selectedProperty = property;
    this.isViewPropertyModalOpen = true;
    setTimeout(() => {
      const modalContent = document.querySelector('.view-property-component') as HTMLElement;
      if (modalContent) modalContent.scrollTop = 0;
    }, 50);
  }

  closeModal(): void {
    this.isViewPropertyModalOpen = false;
    this.selectedProperty = null;
  }
}
