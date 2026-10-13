import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RippleLoader],
  templateUrl: './change-password.html'
})
export class ChangePasswordComponent {
  oldPassword = '';
  newPassword = '';
  confirmPassword = '';
  errorMessage = '';
  successMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    // Frontend Validation
    if (this.newPassword.length < 8) {
      this.errorMessage = 'New password must be at least 8 characters.';
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'New passwords do not match.';
      return;
    }

    this.isLoading = true;

    this.authService.changePassword(this.oldPassword, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password updated successfully!';
        this.oldPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        
        // Optional: Redirect back to profile after 2 seconds
        setTimeout(() => this.router.navigate(['/profile']), 2000);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.error || 'Failed to update password. Please try again.';
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/profile']);
  }
}