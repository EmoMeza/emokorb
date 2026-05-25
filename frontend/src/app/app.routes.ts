import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/listas', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login').then((m) => m.LoginComponent),
      },
      {
        path: 'registro',
        loadComponent: () => import('./pages/auth/registro/registro').then((m) => m.RegistroComponent),
      },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout').then((m) => m.LayoutComponent),
    children: [
      {
        path: 'listas',
        loadComponent: () => import('./pages/listas/listas').then((m) => m.ListasComponent),
      },
      {
        path: 'listas/:id',
        loadComponent: () => import('./pages/lista-detalle/lista-detalle').then((m) => m.ListaDetalleComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./pages/perfil/perfil').then((m) => m.PerfilComponent),
      },
      {
        path: 'admin',
        canActivate: [adminGuard],
        loadComponent: () => import('./pages/admin/admin').then((m) => m.AdminComponent),
      },
    ],
  },
  { path: '**', redirectTo: '/listas' },
];
