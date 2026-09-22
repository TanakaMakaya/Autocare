import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';

interface Slide {
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-get-started',
  standalone: true,
  templateUrl: './get-started.html',
  styleUrl: './get-started.css'
})
export class GetStartedComponent implements OnInit, OnDestroy {
  slides: Slide[] = [
    { title: 'Track every service', subtitle: 'Log oil changes, brakes, tyres & repairs in one place.' },
    { title: 'Never miss a renewal', subtitle: 'Reminders for license disc, insurance & roadworthy.' },
    { title: 'Know your costs', subtitle: 'See exactly what you spend on each vehicle.' },
    { title: 'Start a new journey', subtitle: 'Your complete vehicle maintenance companion.' },
  ];

  currentSlide = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.intervalId = setInterval(() => this.next(), 5000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  next(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // reset the timer so a manual click doesn't fight the auto-advance
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => this.next(), 5000);
  }

  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  goToRegister(): void {
    this.router.navigate(['/auth/register']);
  }
}