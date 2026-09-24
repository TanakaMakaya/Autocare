import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BottomNav],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  user = signal<{ email: string; name: string } | null>(null);
  appVersion = '1.0.0';
  documentCount = signal(3); // Mock count for now

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Get user info from local storage (or your auth service)
    const email = localStorage.getItem('user_email') || 'user@autocare.com';
    const name = localStorage.getItem('user_name') || 'AutoCare User';
    
    this.user.set({ email, name });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/get-started']);
  }

  openTicket(): void {
    window.location.href = 'mailto:support@autocare.com?subject=Support Ticket';
  }

  suggestFeature(): void {
    window.location.href = 'mailto:feedback@autocare.com?subject=Feature Suggestion';
  }

  viewAllDocuments(): void {
    // Placeholder for future navigation to a dedicated Documents page
    console.log('Navigate to all documents');
    // this.router.navigate(['/documents']); 
  }
}