import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { ProductStateService } from '../../shared/services/product/state/product-state.service';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { BaseModalComponent } from '../../components/modal/baseModal';
import { Property } from '../../shared/models/properties';
import { Filter } from './filter';
import { PropertyCard } from '../../components/property-card/property-card';
import { ModalComponent } from '../../components/modal/modal.component';
import { ViewProperty } from '../../components/view-property-models/view-property/view-property';

@Component({
  selector: 'app-browse',
  imports: [CommonModule, Filter, PropertyCard, ModalComponent, ViewProperty],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class Browse extends BaseModalComponent {
  isFilterOpen: boolean = false;
  filteredProperties: Property[] = [];

  isViewPropertyModalOpen: boolean = false;
  selectedProperty: Property | null = null;

  ngOnInit() {
    this.loadProperties();
  }

  private productApiService = inject(ProductApiService);
  public productStateService = inject(ProductStateService);
  private ctr = inject(ChangeDetectorRef);

  loadProperties() {
    this.productApiService.getAllProperties(0, 12).subscribe((data) => {
      this.filteredProperties = data.content;
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
