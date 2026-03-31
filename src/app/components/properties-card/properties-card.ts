import { Component, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { PropertyCard } from '../property-card/property-card';
import { ModalComponent } from '../../components/modal/modal.component';
import { ViewProperty } from '../../components/view-property-models/view-property/view-property';
import { BaseModalComponent } from '../modal/baseModal';

@Component({
  selector: 'app-properties-card',
  imports: [PropertyCard, ModalComponent, ViewProperty],
  templateUrl: './properties-card.html',
  styleUrl: './properties-card.scss',
})
export class PropertiesCard extends BaseModalComponent {
  @Input() properties?: Property[];
  isViewPropertyModalOpen: boolean = false;
  selectedProperty: Property | null = null;

  constructor() {
    super();
  }

  override closeModal(): void {
    this.isViewPropertyModalOpen = false;
    this.selectedProperty = null;
    super.closeModal();
  }

  openViewPropertyModal(property: Property): void {
    this.selectedProperty = property;
    this.isViewPropertyModalOpen = true;
  }
}
