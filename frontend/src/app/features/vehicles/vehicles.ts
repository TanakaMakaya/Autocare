import { Component, OnInit, signal } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';
import { Vehicle, VehicleService } from '../../services/vehicle.service';


@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [CommonModule, BottomNav, RippleLoader],
  templateUrl: './vehicles.html'
})
export class Vehicles implements OnInit {
  // 1. Define state using Signals
  vehicles = signal<Vehicle[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string>('');

  constructor(
    private vehicleService: VehicleService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadVehicles();
  }

  loadVehicles(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.vehicleService.getVehicles().subscribe({
      next: (data) => {
        this.vehicles.set(Array.isArray(data) ? data : []);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching vehicles:', err);
        this.errorMessage.set('Failed to load vehicles. Please try again.');
        this.isLoading.set(false);
      }
    }); 
  }

  goToAddVehicle(): void {
    this.router.navigate(['/vehicles/add']);
  }

  goToVehicleDetail(vehicleId: string| number): void {
    console.log('Navigate to detail for vehicle:', vehicleId);
    this.router.navigate(['/vehicles', vehicleId]);
  }
}
