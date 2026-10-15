import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CATEGORIES, findCategory, MarketplaceCategory } from '../../shared/constants/categories';
import { CategoryIcon } from '../../components/category-icon/category-icon';

@Component({
  selector: 'app-coming-soon',
  imports: [RouterLink, CategoryIcon],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export class ComingSoon {
  private route = inject(ActivatedRoute);

  readonly category: MarketplaceCategory | undefined = findCategory(
    this.route.snapshot.data['category'],
  );
  readonly liveCategories = CATEGORIES.filter((c) => c.available);
}
