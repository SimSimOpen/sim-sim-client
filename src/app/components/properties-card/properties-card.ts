import { ChangeDetectorRef, Component, inject, Input } from '@angular/core';
import { Property } from '../../shared/models/properties';
import { PropertyCard } from '../property-card/property-card';
import { ModalComponent } from '../../components/modal/modal.component';
import { ViewProperty } from '../../components/view-property-models/view-property/view-property';
import { BaseModalComponent } from '../modal/baseModal';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { ProductStateService } from '../../shared/services/product/state/product-state.service';

@Component({
  selector: 'app-properties-card',
  imports: [PropertyCard, ModalComponent, ViewProperty],
  templateUrl: './properties-card.html',
  styleUrl: './properties-card.scss',
})
export class PropertiesCard extends BaseModalComponent {
  isViewPropertyModalOpen: boolean = false;
  selectedProperty: Property | null = null;

  private productApiService = inject(ProductApiService);
  public productStateService = inject(ProductStateService);

  private ctr = inject(ChangeDetectorRef);
  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.productApiService.getAllProperties(0, 6).subscribe((data) => {
      this.productStateService.setProperties(data.content);
      this.ctr.detectChanges();
    });
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
