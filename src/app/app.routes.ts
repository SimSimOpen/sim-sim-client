import { Routes } from '@angular/router';
import { ClientMain } from './layouts/client-main/client-main';
import { CATEGORIES } from './shared/constants/categories';

// Every category gets the same browse page; it adapts its sidebar and data to the slug.
const categoryRoutes: Routes = CATEGORIES.map((c) => ({
  path: c.slug,
  loadComponent: () => import('./pages/category/category').then((m) => m.CategoryBrowse),
  data: { category: c.slug },
}));

export const routes: Routes = [
  {
    path: '',
    component: ClientMain,
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      ...categoryRoutes,
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
      },
      // Old real-estate URLs, kept so existing links keep working.
      { path: 'real-estate/browse', redirectTo: 'real-estate' },
      { path: 'browse', redirectTo: 'real-estate' },
    ],
  },
  { path: '**', redirectTo: '' },
];
