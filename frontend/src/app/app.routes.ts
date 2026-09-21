import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/get-started', pathMatch: 'full' },
  { 
    path: 'auth/get-started', 
    loadComponent: () => import('./auth/get-started/get-started').then(m => m.GetStartedComponent) 
  },
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
    loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: 'auth/get-started' }
];