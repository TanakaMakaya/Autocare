import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, BottomNav, RippleLoader],
  templateUrl: './vehicle-detail.html'
})
export class VehicleDetailComponent implements OnInit {
  vehicle = signal<Vehicle | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  
  // Tab State
  activeTab = signal<'overview' | 'services' | 'reminders' | 'documents'>('overview');

  // Mock Data for Tabs (Replace with API calls later)
  services = signal([
    { id: 1, title: 'Spark Plugs', date: '15 Aug 2026', mileage: '214,000 km', provider: 'AutoZone', notes: 'NGK iridium plugs', cost: 620 },
    { id: 2, title: 'Brake Pads', date: '20 Apr 2026', mileage: '210,500 km', provider: 'Brake Master', notes: 'Front pads replaced', cost: 1850 },
    { id: 3, title: 'Oil Change', date: '10 Jan 2026', mileage: '205,000 km', provider: 'AutoZone', notes: '5W-30 Synthetic', cost: 850 }
  ]);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.loadVehicle(vehicleId);
    }
  }

  loadVehicle(id: string): void {
    this.isLoading.set(true);
    this.vehicleService.getVehicleById(id).subscribe({
      next: (data) => {
        this.vehicle.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching vehicle:', err);
        this.errorMessage.set('Failed to load vehicle details.');
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'overview' | 'services' | 'reminders' | 'documents'): void {
    this.activeTab.set(tab);
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }

  deleteVehicle() {
    if (confirm('Are you sure you want to remove this vehicle?')) {
      // Call delete API here
      this.router.navigate(['/vehicles']);
    }
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString()}`;
  }
}