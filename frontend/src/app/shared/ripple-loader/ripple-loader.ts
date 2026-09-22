import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ripple-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="ripple-container" [class]="sizeClass">
      <div class="ripple-ring"></div>
      <div class="ripple-ring delay"></div>
    </div>
  `,
  styles: [`
    .ripple-container {
      position: relative;
      display: inline-block;
    }
    
    /* Sizes */
    .size-sm { width: 24px; height: 24px; }
    .size-md { width: 36px; height: 36px; }
    .size-lg { width: 56px; height: 56px; }

    .ripple-ring {
      position: absolute;
      border: 2px solid currentColor; /* Inherits text color from parent */
      border-radius: 50%;
      opacity: 1;
      animation: ripple-anim 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
    }

    .ripple-ring.delay {
      animation-delay: -0.5s;
    }

    @keyframes ripple-anim {
      0% {
        top: 50%;
        left: 50%;
        width: 0;
        height: 0;
        opacity: 1;
        transform: translate(-50%, -50%);
      }
      100% {
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transform: translate(0, 0);
      }
    }
  `]
})
export class RippleLoader {
  @Input() size: 'sm' | 'md' | 'lg' = 'sm';

  get sizeClass(): string {
    return `size-${this.size}`;
  }
}