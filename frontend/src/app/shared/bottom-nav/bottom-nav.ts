import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './bottom-nav.html'
})
export class BottomNav {
  constructor(private router: Router) {}

  navItems = [
    { path: '/dashboard', label: 'Home', icon: 'home' },
    { path: '/vehicles', label: 'Vehicles', icon: 'car' },
    { path: '/reminders', label: 'Reminders', icon: 'bell' },
    { path: '/costs', label: 'Costs', icon: 'wallet' },
    { path: '/profile', label: 'Profile', icon: 'user' },
  ];

  isActive(path: string): boolean {
    return this.router.url === path;
  }
}