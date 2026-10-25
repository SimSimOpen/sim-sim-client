import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRODUCT_URL } from '../../constants/urls';
import { Page } from '../../models/commont-models';
import { SecondHandFilter, SecondHandItem } from '../../models/second-hand';

const SECOND_HAND_URL = `${PRODUCT_URL}/v1/second-hand`;

@Injectable({ providedIn: 'root' })
export class SecondHandApiService {
  private http = inject(HttpClient);

  /** Public search; the backend only ever returns live (ACTIVE) items here. */
  filter(
    filter: SecondHandFilter,
    page: number,
    size: number,
    sort?: string,
  ): Observable<Page<SecondHandItem>> {
    let params = new HttpParams().append('page', page).append('size', size);
    const scalars: [string, string | number | null][] = [
      ['search', filter.search || null],
      ['regionId', filter.regionId],
      ['districtId', filter.districtId],
      ['priceFrom', filter.priceFrom],
      ['priceTo', filter.priceTo],
      ['sort', sort ?? null],
    ];
    for (const [key, value] of scalars) {
      if (value != null) params = params.append(key, value);
    }
    const lists: [string, string[]][] = [
      ['subCategories', filter.subCategories],
      ['conditions', filter.conditions],
    ];
    for (const [key, values] of lists) {
      for (const value of values) params = params.append(key, value);
    }
    return this.http.get<Page<SecondHandItem>>(`${SECOND_HAND_URL}/filter`, { params });
  }

  incrementViews(id: number): Observable<number> {
    return this.http.post<number>(`${SECOND_HAND_URL}/${id}/views`, {});
  }
}
