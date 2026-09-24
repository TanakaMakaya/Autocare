import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';


export interface ServiceRecord {
  id: number;
  service_type: string;
  custom_name: string | null;
  date: string;
  mileage: number;
  parts_cost: number;
  labor_cost: number;
  total_cost: number;
  notes: string;
  invoice_url: string | null;
  created_at: string;
}

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNav, RippleLoader],
  templateUrl: './vehicle-detail.html'
})
export class VehicleDetailComponent implements OnInit {
  vehicle = signal<Vehicle | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  
  activeTab = signal<'overview' | 'services' | 'reminders' | 'documents'>('services'); // Default to services to see the timeline

  // Real services data
  services = signal<ServiceRecord[]>([]);
  isServicesLoading = signal(false);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.loadVehicle(vehicleId);
      this.loadServices(vehicleId);
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

  loadServices(vehicleId: string): void {
    this.isServicesLoading.set(true);
    this.vehicleService.getServices(vehicleId).subscribe({
      next: (data) => {
        this.services.set(data);
        this.isServicesLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching services:', err);
        this.isServicesLoading.set(false);
      }
    });
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }

  deleteVehicle() {
    const id = this.vehicle()?.id;
    if (!id) return;
    if (confirm('Are you sure you want to remove this vehicle?')) {
      this.vehicleService.deleteVehicle(id).subscribe({
        next: () => this.router.navigate(['/vehicles']),
        error: (err) => console.error('Failed to delete vehicle', err)
      });
    }
  }

  // Helpers for clean UI
  formatCurrency(amount: number): string {
    return `R ${amount.toLocaleString()}`;
  }

  formatMileage(mileage: number): string {
    return `${mileage.toLocaleString()} km`;
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  getServiceName(service: ServiceRecord): string {
    return service.custom_name || service.service_type;
  }
}