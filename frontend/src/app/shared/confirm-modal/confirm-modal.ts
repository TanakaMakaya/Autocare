import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen()) {
      <!-- Backdrop -->
      <div 
        class="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300"
        (click)="onCancel()"
      >
        <!-- Modal Box -->
        <div 
          class="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl transform transition-all scale-100"
          (click)="$event.stopPropagation()"
        >
          <!-- Title -->
          <h3 class="text-lg font-bold text-gray-900 mb-2">{{ title() }}</h3>
          
          <!-- Message -->
          <p class="text-sm text-gray-600 mb-6">{{ message() }}</p>
          
          <!-- Buttons -->
          <div class="flex space-x-3">
            <button 
              (click)="onCancel()" 
              class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2.5 rounded-xl transition"
            >
              {{ cancelText() }}
            </button>
            <button 
              (click)="onConfirm()" 
              [class.bg-red-600]="isDestructive()"
              [class.hover-bg-red-700]="isDestructive()"
              [class.bg-gray-900]="!isDestructive()"
              [class.hover-bg-gray-800]="!isDestructive()"
              class="flex-1 text-white font-medium py-2.5 rounded-xl transition"
            >
              {{ confirmText() }}
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmModalComponent {
  // Inputs
  isOpen = input(false);
  title = input('Are you sure?');
  message = input('');
  confirmText = input('Confirm');
  cancelText = input('Cancel');
  isDestructive = input(false); // Makes the confirm button red

  // Outputs
  confirmed = output<void>();
  cancelled = output<void>();

  onConfirm() { this.confirmed.emit(); }
  onCancel() { this.cancelled.emit(); }
}