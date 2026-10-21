import { Component, effect, inject, OnDestroy, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { CategoryService } from '../../shared/services/category.service';
import { ProductApiService } from '../../shared/services/product/state/product-api.service';
import { I18nService } from '../../shared/i18n/i18n.service';
import { CategoryIcon } from '../../components/category-icon/category-icon';
import { AdGrid } from '../../components/ad-grid/ad-grid';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { Property } from '../../shared/models/properties';
import { ListingStatus } from '../../shared/enums/PropertyStatus';
import { categoryThumb } from '../../shared/constants/categories';

const PAGE_SIZE = 12;
const RECENT_SORT = 'createdAt,desc';

@Component({
  selector: 'app-home',
  imports: [RouterLink, CategoryIcon, AdGrid, TranslatePipe],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnDestroy {
  readonly categoryService = inject(CategoryService);
  readonly categories = this.categoryService.categories;
  readonly thumb = categoryThumb;

  recentAds = signal<Property[]>([]);
  totalFound = signal(0);
  hasMore = signal(false);
  isLoading = signal(false);

  private productApiService = inject(ProductApiService);
  private page = 0;
  private requestSub?: Subscription;

  constructor() {
    // Listing addresses come back in the UI language, so reload the recent ads when it changes.
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      untracked(() => this.fetch(0, false));
    });
  }

  ngOnDestroy(): void {
    this.requestSub?.unsubscribe();
  }

  loadMore(): void {
    this.fetch(this.page + 1, true);
  }

  private fetch(page: number, append: boolean) {
    // Drop any in-flight request so a slow earlier response can't overwrite newer results.
    this.requestSub?.unsubscribe();
    this.isLoading.set(true);
    this.requestSub = this.productApiService
      .filterProperties(
        { search: '', listingStatus: ListingStatus.ACTIVE, type: null },
        page,
        PAGE_SIZE,
        RECENT_SORT,
      )
      .subscribe({
        next: (data) => {
          this.recentAds.set(append ? [...this.recentAds(), ...data.content] : data.content);
          this.page = data.number;
          this.totalFound.set(data.totalElements);
          this.hasMore.set(!data.last);
          this.isLoading.set(false);
        },
        error: () => {
          this.isLoading.set(false);
        },
      });
  }
}
