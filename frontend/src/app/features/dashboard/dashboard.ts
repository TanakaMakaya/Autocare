import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

export interface Reminder {
  id: number;
  title: string;
  due_date: string;
  is_completed: boolean;
  vehicle_name?: string;
}

export interface ServiceRecord {
  id: number;
  service_type: string;
  custom_name: string | null;
  date: string;
  total_cost: number;
  vehicle_name?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNav, RippleLoader],
  templateUrl: './dashboard.html'
})
export class Dashboard implements OnInit {
  vehicles = signal<Vehicle[]>([]);
  services = signal<ServiceRecord[]>([]);
  reminders = signal<Reminder[]>([]);
  isLoading = signal(true);

  // Computed Stats
  today = new Date();
  thirtyDaysFromNow = new Date();
  
  constructor(private vehicleService: VehicleService) {
    this.thirtyDaysFromNow.setDate(this.today.getDate() + 30);
  }

  overdueReminders = computed(() => {
    const todayStr = this.today.toISOString().split('T')[0];
    return this.reminders().filter(r => !r.is_completed && r.due_date < todayStr);
  });

  dueSoonReminders = computed(() => {
    const todayStr = this.today.toISOString().split('T')[0];
    const soonStr = this.thirtyDaysFromNow.toISOString().split('T')[0];
    return this.reminders().filter(r => !r.is_completed && r.due_date >= todayStr && r.due_date <= soonStr);
  });

  recentServices = computed(() => {
    return this.services().slice(0, 3); // Get the 3 most recent
  });

  yearlySpend = computed(() => {
    const currentYear = this.today.getFullYear().toString();
    return this.services()
      .filter(s => s.date.startsWith(currentYear))
      .reduce((sum, s) => sum + Number(s.total_cost), 0);
  });

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.isLoading.set(true);
    
    // Fetch all data in parallel
    Promise.all([
      this.vehicleService.getVehicles().toPromise(),
      this.vehicleService.getAllServices().toPromise(),
      this.vehicleService.getAllReminders().toPromise()
    ]).then(([vehicles, services, reminders]) => {
      this.vehicles.set(vehicles || []);
      this.services.set(services || []);
      this.reminders.set(reminders || []);
      this.isLoading.set(false);
    }).catch(err => {
      console.error('Failed to load dashboard', err);
      this.isLoading.set(false);
    });
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString()}`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' });
  }

  getServiceName(service: ServiceRecord): string {
    return service.custom_name || service.service_type;
  }
}