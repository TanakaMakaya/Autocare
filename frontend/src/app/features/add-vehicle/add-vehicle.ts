import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { VehicleService } from '../../services/vehicle.service';
import { SupabaseService } from '../../services/supabase.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';


@Component({
  selector: 'app-add-vehicle',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNav, RippleLoader],
  templateUrl: './add-vehicle.html'
})
export class AddVehicleComponent {
  // Form fields
  name = '';
  manufacturer = '';
  model = '';
  year = new Date().getFullYear();
  color = '';
  registration_number = '';
  vin = '';
  mileage = 0;
  fuel_type = 'petrol';
  notes = '';

  // File handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // State
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private vehicleService: VehicleService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.imagePreview = URL.createObjectURL(this.selectedFile);
    }
  }

  async onSubmit() {
    // Prevent double submission
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    let photoUrl = '';

    try {
      // 1. Upload image to Supabase if selected
      if (this.selectedFile) {
        const tempId = crypto.randomUUID(); 
        photoUrl = await this.supabaseService.uploadVehiclePhoto(this.selectedFile, tempId);
      }

      // 2. Prepare payload (Only sending fields that exist in Django model to avoid 400 errors)
      const vehicleData = {
        name: this.name.trim() || `${this.manufacturer} ${this.model}`,
        registration_number: this.registration_number.trim().toUpperCase(),
        vin: this.vin.trim().toUpperCase(),
        manufacturer: this.manufacturer.trim(),
        model: this.model.trim(),
        year: Number(this.year),
        mileage: Number(this.mileage),
        fuel_type: this.fuel_type,
        photo_url: photoUrl
      };

      // 3. Save to Django
      await this.vehicleService.addVehicle(vehicleData).toPromise();
      
      // 4. Success
      this.router.navigate(['/vehicles']);

    } catch (error: any) {
      console.error('Add vehicle error:', error);
      const errorMsg = error.error?.registration_number?.[0] || error.message || 'Failed to add vehicle.';
      this.errorMessage.set(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }
}