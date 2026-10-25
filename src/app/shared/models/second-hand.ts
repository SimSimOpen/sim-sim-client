import { ListingStatus, OfferType } from '../enums/PropertyStatus';
import { ItemCondition, SecondHandCategory } from '../enums/SecondHand';
import { PropertyMedia } from './properties';

/** Shape of /api/product/v1/second-hand responses. */
export interface SecondHandItem {
  id: number;
  title: string | null;
  description: string | null;
  price: number | null;
  views: number;

  subCategory: SecondHandCategory | null;
  condition: ItemCondition | null;
  offerType: OfferType | null;
  listingStatus: ListingStatus;

  ownerContact: string | null;
  agent: string;
  agentID: number;
  regionId: number | null;
  districtId: number | null;
  placeId: number | null;
  /** [region, district, place, address] in the UI language. */
  location: string[];
  latitude: number | null;
  longitude: number | null;
  medias: PropertyMedia[];
  createdAt: string;
  updatedAt: string | null;
}

/** Criteria of the public GET /second-hand/filter; null / empty means "any". */
export interface SecondHandFilter {
  search: string;
  regionId: number | null;
  districtId: number | null;
  subCategories: SecondHandCategory[];
  conditions: ItemCondition[];
  priceFrom: number | null;
  priceTo: number | null;
}
