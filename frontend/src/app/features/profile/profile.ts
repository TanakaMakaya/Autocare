import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service'; 
import { VehicleService } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BottomNav, ConfirmModalComponent, RouterLink], 
  templateUrl: './profile.html'
})
export class Profile implements OnInit {
  appVersion = '1.0.0';
  
  // Cleaned up signals (no duplicates)
  user = signal<any>(null);
  isLoading = signal(true);
  documents = signal<any[]>([]);
  documentCount = computed(() => this.documents().length);
  isDarkMode = signal(false);

  // --- Modal State ---
  modalState = signal({
    isOpen: false,
    title: '',
    message: '',
    action: null as (() => void) | null,
    isDestructive: true
  });

  constructor(
    private authService: AuthService, 
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
    this.loadGlobalDocuments();
    
    const isDark = localStorage.getItem('darkMode') === 'true';
    this.isDarkMode.set(isDark);
    this.applyDarkMode(isDark);
  }

  // Fetch the user data from Django
  loadUserProfile(): void {
    this.isLoading.set(true);
    this.authService.getCurrentUser().subscribe({
      next: (data) => {
        this.user.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load profile', err);
        this.isLoading.set(false);
      }
    });
  }

  loadGlobalDocuments(): void {
    this.vehicleService.getAllDocuments().subscribe({
      next: (data) => this.documents.set(data),
      error: (err) => console.error('Failed to load global docs', err)
    });
  }

  // --- Modal Methods ---
  openModal(title: string, message: string, action: () => void, isDestructive = true): void {
    this.modalState.set({ isOpen: true, title, message, action, isDestructive });
  }

  closeModal(): void {
    this.modalState.update(state => ({ ...state, isOpen: false, action: null }));
  }

  handleModalConfirm(): void {
    if (this.modalState().action) {
      this.modalState().action!();
    }
    this.closeModal();
  }

  // --- Actions ---
  viewAllDocuments(): void {
    this.router.navigate(['/documents']);
  }

  openTicket(): void {
    window.location.href = 'mailto:support@autocare.com?subject=AutoCare Support Ticket&body=Hi AutoCare Team,%0D%0A%0D%0AI need help with...';
  }

  suggestFeature(): void {
    window.location.href = 'mailto:feedback@autocare.com?subject=AutoCare Feature Suggestion&body=Hi AutoCare Team,%0D%0A%0D%0AI would love to see a feature that...';
  }

  logout(): void {
    this.openModal(
      'Sign out?',
      'Are you sure you want to sign out of your account?',
      () => {
        this.authService.logout(); 
        this.router.navigate(['/auth/login']); // Adjust if your login route is just '/login'
      },
      true 
    );
  }

  // --- Dark Mode Methods ---
  toggleDarkMode(): void {
    const newVal = !this.isDarkMode();
    this.isDarkMode.set(newVal);
    localStorage.setItem('darkMode', String(newVal));
    this.applyDarkMode(newVal);
  }

  private applyDarkMode(isDark: boolean): void {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
}