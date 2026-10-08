import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VehicleService } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

export interface ServiceRecord {
  id: number;
  service_type: string;
  custom_name: string | null;
  date: string;
  mileage: number;
  total_cost: number;
  vehicle_name?: string;
}

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [CommonModule, BottomNav, RippleLoader],
  templateUrl: './costs.html'
})
export class Costs implements OnInit {
    today = new Date(); 
  services = signal<ServiceRecord[]>([]);
  isLoading = signal(true);

  // --- Computed Stats ---
  allTime = computed(() => this.services().reduce((sum, s) => sum + Number(s.total_cost), 0));
  
  spentThisYear = computed(() => {
    const currentYear = new Date().getFullYear().toString();
    return this.services().filter(s => s.date.startsWith(currentYear)).reduce((sum, s) => sum + Number(s.total_cost), 0);
  });

  thisMonth = computed(() => {
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    return this.services().filter(s => s.date.startsWith(currentYearMonth)).reduce((sum, s) => sum + Number(s.total_cost), 0);
  });

  monthlyAvg = computed(() => this.spentThisYear() / 12);

  // --- Chart Data ---
  monthlyData = computed(() => {
    const currentYear = new Date().getFullYear();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map((month, index) => {
      const amount = this.services()
        .filter(s => {
          const d = new Date(s.date);
          return d.getFullYear() === currentYear && d.getMonth() === index;
        })
        .reduce((sum, s) => sum + Number(s.total_cost), 0);
      return { month, amount };
    });
  });

  vehicleCosts = computed(() => {
    const currentYear = new Date().getFullYear();
    const vehicleMap = new Map<string, { name: string, yearCost: number, lifetimeCost: number, services: number }>();

    this.services().forEach(s => {
      const name = s.vehicle_name || 'Unknown Vehicle';
      const cost = Number(s.total_cost);
      const year = new Date(s.date).getFullYear();

      if (!vehicleMap.has(name)) {
        vehicleMap.set(name, { name, yearCost: 0, lifetimeCost: 0, services: 0 });
      }
      const v = vehicleMap.get(name)!;
      v.lifetimeCost += cost;
      v.services += 1;
      if (year === currentYear) v.yearCost += cost;
    });

    return Array.from(vehicleMap.values()).sort((a, b) => b.yearCost - a.yearCost);
  });

  // Chart scaling helpers
  maxMonthlyAmount = computed(() => Math.max(...this.monthlyData().map(m => m.amount), 1));
  maxVehicleCost = computed(() => Math.max(...this.vehicleCosts().map(v => v.yearCost), 1));

  constructor(private vehicleService: VehicleService) {}

  ngOnInit(): void {
    this.loadAllServices();
  }

  loadAllServices(): void {
    this.isLoading.set(true);
    this.vehicleService.getAllServices().subscribe({
      next: (data) => {
        this.services.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load services', err);
        this.isLoading.set(false);
      }
    });
  }

  // --- UI Helpers ---
  formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }

  getBarHeight(amount: number): number {
    if (amount === 0) return 2; // Minimum height for empty bars
    return (amount / this.maxMonthlyAmount()) * 100;
  }

  getProgressWidth(yearCost: number): number {
    if (yearCost === 0) return 0;
    return (yearCost / this.maxVehicleCost()) * 100;
  }
}