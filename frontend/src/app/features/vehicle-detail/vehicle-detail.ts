import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for the upload form inputs
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { SupabaseService } from '../../services/supabase.service'; // Required for document upload
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

export interface VehicleDocument {
  id: number;
  title: string;
  category: string;
  file_url: string;
  created_at: string;
}

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BottomNav, RippleLoader],
  templateUrl: './vehicle-detail.html'
})
export class VehicleDetailComponent implements OnInit {
  // Vehicle State
  vehicle = signal<Vehicle | null>(null);
  isLoading = signal(true);
  errorMessage = signal('');
  
  // Services State
  services = signal<ServiceRecord[]>([]);
  isServicesLoading = signal(false);
  
  // Computed Stats
  lifetimeSpend = computed(() => this.services().reduce((sum, s) => sum + Number(s.total_cost), 0));
  thisYearSpend = computed(() => {
    const currentYear = new Date().getFullYear().toString();
    return this.services()
      .filter(s => s.date.startsWith(currentYear))
      .reduce((sum, s) => sum + Number(s.total_cost), 0);
  });

  // Documents State
  documents = signal<VehicleDocument[]>([]);
  isDocumentsLoading = signal(false);
  showUploadForm = signal(false);
  isUploading = signal(false);
  
  // Upload Form Fields
  uploadFile: File | null = null;
  uploadTitle = '';
  uploadCategory = 'Registration';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private supabaseService: SupabaseService
  ) {}

  ngOnInit(): void {
    const vehicleId = this.route.snapshot.paramMap.get('id');
    if (vehicleId) {
      this.loadVehicle(vehicleId);
      this.loadServices(vehicleId);
      this.loadDocuments(vehicleId);
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

  loadDocuments(vehicleId: string): void {
    this.isDocumentsLoading.set(true);
    this.vehicleService.getDocuments(vehicleId).subscribe({
      next: (data) => {
        this.documents.set(data);
        this.isDocumentsLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching documents:', err);
        this.isDocumentsLoading.set(false);
      }
    });
  }

  deleteService(serviceId: number): void {
    if (confirm('Are you sure you want to delete this service record?')) {
      const vehicleId = this.vehicle()?.id;
      if (!vehicleId) return;

      this.vehicleService.deleteService(vehicleId, serviceId).subscribe({
        next: () => {
          this.services.update(services => services.filter(s => s.id !== serviceId));
        },
        error: (err) => console.error('Failed to delete service', err)
      });
    }
  }

  deleteDocument(docId: number): void {
    if (confirm('Are you sure you want to delete this document?')) {
      const vehicleId = this.vehicle()?.id;
      if (!vehicleId) return;

      this.vehicleService.deleteDocument(vehicleId, docId).subscribe({
        next: () => {
          this.documents.update(docs => docs.filter(d => d.id !== docId));
        },
        error: (err) => console.error('Failed to delete document', err)
      });
    }
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

  // --- Document Upload Logic ---

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.uploadFile = input.files[0];
      // Auto-fill title with filename (without extension) if empty
      if (!this.uploadTitle) {
        this.uploadTitle = this.uploadFile.name.split('.').slice(0, -1).join('.');
      }
    }
  }

  async submitDocument(): Promise<void> {
    if (!this.uploadFile || !this.uploadTitle.trim()) {
      alert('Please select a file and enter a title.');
      return;
    }

    this.isUploading.set(true);
    const vehicleId = this.vehicle()?.id;
    if (!vehicleId) return;

    try {
      // 1. Upload to Supabase
      const fileUrl = await this.supabaseService.uploadDocument(this.uploadFile, vehicleId.toString());

      // 2. Save to Django
      const payload = {
        title: this.uploadTitle.trim(),
        category: this.uploadCategory,
        file_url: fileUrl
      };

      this.vehicleService.addDocument(vehicleId, payload).subscribe({
        next: (newDoc) => {
          this.documents.update(docs => [newDoc, ...docs]);
          this.resetUploadForm();
        },
        error: (err) => {
          console.error('Failed to save document to Django', err);
          alert('Failed to save document details.');
        }
      });
    } catch (error) {
      console.error('Upload failed', error);
      alert('Failed to upload file to storage.');
    } finally {
      this.isUploading.set(false);
    }
  }

  resetUploadForm(): void {
    this.showUploadForm.set(false);
    this.uploadFile = null;
    this.uploadTitle = '';
    this.uploadCategory = 'Registration';
  }

  // --- Helpers ---

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