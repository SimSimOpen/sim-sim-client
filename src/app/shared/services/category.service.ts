import { computed, inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import {
  CATEGORIES,
  MarketplaceCategory,
  MarketplaceCategoryDTO,
} from '../constants/categories';
import { PRODUCT_URL } from '../constants/urls';

/**
 * Marketplace categories, and which one (if any) the user is currently inside.
 *
 * The local CATEGORIES list renders immediately and covers what only the frontend knows (icons,
 * colours, section nav). The backend then supplies the editable content, ordering, availability and
 * listing counts. If the request fails, the local list is used as is.
 */
@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private router = inject(Router);
  private http = inject(HttpClient);

  readonly categories = signal<MarketplaceCategory[]>(CATEGORIES);

  private url = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  readonly current = computed<MarketplaceCategory | undefined>(() => {
    const firstSegment = this.url().split(/[/?#]/)[1];
    return this.categories().find((c) => c.slug === firstSegment);
  });

  constructor() {
    this.http.get<MarketplaceCategoryDTO[]>(`${PRODUCT_URL}/v1/category/all`).subscribe({
      next: (remote) => this.categories.set(this.merge(remote)),
      error: () => {
        // Keep the built-in list; the home page still works without the backend.
      },
    });
  }

  private merge(remote: MarketplaceCategoryDTO[]): MarketplaceCategory[] {
    const bySlug = new Map(remote.map((dto) => [dto.slug, dto]));
    return CATEGORIES.filter((local) => bySlug.has(local.slug))
      .map((local) => {
        const dto = bySlug.get(local.slug)!;
        return {
          ...local,
          title: dto.title ?? local.title,
          tagline: dto.tagline ?? local.tagline,
          description: dto.description ?? local.description,
          imageUrl: dto.imageUrl || local.imageUrl,
          // Live only when the backend enables it AND this app has pages for it.
          available: dto.available && local.available,
          listingCount: dto.listingCount,
          sortOrder: dto.sortOrder,
        };
      })
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }
}
