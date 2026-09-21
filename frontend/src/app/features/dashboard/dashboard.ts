import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html'
})
export class DashboardComponent implements OnInit {
  user: any = null;
  isLoading = true;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get user data from token or API
    const token = localStorage.getItem('access_token');
    if (token) {
      // For now, just show loading state
      // In production, fetch user profile from API
      setTimeout(() => {
        this.isLoading = false;
        this.user = {
          first_name: 'User',
          email: localStorage.getItem('user_email') || 'user@example.com'
        };
      }, 500);
    }
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/get-started']);
  }
}