import { ChangeDetectorRef, Component } from '@angular/core';
import { PropertiesCard } from '../../components/properties-card/properties-card';
import { Property } from '../../shared/models/properties';
import { ProductService } from '../../shared/services/product.service';
import { SearchSection } from '../../components/search-section/search-section';

@Component({
  selector: 'app-landing',
  imports: [PropertiesCard, SearchSection],
  templateUrl: './landing.html',
  styleUrl: './landing.scss',
})
export class Landing {
  viewMode: 'card' | 'list' = 'card';
  properties?: Property[];

  constructor(
    private productService: ProductService,
    private ctr: ChangeDetectorRef,
  ) {
    this.loadProperties();
  }

  loadProperties() {
    this.productService.getAllProperties(0, 10).subscribe((data) => {
      this.properties = data.content;
      this.ctr.detectChanges();
    });
  }
}
