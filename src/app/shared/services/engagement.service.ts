import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { PRODUCT_URL } from '../constants/urls';
import { CategorySlug } from '../constants/categories';
import { getVisitorId } from './presence.service';

export type ListingKind = 'PROPERTY' | 'CAR' | 'SECOND_HAND' | 'SERVICE';

export interface SavedListing {
  kind: ListingKind;
  listingId: number;
}

const ENGAGEMENT_URL = `${PRODUCT_URL}/v1/engagement`;
const API_PATH: Record<ListingKind, string> = {
  PROPERTY: 'property',
  CAR: 'car',
  SECOND_HAND: 'second-hand',
  SERVICE: 'services',
};
const PAGE_SLUG: Record<ListingKind, CategorySlug> = {
  PROPERTY: 'real-estate',
  CAR: 'cars',
  SECOND_HAND: 'second-hand',
  SERVICE: 'services',
};

/** Saves and shares need no account: they belong to this browser's visitor id. */
@Injectable({ providedIn: 'root' })
export class EngagementService {
  private http = inject(HttpClient);
  private readonly visitorId = getVisitorId();
  private readonly params = { visitorId: this.visitorId };

  readonly saved = signal<SavedListing[]>([]);
  readonly loaded = signal(false);
  private readonly savedKeys = computed(
    () => new Set(this.saved().map((s) => key(s.kind, s.listingId))),
  );

  constructor() {
    this.http.get<SavedListing[]>(`${ENGAGEMENT_URL}/saved`, { params: this.params }).subscribe({
      next: (saved) => {
        this.saved.set(saved);
        this.loaded.set(true);
      },
      error: () => this.loaded.set(true),
    });
  }

  isSaved(kind: ListingKind, listingId: number): boolean {
    return this.savedKeys().has(key(kind, listingId));
  }

  /** Updates the screen at once and restores the previous state if the request fails. */
  toggleSaved(kind: ListingKind, listingId: number): Observable<unknown> {
    const previous = this.saved();
    const url = `${ENGAGEMENT_URL}/saved/${kind}/${listingId}`;
    if (this.isSaved(kind, listingId)) {
      this.saved.set(previous.filter((s) => key(s.kind, s.listingId) !== key(kind, listingId)));
      return this.http.delete(url, { params: this.params }).pipe(this.restoreOnError(previous));
    }
    this.saved.set([{ kind, listingId }, ...previous]);
    return this.http.put(url, null, { params: this.params }).pipe(this.restoreOnError(previous));
  }

  /** Statistics only, so a failure is not worth telling the visitor about. */
  recordShare(kind: ListingKind, listingId: number) {
    this.http
      .post(`${ENGAGEMENT_URL}/shares/${kind}/${listingId}`, null, { params: this.params })
      .subscribe({ error: () => undefined });
  }

  shareUrl(kind: ListingKind, listingId: number): string {
    return `${location.origin}/${PAGE_SLUG[kind]}?listing=${listingId}`;
  }

  /** A live listing by id, for opening a shared link or the saved page. */
  getListing<T>(kind: ListingKind, listingId: number): Observable<T> {
    return this.http.get<T>(`${PRODUCT_URL}/v1/${API_PATH[kind]}/${listingId}/public`);
  }

  private restoreOnError(previous: SavedListing[]) {
    return tap<unknown>({ error: () => this.saved.set(previous) });
  }
}

function key(kind: ListingKind, listingId: number): string {
  return `${kind}:${listingId}`;
}
