import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BottomNav],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  stats = {
    totalSpend: 16340,
    monthlyAvg: 1816,
    avgPerVehicle: 5447,
    vehicleCount: 3,
    servicesLogged: 5
  };

  vehicles = [
    {
      id: 1,
      name: 'Renault Sandero Stepway',
      year: 2017,
      registration: 'AB12CDGP',
      mileage: 215000,
      status: 'attention',
      statusLabel: 'Attention',
      nextService: 'Oil change'
    },
    {
      id: 2,
      name: 'Toyota Hilux D-4D',
      year: 2019,
      registration: 'GH34MNRT',
      mileage: 98400,
      status: 'due-soon',
      statusLabel: 'Due soon',
      nextService: 'Next service'
    },
    {
      id: 3,
      name: 'Volkswagen Caddy',
      year: 2021,
      registration: 'JK56UVWX',
      mileage: 41200,
      status: 'up-to-date',
      statusLabel: 'Up to date',
      nextService: 'Roadworthy certificate'
    }
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const token = localStorage.getItem('access_token');
    if (token) {
      setTimeout(() => {
        this.isLoading = false;
        this.user = {
          first_name: 'Admin',
          email: localStorage.getItem('user_email') || 'admin@autocare.com'
        };
      }, 500);
    }
  }

  isLoading = true;

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/get-started']);
  }

getStatusColor(status: string): string {
  switch(status) {
    case 'attention': return 'bg-red-100 text-red-700 border border-red-200';
    case 'due-soon': return 'bg-amber-100 text-amber-700 border border-amber-200';
    case 'up-to-date': return 'bg-green-100 text-green-700 border border-green-200';
    default: return 'bg-gray-100 text-gray-700 border border-gray-200';
  }
}

  getDotColor(status: string): string {
    switch(status) {
      case 'attention': return 'bg-red-500';
      case 'due-soon': return 'bg-amber-500';
      case 'up-to-date': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  }
}