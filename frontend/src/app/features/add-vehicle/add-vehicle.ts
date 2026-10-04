import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router'; 
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
export class AddVehicleComponent implements OnInit {
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

  // Edit mode state
  isEditMode = false;
  vehicleId: string | null = null;
  existingPhotoUrl: string | null = null;

  // File handling
  selectedFile: File | null = null;
  imagePreview: string | null = null;

  // State
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private route: ActivatedRoute, 
    private vehicleService: VehicleService,
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    
    this.vehicleId = this.route.snapshot.paramMap.get('id');
    
    if (this.vehicleId) {
      this.isEditMode = true;
      this.loadVehicleData(this.vehicleId);
    }
  }

  loadVehicleData(id: string): void {
    this.isLoading.set(true);
    this.vehicleService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        // Pre-fill the form with existing data
        this.name = vehicle.name || '';
        this.manufacturer = vehicle.manufacturer || '';
        this.model = vehicle.model || '';
        this.year = vehicle.year || new Date().getFullYear();
        this.registration_number = vehicle.registration_number || '';
        this.vin = vehicle.vin || '';
        this.mileage = vehicle.mileage || 0;
        this.fuel_type = vehicle.fuel_type || 'petrol';
        
        // Keep track of existing photo
        this.existingPhotoUrl = vehicle.photo_url;
        this.imagePreview = vehicle.photo_url; 
        
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load vehicle for editing', err);
        this.errorMessage.set('Failed to load vehicle data.');
        this.isLoading.set(false);
      }
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.imagePreview = URL.createObjectURL(this.selectedFile);
    }
  }

  async onSubmit() {
    if (this.isLoading()) return;

    this.isLoading.set(true);
    this.errorMessage.set('');

    // Default to existing photo URL (so we don't lose it if no new file is selected)
    let photoUrl = this.existingPhotoUrl; 

    try {
      // 1. Upload new image to Supabase ONLY if a new file is selected
      if (this.selectedFile) {
        const uploadId = this.vehicleId || crypto.randomUUID(); 
        photoUrl = await this.supabaseService.uploadVehiclePhoto(this.selectedFile, uploadId);
      }

      // 2. Prepare payload
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

      // 3. Save to Django (Update or Add)
      if (this.isEditMode && this.vehicleId) {
        await this.vehicleService.updateVehicle(this.vehicleId, vehicleData).toPromise();
        this.router.navigate(['/vehicles', this.vehicleId]); // Go back to detail page
      } else {
        await this.vehicleService.addVehicle(vehicleData).toPromise();
        this.router.navigate(['/vehicles']); // Go to list page
      }

    } catch (error: any) {
      console.error('Vehicle save error:', error);
      const errorMsg = error.error?.registration_number?.[0] || error.error?.non_field_errors?.[0] || error.message || 'Failed to save vehicle.';
      this.errorMessage.set(errorMsg);
    } finally {
      this.isLoading.set(false);
    }
  }

  goBack() {
    // Smart goBack: if editing, go to detail page. If adding, go to list.
    if (this.isEditMode && this.vehicleId) {
      this.router.navigate(['/vehicles', this.vehicleId]);
    } else {
      this.router.navigate(['/vehicles']);
    }
  }
}