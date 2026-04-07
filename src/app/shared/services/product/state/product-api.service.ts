import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PRODUCT_URL } from '../../../constants/urls';
import { Property, PropertyFilter } from '../../../models/properties';
import { Page } from '../../../models/commont-models';

@Injectable({
  providedIn: 'root',
})
export class ProductApiService {
  constructor(private http: HttpClient) {}

  getAgentsProperties(page: number, size: number, sort?: string): Observable<Page<Property>> {
    let params = new HttpParams().append('page', page.toString()).append('size', size.toString());
    if (sort) {
      params = params.append('sort', sort);
    }
    return this.http.get<Page<Property>>(`${PRODUCT_URL}/v1/property/agents-all`, { params });
  }

  getAllProperties(page: number, size: number, sort?: string): Observable<Page<Property>> {
    let params = new HttpParams().append('page', page.toString()).append('size', size.toString());
    if (sort) {
      params = params.append('sort', sort);
    }
    return this.http.get<Page<Property>>(`${PRODUCT_URL}/v1/property/all/published`, { params });
  }

  getPropertyById(id: number): Observable<Property> {
    return this.http.get<Property>(`${PRODUCT_URL}/v1/property/${id}`);
  }

  getMediaCount(property_id: number): Observable<number> {
    return this.http.get<number>(`${PRODUCT_URL}/v1/property/property-media-count/${property_id}`);
  }

  filterProperties(
    filter: PropertyFilter,
    page: number,
    size: number,
    sort?: string,
  ): Observable<Page<Property>> {
    let params = new HttpParams().append('page', page.toString()).append('size', size.toString());
    if (filter.search) {
      params = params.append('search', filter.search);
    }
    if (filter.listingStatus) {
      params = params.append('listingStatus', filter.listingStatus);
    }
    if (filter.type) {
      params = params.append('type', filter.type);
    }
    if (sort) {
      params = params.append('sort', sort);
    }
    return this.http.get<Page<Property>>(`${PRODUCT_URL}/v1/property/filter`, { params });
  }

  updatePropertyViews(propertyId: number): Observable<number> {
    return this.http.post<number>(`${PRODUCT_URL}/v1/property/${propertyId}/views`, {});
  }
}
