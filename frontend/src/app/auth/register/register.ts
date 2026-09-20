import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './register.html'
})
export class RegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = '';
  isLoading = false;

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {
    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const registerData = {
      first_name: this.firstName,
      last_name: this.lastName,
      email: this.email,
      password: this.password,
      password2: this.confirmPassword
    };

    this.authService.register(registerData).subscribe({
      next: () => {
        // Redirect to login on successful registration
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isLoading = false;
        // Extract error message from Django response if available
        const errorDetail = err.error?.password?.[0] || err.error?.email?.[0] || 'Registration failed. Please try again.';
        this.errorMessage = errorDetail;
        console.error('Register error:', err);
      }
    });
  }
}