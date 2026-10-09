import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; // Adjust path if needed
import { VehicleService } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNav],
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  // App Info
  appVersion = '1.0.0';

  // User State (We'll pull this from your Auth service or local storage)
  user = signal<{ name: string, email: string } | null>(null);
  
  // Documents State
  documents = signal<any[]>([]);
  documentCount = computed(() => this.documents().length);

  constructor(
    private authService: AuthService, 
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadGlobalDocuments();
  }

  loadUserProfile(): void {
    // TODO: Replace this with your actual Auth Service user getter
    // Example: this.user.set(this.authService.getCurrentUser());
    
    // Placeholder for now so the UI looks good:
    this.user.set({ name: 'Tanaka', email: 'tanaka@example.com' });
  }

  loadGlobalDocuments(): void {
    // We will create this method in your VehicleService next!
    // For now, it just sets an empty array so the UI doesn't break
    this.vehicleService.getAllDocuments().subscribe({
      next: (data) => this.documents.set(data),
      error: (err) => console.error('Failed to load global docs', err)
    });
  }

  // --- Actions ---

  viewAllDocuments(): void {
    this.router.navigate(['/documents']);
  }

  openTicket(): void {
    // Opens user's email client with pre-filled subject
    window.location.href = 'mailto:support@autocare.com?subject=AutoCare Support Ticket&body=Hi AutoCare Team,%0D%0A%0D%0AI need help with...';
  }

  suggestFeature(): void {
    // Opens user's email client with pre-filled subject
    window.location.href = 'mailto:feedback@autocare.com?subject=AutoCare Feature Suggestion&body=Hi AutoCare Team,%0D%0A%0D%0AI would love to see a feature that...';
  }

  logout(): void {
    // Use your custom modal here if you want, or a simple confirm
    if (confirm('Are you sure you want to log out?')) {
      this.authService.logout(); // Ensure this method exists in your auth service
      this.router.navigate(['/auth/login']);
    }
  }
}