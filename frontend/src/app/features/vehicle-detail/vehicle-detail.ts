import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';


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

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.loadVehicle(vehicleId);
    } else {
      this.errorMessage.set('Vehicle ID not found.');
      this.isLoading.set(false);
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

  goBack() {
    this.router.navigate(['/vehicles']);
  }

  // Placeholder for future features
  logService() {
    alert('Log Service feature coming soon!');
  }

  editVehicle() {
    alert('Edit Vehicle feature coming soon!');
  }
}