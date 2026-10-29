import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRODUCT_URL } from '../../constants/urls';
import { Page } from '../../models/commont-models';
import { ServiceFilter, ServiceItem } from '../../models/services';

const SERVICES_URL = `${PRODUCT_URL}/v1/services`;

@Injectable({ providedIn: 'root' })
export class ServicesApiService {
  private http = inject(HttpClient);

  /**
   * Public search; the backend only ever returns live (ACTIVE) listings here.
   * `mine` is deliberately never sent: it is the admin panel's opt-in to agent scoping
   * and would wrongly narrow the public list.
   */
  filter(
    filter: ServiceFilter,
    page: number,
    size: number,
    sort?: string,
  ): Observable<Page<ServiceItem>> {
    let params = new HttpParams().append('page', page).append('size', size);
    const scalars: [string, string | number | null][] = [
      ['search', filter.search || null],
      ['listingStatus', filter.listingStatus],
      ['kind', filter.kind],
      ['regionId', filter.regionId],
      ['districtId', filter.districtId],
      ['placeId', filter.placeId],
      ['priceFrom', filter.priceFrom],
      ['priceTo', filter.priceTo],
      ['sort', sort ?? null],
    ];
    for (const [key, value] of scalars) {
      if (value != null) params = params.append(key, value);
    }
    for (const category of filter.categories) params = params.append('categories', category);
    return this.http.get<Page<ServiceItem>>(`${SERVICES_URL}/filter`, { params });
  }

  /** A single listing. Note: this route requires a token, so the public browse never calls it. */
  getById(id: number): Observable<ServiceItem> {
    return this.http.get<ServiceItem>(`${SERVICES_URL}/${id}`);
  }

  incrementViews(id: number): Observable<number> {
    return this.http.post<number>(`${SERVICES_URL}/${id}/views`, {});
  }
}
