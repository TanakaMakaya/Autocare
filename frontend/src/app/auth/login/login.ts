import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router'; 
import { AuthService } from '../../services/auth.service';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RippleLoader],
  templateUrl: './login.html'
})
export class LoginComponent {
  email = '';
  password = '';
  errorMessage = '';
  isLoading = false;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef 
  ) {}

   onSubmit() {
    // 1. FRONTEND VALIDATION: Catch empty fields instantly to avoid API calls
    if (!this.email.trim() || !this.password.trim()) {
      this.errorMessage = 'Please enter both your email and password.';
      return; 
    }

    // 2. Start Loading & Clear old errors
    this.isLoading = true;
    this.errorMessage = '';

    // 3. Attempt Login
    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.isLoading = false;
        const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: (err: any) => {
        // 4. CRITICAL FIX: Stop the spinner immediately on failure!
        this.isLoading = false;
        this.errorMessage = 'Invalid email or password. Please try again.';
        console.error('Login error:', err);
        this.cdr.detectChanges();
      }
    });
  }
}