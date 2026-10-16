import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, effect, inject, untracked, ViewChild } from '@angular/core';
import { I18nService } from '../../../shared/i18n/i18n.service';
import { ProductStateService } from '../../../shared/services/product/state/product-state.service';
import { ProductApiService } from '../../../shared/services/product/state/product-api.service';
import { BaseModalComponent } from '../../../components/modal/baseModal';
import { LocationSelection, Property } from '../../../shared/models/properties';
import { Subscription } from 'rxjs';
import { ListingStatus } from '../../../shared/enums/PropertyStatus';
import { Filter } from './filter';
import { TranslatePipe } from '../../../shared/i18n/translate.pipe';
import { PropertyCard } from '../../../components/property-card/property-card';
import { ModalComponent } from '../../../components/modal/modal.component';
import { ViewProperty } from '../../../components/view-property-models/view-property/view-property';

@Component({
  selector: 'app-browse',
  imports: [CommonModule, Filter, PropertyCard, ModalComponent, ViewProperty, TranslatePipe],
  templateUrl: './browse.html',
  styleUrl: './browse.scss',
})
export class Browse extends BaseModalComponent {
  @ViewChild(ModalComponent) modal!: ModalComponent;
  isFilterOpen: boolean = false;
  filteredProperties: Property[] = [];

  isViewPropertyModalOpen: boolean = false;
  selectedProperty: Property | null = null;

  private lastLocation: LocationSelection | null = null;

  constructor() {
    super();
    // Listing addresses come back in the UI language, so re-run the current query when it changes.
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      untracked(() =>
        this.lastLocation ? this.onLocationChange(this.lastLocation) : this.loadProperties(),
      );
    });
  }

  private productApiService = inject(ProductApiService);
  public productStateService = inject(ProductStateService);
  private ctr = inject(ChangeDetectorRef);

  private propertiesSub?: Subscription;

  loadProperties() {
    this.propertiesSub?.unsubscribe();
    this.propertiesSub = this.productApiService.getAllProperties(0, 12).subscribe((data) => {
      this.filteredProperties = data.content;
      this.ctr.detectChanges();
    });
  }

  onLocationChange(location: LocationSelection) {
    this.lastLocation = location;
    if (!location.regionId) {
      this.loadProperties();
      return;
    }
    // Drop any in-flight request so a slow earlier response can't overwrite newer results.
    this.propertiesSub?.unsubscribe();
    this.propertiesSub = this.productApiService
      .filterProperties(
        { search: '', listingStatus: ListingStatus.ACTIVE, type: null, ...location },
        0,
        12,
      )
      .subscribe((data) => {
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
    setTimeout(() => {
      const modalContent = document.querySelector('.view-property-component') as HTMLElement;
      if (modalContent) modalContent.scrollTop = 0;
    }, 50);
  }
}
