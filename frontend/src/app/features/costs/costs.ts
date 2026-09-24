import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

interface MonthlySpend {
  month: string;
  amount: number;
}

interface VehicleCost {
  name: string;
  services: number;
  yearCost: number;
  lifetimeCost: number;
}

@Component({
  selector: 'app-costs',
  standalone: true,
  imports: [CommonModule, BottomNav],
  templateUrl: './costs.html'
})
export class Costs{
  // Summary Stats
  spentThisYear = 16340;
  thisMonth = 0;
  monthlyAvg = 1816;
  allTime = 24140;

  // Chart Data
  monthlyData = signal<MonthlySpend[]>([
    { month: 'Jan', amount: 1200 }, { month: 'Feb', amount: 4500 },
    { month: 'Mar', amount: 0 }, { month: 'Apr', amount: 2800 },
    { month: 'May', amount: 0 }, { month: 'Jun', amount: 0 },
    { month: 'Jul', amount: 1500 }, { month: 'Aug', amount: 1200 },
    { month: 'Sep', amount: 0 }, { month: 'Oct', amount: 0 },
    { month: 'Nov', amount: 0 }, { month: 'Dec', amount: 0 }
  ]);

  // Vehicle Costs Data
  vehicleCosts = signal<VehicleCost[]>([
    { name: 'Renault Sandero Stepway', services: 3, yearCost: 8240, lifetimeCost: 8240 },
    { name: 'Toyota Hilux D-4D', services: 2, yearCost: 6150, lifetimeCost: 13950 },
    { name: 'Volkswagen Caddy Panel Van', services: 1, yearCost: 1950, lifetimeCost: 1950 }
  ]);

  // Computed max values for scaling charts/bars
  maxMonthlySpend = computed(() => Math.max(...this.monthlyData().map(d => d.amount), 1));
  maxVehicleCost = computed(() => Math.max(...this.vehicleCosts().map(v => v.yearCost), 1));

  getBarHeight(amount: number): number {
    if (amount === 0) return 4; // Minimum height for empty months
    return (amount / this.maxMonthlySpend()) * 100;
  }

  getProgressWidth(cost: number): number {
    return (cost / this.maxVehicleCost()) * 100;
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString()}`;
  }
}