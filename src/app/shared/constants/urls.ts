import { EnvironmentTs } from '../../environments/environment';

export const AUTH_URL = `${EnvironmentTs.URL}/api/auth`;

export const PRODUCT_URL = `${EnvironmentTs.URL}/api/product`;

export const MEDIA_SERVICE_URL = `${EnvironmentTs.URL}/api/media`;

export const NOTIFICATION_URL = `${EnvironmentTs.URL}/api/event`;

export const LandingPageCoverImageURL = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1568605114967-8130f3a36994?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?ixlib=rb-4.0.3&auto=format&fit=crop&w=1471&q=80',
];

export function getRandomLandingPageCoverImage() {
  const randomIndex = Math.floor(Math.random() * LandingPageCoverImageURL.length);
  return LandingPageCoverImageURL[randomIndex];
}
