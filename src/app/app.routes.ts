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
    ],
  },
];
