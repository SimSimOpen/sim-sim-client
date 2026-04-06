import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { PropertiesCard } from '../../components/properties-card/properties-card';
import { Property } from '../../shared/models/properties';
import { SearchSection } from '../../components/search-section/search-section';
import { PropertyType } from '../../shared/enums/PropertyStatus';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { ProductStateService } from '../../shared/services/product/state/product-state.service';

@Component({
  selector: 'app-landing',
  imports: [PropertiesCard, SearchSection],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  viewMode: 'card' | 'list' = 'card';

  private productApiService = inject(ProductApiService);
  private productStateService = inject(ProductStateService);
}
