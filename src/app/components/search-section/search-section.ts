import { Component, inject } from '@angular/core';
import { getRandomLandingPageCoverImage } from '../../shared/constants/urls';
import { PropertyType } from '../../shared/enums/PropertyStatus';
import { ProductStateService } from '../../shared/services/product/state/product-state.service';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { SearchAndFilterService } from '../../shared/services/search-and-filter.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-section',
  imports: [FormsModule],
  templateUrl: './search-section.html',
  styleUrl: './search-section.scss',
})
export class SearchSection {
  coverImageUrl!: string;
  searchTerm: string = '';

  private productApiService = inject(ProductApiService);
  private productStateService = inject(ProductStateService);
  public searchAndFilterService = inject(SearchAndFilterService);

  ngOnInit() {
    this.coverImageUrl = getRandomLandingPageCoverImage();
  }

  get allTypes() {
    return Object.values(PropertyType);
  }

  onSearch() {
    this.searchAndFilterService.onFilterChange('search', { target: { value: this.searchTerm } });
  }
}
