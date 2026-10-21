import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRODUCT_URL } from '../../constants/urls';
import { Page } from '../../models/commont-models';
import { Car, CarFilter } from '../../models/cars';

const CAR_URL = `${PRODUCT_URL}/v1/car`;

@Injectable({ providedIn: 'root' })
export class CarApiService {
  private http = inject(HttpClient);

  /** Public search; the backend only ever returns live (ACTIVE) cars here. */
  filter(filter: CarFilter, page: number, size: number, sort?: string): Observable<Page<Car>> {
    let params = new HttpParams().append('page', page).append('size', size);
    const scalars: [string, string | number | null][] = [
      ['search', filter.search || null],
      ['regionId', filter.regionId],
      ['districtId', filter.districtId],
      ['condition', filter.condition],
      ['priceFrom', filter.priceFrom],
      ['priceTo', filter.priceTo],
      ['yearFrom', filter.yearFrom],
      ['yearTo', filter.yearTo],
      ['mileageTo', filter.mileageTo],
      ['sort', sort ?? null],
    ];
    for (const [key, value] of scalars) {
      if (value != null) params = params.append(key, value);
    }
    const lists: [string, string[]][] = [
      ['bodyTypes', filter.bodyTypes],
      ['fuelTypes', filter.fuelTypes],
      ['transmissions', filter.transmissions],
      ['driveTypes', filter.driveTypes],
    ];
    for (const [key, values] of lists) {
      for (const value of values) params = params.append(key, value);
    }
    return this.http.get<Page<Car>>(`${CAR_URL}/filter`, { params });
  }

  incrementViews(id: number): Observable<number> {
    return this.http.post<number>(`${CAR_URL}/${id}/views`, {});
  }
}
