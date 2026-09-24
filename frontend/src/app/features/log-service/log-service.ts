import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { VehicleService } from '../../services/vehicle.service'; // Make sure this is imported
import { SupabaseService } from '../../services/supabase.service'; 

// Custom Validator: Prevent future dates
export function noFutureDate(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const today = new Date().toISOString().split('T')[0];
    return control.value > today ? { futureDate: true } : null;
  };
}

// Custom Validator: Prevent leading zeros (e.g., 050)
export function noLeadingZero(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const valStr = control.value.toString();
    // Allow 0, 0.50, but block 05, 050
    if (valStr.startsWith('0') && valStr.length > 1 && valStr[1] !== '.') {
      return { leadingZero: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-log-service',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BottomNav],
  templateUrl: './log-service.html'
})
export class LogServiceComponent implements OnInit {
  serviceForm!: FormGroup;
  vehicleId: string = '';
  vehicleName: string = 'Renault Sandero Stepway · AB12CDGP';
  
  serviceTypes = ['Oil Service', 'General Service', 'Brake Pads', 'Tyres', 'Battery', 'Spark Plugs', 'Suspension', 'Timing Belt', 'Custom'];
  today = new Date().toISOString().split('T')[0]; // For max date attribute

  selectedFile: File | null = null;
  fileName = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    this.vehicleId = this.route.snapshot.paramMap.get('id') || '';

    this.serviceForm = this.fb.group({
      serviceType: ['', Validators.required],
      customServiceName: [''],
      date: [this.today, [Validators.required, noFutureDate()]],
      mileage: [215000, [Validators.required, Validators.min(1)]],
      partsCost: [null, [Validators.min(0), noLeadingZero()]],
      laborCost: [null, [Validators.min(0), noLeadingZero()]],
      notes: [''],
      invoiceUrl: ['']
    });

    // Dynamic Validation: If 'Custom' is selected, require min 3 chars
    this.serviceForm.get('serviceType')?.valueChanges.subscribe(type => {
      const customNameControl = this.serviceForm.get('customServiceName');
      if (type === 'Custom') {
        customNameControl?.setValidators([Validators.required, Validators.minLength(3)]);
      } else {
        customNameControl?.clearValidators();
        customNameControl?.setValue(''); // Clear custom name if not custom
      }
      customNameControl?.updateValueAndValidity();
    });
  }

  get isCustom(): boolean {
    return this.serviceForm.get('serviceType')?.value === 'Custom';
  }

  get totalCost(): number {
    const parts = Number(this.serviceForm.get('partsCost')?.value) || 0;
    const labor = Number(this.serviceForm.get('laborCost')?.value) || 0;
    return parts + labor;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.selectedFile = input.files[0];
      this.fileName = input.files[0].name;
    }
  }

    async saveService(): Promise<void> {
    if (this.serviceForm.invalid || this.totalCost === 0) {
      this.serviceForm.markAllAsTouched();
      return;
    }

    let invoiceUrl = '';

    // 1. Upload invoice if a file was selected
    if (this.selectedFile) {
      try {
        invoiceUrl = await this.supabaseService.uploadVehiclePhoto(this.selectedFile, this.vehicleId);
      } catch (error) {
        console.error('Invoice upload failed', error);
      }
    }

    // 2. Prepare the payload for Django
    const formData = {
      service_type: this.serviceForm.value.serviceType,
      custom_name: this.isCustom ? this.serviceForm.value.customServiceName : null,
      date: this.serviceForm.value.date,
      mileage: Number(this.serviceForm.value.mileage),
      parts_cost: Number(this.serviceForm.value.partsCost) || 0,
      labor_cost: Number(this.serviceForm.value.laborCost) || 0,
      total_cost: this.totalCost,
      notes: this.serviceForm.value.notes || '',
      // ✅ CRITICAL FIX: Send `null` instead of an empty string for URLs
      invoice_url: invoiceUrl || null 
    };

    // 3. Send to Django API
    this.vehicleService.logService(this.vehicleId, formData).subscribe({
      next: () => {
        console.log('Service saved successfully!');
        this.router.navigate(['/vehicles', this.vehicleId]);
      },
      error: (err) => {
        console.error('Error saving service:', err);
        
        // ✅ MAGIC FIX: This will print the exact Django validation errors to your console!
        console.error('🔴 Django Validation Errors:', err.error); 
        
        alert('Failed to save service. Check the browser console (F12) to see which field failed.');
      }
    });
  }

  goBack() {
    this.router.navigate(['/vehicles', this.vehicleId]);
  }

  // Helper for error messages
  getFieldError(fieldName: string): string {
    const control = this.serviceForm.get(fieldName);
    if (control?.hasError('required')) return 'This field is required';
    if (control?.hasError('minlength')) return 'Minimum 3 characters required';
    if (control?.hasError('futureDate')) return 'Date cannot be in the future';
    if (control?.hasError('min')) return 'Value must be greater than 0';
    if (control?.hasError('leadingZero')) return 'Cannot start with 0';
    return '';
  }
}