import { Routes } from '@angular/router';
import { ClientMain } from './layouts/client-main/client-main';
import { Home } from './pages/home/home';
import { CATEGORIES } from './shared/constants/categories';

// Categories that don't have their own section yet share a single placeholder page.
const comingSoonRoutes: Routes = CATEGORIES.filter((c) => !c.available).map((c) => ({
  path: c.slug,
  loadComponent: () => import('./pages/coming-soon/coming-soon').then((m) => m.ComingSoon),
  data: { category: c.slug },
}));

export const routes: Routes = [
  {
    path: '',
    component: ClientMain,
    children: [
      {
        path: '',
        component: Home,
      },
      {
        path: 'real-estate',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./pages/real-estate/landing/landing').then((m) => m.Landing),
          },
          {
            path: 'browse',
            loadComponent: () => import('./pages/real-estate/browse/browse').then((m) => m.Browse),
          },
        ],
      },
      ...comingSoonRoutes,
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
      },
      // Old real-estate URL, kept so existing links keep working.
      { path: 'browse', redirectTo: 'real-estate/browse' },
    ],
  },
  { path: '**', redirectTo: '' },
];
