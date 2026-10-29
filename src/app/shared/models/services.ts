import { ListingStatus } from '../enums/PropertyStatus';
import { PriceMode, ServiceCategory, ServiceKind } from '../enums/Services';
import { PropertyMedia } from './properties';

/** Shape of /api/product/v1/services responses. */
export interface ServiceItem {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  priceMode: PriceMode | null;
  views: number;

  category: ServiceCategory | null;
  kind: ServiceKind | null;
  listingStatus: ListingStatus;

  ownerContact: string | null;
  agent: string;
  agentID: number;
  regionId: number | null;
  districtId: number | null;
  placeId: number | null;
  /** [region, district, place, address] in the UI language; entries can be empty strings. */
  location: string[];
  latitude: number | null;
  longitude: number | null;
  medias: PropertyMedia[];
  createdAt: string;
  updatedAt: string | null;
}

/** Criteria of the public GET /services/filter; null / empty means "any". */
export interface ServiceFilter {
  search: string;
  listingStatus: ListingStatus | null;
  kind: ServiceKind | null;
  categories: ServiceCategory[];
  regionId: number | null;
  districtId: number | null;
  placeId: number | null;
  priceFrom: number | null;
  priceTo: number | null;
}
