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
{ path: 'dashboard', loadComponent: () => import('./features/dashboard/dashboard').then(m => m.DashboardComponent), canActivate: [authGuard] },
  { path: 'vehicles', loadComponent: () => import('./features/vehicles/vehicles').then(m => m.Vehicles), canActivate: [authGuard] },
  { path: 'reminders', loadComponent: () => import('./features/reminders/reminders').then(m => m.Reminders), canActivate: [authGuard] },
  { path: 'costs', loadComponent: () => import('./features/costs/costs').then(m => m.Costs), canActivate: [authGuard] },
  { path: 'profile', loadComponent: () => import('./features/profile/profile').then(m => m.Profile), canActivate: [authGuard] },
    { 
    path: 'vehicles/add', 
    loadComponent: () => import('./features/add-vehicle/add-vehicle').then(m => m.AddVehicleComponent),
    canActivate: [authGuard] 
  },
  { path: '**', redirectTo: 'auth/get-started' }
];