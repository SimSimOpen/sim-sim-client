import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { catchError, forkJoin, map, of } from 'rxjs';
import { AdGrid } from '../../components/ad-grid/ad-grid';
import { CarGrid } from '../../components/car-grid/car-grid';
import { SecondHandGrid } from '../../components/second-hand-grid/second-hand-grid';
import { ServiceGrid } from '../../components/service-grid/service-grid';
import { I18nService } from '../../shared/i18n/i18n.service';
import { TranslatePipe } from '../../shared/i18n/translate.pipe';
import { Car } from '../../shared/models/cars';
import { Property } from '../../shared/models/properties';
import { SecondHandItem } from '../../shared/models/second-hand';
import { ServiceItem } from '../../shared/models/services';
import { EngagementService, SavedListing } from '../../shared/services/engagement.service';
import { Common } from '../../shared/common';

interface LoadedListing extends SavedListing {
  listing: unknown;
}

/** What this browser has saved, grouped by section. Listings no longer live are simply left out. */
@Component({
  selector: 'app-saved',
  imports: [AdGrid, CarGrid, SecondHandGrid, ServiceGrid, TranslatePipe],
  templateUrl: './saved.html',
})
export class Saved {
  private engagement = inject(EngagementService);
  readonly common = inject(Common);

  private readonly fetched = signal<LoadedListing[]>([]);
  readonly loading = signal(true);

  /** Fetched once per language, then narrowed live so un-saving removes the card immediately. */
  private readonly listings = computed(() =>
    this.fetched().filter((l) => this.engagement.isSaved(l.kind, l.listingId)),
  );
  readonly properties = computed(() => this.ofKind<Property>('PROPERTY'));
  readonly cars = computed(() => this.ofKind<Car>('CAR'));
  readonly secondHand = computed(() => this.ofKind<SecondHandItem>('SECOND_HAND'));
  readonly services = computed(() => this.ofKind<ServiceItem>('SERVICE'));
  readonly isEmpty = computed(() => !this.loading() && this.listings().length === 0);

  constructor() {
    const i18n = inject(I18nService);
    effect(() => {
      i18n.lang();
      if (this.engagement.loaded()) untracked(() => this.load());
    });
  }

  private load() {
    const saved = this.engagement.saved();
    if (!saved.length) {
      this.fetched.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    forkJoin(
      saved.map((s) =>
        this.engagement.getListing<unknown>(s.kind, s.listingId).pipe(
          map((listing) => ({ ...s, listing })),
          catchError(() => of(null)),
        ),
      ),
    ).subscribe((results) => {
      this.fetched.set(results.filter((r): r is LoadedListing => r !== null));
      this.loading.set(false);
    });
  }

  private ofKind<T>(kind: SavedListing['kind']): T[] {
    return this.listings()
      .filter((l) => l.kind === kind)
      .map((l) => l.listing as T);
  }
}
