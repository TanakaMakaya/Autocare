// frontend/src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { 
    path: 'auth/login', 
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent) 
  },
  { 
    path: 'auth/register', 
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent) 
  },
  { 
    path: 'dashboard', 
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard] 
  },
  { 
    path: 'vehicles', 
    loadComponent: () => import('./features/vehicles/vehicles').then(m => m.Vehicles),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: 'dashboard' } // Fallback route
];