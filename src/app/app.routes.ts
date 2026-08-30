import { Routes } from '@angular/router';
import { velaAccessGuard } from './core/guards/vela-access.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/access/access').then((m) => m.Access),
  },

  {
    path: 'home',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/home/home').then((m) => m.Home),
  },

  {
    path: 'motivation',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/motivation/motivation').then((m) => m.Motivation),
  },

  {
    path: 'breathe',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/breathe/breathe').then((m) => m.Breathe),
  },

  {
    path: 'pause',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/pause/pause').then((m) => m.Pause),
  },

  {
    path: 'accompanied',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/accompanied/accompanied').then((m) => m.Accompanied),
  },

  {
    path: 'from-me',
    canActivate: [velaAccessGuard],
    loadComponent: () => import('./features/from-me/from-me').then((m) => m.FromMe),
  },
];
