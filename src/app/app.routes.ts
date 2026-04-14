import { Routes } from '@angular/router';
import { ClientMain } from './layouts/client-main/client-main';
import { Landing } from './pages/landing/landing';

export const routes: Routes = [
  {
    path: '',
    component: ClientMain,
    children: [
      {
        path: '',
        component: Landing,
      },
      {
        path: 'about',
        loadComponent: () => import('./pages/about/about').then((m) => m.About),
      },
      {
        path: 'browse',
        loadComponent: () => import('./pages/browse/browse').then((m) => m.Browse),
      },
      {
        path: 'contact',
        loadComponent: () => import('./pages/contact/contact').then((m) => m.Contact),
      },
    ],
  },
];
