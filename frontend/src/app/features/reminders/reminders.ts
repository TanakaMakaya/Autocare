import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNav, RippleLoader],
  templateUrl: './reminders.html'
})
export class Reminders implements OnInit {
  reminders = signal<any[]>([]);
  isLoading = signal(true);

  // Date helpers
  today = new Date();
  thirtyDaysFromNow = new Date(this.today.getTime() + 30 * 24 * 60 * 60 * 1000);

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadReminders();
  }

  loadReminders(): void {
    this.isLoading.set(true);
    this.vehicleService.getAllReminders().subscribe({
      next: (data) => {
        this.reminders.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load reminders', err);
        this.isLoading.set(false);
      }
    });
  }

  // --- Computed Data ---
  
  // Maps raw data to the shape your HTML expects and sorts it
  mappedReminders = computed(() => {
    const todayStr = this.today.toISOString().split('T')[0];
    const soonStr = this.thirtyDaysFromNow.toISOString().split('T')[0];

    return this.reminders()
      .map(r => {
        let status = 'upcoming';
        if (r.is_completed) status = 'completed';
        else if (r.due_date && r.due_date < todayStr) status = 'urgent';
        else if (r.due_date && r.due_date <= soonStr) status = 'due-soon';

        return {
          ...r,
          status,
          vehicleName: r.vehicle_name || 'Unknown Vehicle',
          dueDate: r.due_date 
            ? new Date(r.due_date).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }) 
            : 'No date set'
        };
      })
      .sort((a, b) => {
        // Sort priority: Urgent -> Due Soon -> Upcoming -> Completed
        const priority: any = { 'urgent': 1, 'due-soon': 2, 'upcoming': 3, 'completed': 4 };
        return priority[a.status] - priority[b.status] || (a.due_date || '').localeCompare(b.due_date || '');
      });
  });

  urgentCount = computed(() => this.mappedReminders().filter(r => r.status === 'urgent').length);
  dueSoonCount = computed(() => this.mappedReminders().filter(r => r.status === 'due-soon').length);
  upcomingCount = computed(() => this.mappedReminders().filter(r => r.status === 'upcoming').length);

  // --- UI Helpers ---

  getIcon(type: string): string {
    // Since we don't have a 'type' field yet, we return a standard bell icon path
    return "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9";
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'urgent': return 'bg-red-50 text-red-600 border-red-100';
      case 'due-soon': return 'bg-amber-50 text-amber-600 border-amber-100';
      case 'upcoming': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'completed': return 'bg-gray-50 text-gray-500 border-gray-100 line-through';
      default: return 'bg-gray-50 text-gray-600 border-gray-100';
    }
  }
}