import { TranslationKey } from '../i18n/translations';

export type CategorySlug =
  | 'real-estate'
  | 'cars'
  | 'second-hand'
  | 'home-garden'
  | 'services'
  | 'electronics';

export interface MarketplaceCategory {
  slug: CategorySlug;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  /** Tailwind classes for the icon badge and accents on cards. */
  accent: string;
  /** Live categories have their own section; the rest show a "coming soon" page. */
  available: boolean;
  /** Translation key of the primary call-to-action button in the header. */
  ctaLabel: TranslationKey;
  /** In-section navigation shown in the header while the category is active (label is a translation key). */
  nav: { label: TranslationKey; path: string }[];
  /** Display order and number of live listings, filled in from the backend. */
  sortOrder?: number;
  listingCount?: number;
}

/** Shape returned by GET /api/product/v1/category/all. */
export interface MarketplaceCategoryDTO {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  imageUrl: string;
  available: boolean;
  sortOrder: number;
  listingCount: number;
}

export const CATEGORIES: MarketplaceCategory[] = [
  {
    slug: 'real-estate',
    title: 'Real Estate',
    tagline: 'Homes, apartments & commercial',
    description: 'Rent or buy apartments, houses, land and commercial spaces from verified agents.',
    imageUrl:
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-blue-50 text-blue-700',
    available: true,
    ctaLabel: 'category.real-estate.cta',
    nav: [{ label: 'nav.browseProperties', path: '/real-estate' }],
  },
  {
    slug: 'cars',
    title: 'Cars',
    tagline: 'Cars, motorcycles & parts',
    description: 'Find new and used vehicles, spare parts and accessories from dealers and owners.',
    imageUrl:
      'https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-red-50 text-red-700',
    available: true,
    ctaLabel: 'category.cars.cta',
    nav: [{ label: 'nav.browseCars', path: '/cars' }],
  },
  {
    slug: 'second-hand',
    title: 'Second-hand',
    tagline: 'Pre-loved items at fair prices',
    description: 'Clothing, books, sports gear and everything else that deserves a second life.',
    imageUrl:
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-amber-50 text-amber-700',
    available: true,
    ctaLabel: 'category.second-hand.cta',
    nav: [{ label: 'nav.browseItems', path: '/second-hand' }],
  },
  {
    slug: 'services',
    title: 'Services',
    tagline: 'Repairs, cleaning, tutoring & more',
    description:
      'Hire trusted local professionals for repairs, moving, cleaning, lessons and more.',
    imageUrl:
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-violet-50 text-violet-700',
    available: true,
    ctaLabel: 'category.services.cta',
    nav: [{ label: 'nav.browseServices', path: '/services' }],
  },
  {
    slug: 'home-garden',
    title: 'Home & Garden',
    tagline: 'Furniture, decor & appliances',
    description: 'Furnish your space with furniture, home appliances, decor and garden supplies.',
    imageUrl:
      'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-emerald-50 text-emerald-700',
    available: false,
    ctaLabel: 'nav.postAd',
    nav: [],
  },
  {
    slug: 'electronics',
    title: 'Electronics',
    tagline: 'Phones, computers & gadgets',
    description: 'Buy and sell phones, laptops, consoles, cameras and other gadgets.',
    imageUrl:
      'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
    accent: 'bg-cyan-50 text-cyan-700',
    available: false,
    ctaLabel: 'category.electronics.cta',
    nav: [],
  },
];

export function findCategory(slug: string | null | undefined): MarketplaceCategory | undefined {
  return CATEGORIES.find((c) => c.slug === slug);
}

/** Landing cards stay light: shrink Unsplash CDN requests, leave any other image host untouched. */
export function categoryThumb(imageUrl: string): string {
  return imageUrl.replace(/([?&]w=)\d+/, '$1480').replace(/([?&]q=)\d+/, '$170');
}
