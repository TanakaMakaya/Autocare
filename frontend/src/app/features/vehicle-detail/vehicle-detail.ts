import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Required for the upload form inputs
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { SupabaseService } from '../../services/supabase.service'; // Required for document upload
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';
import { ConfirmModalComponent } from '../../shared/confirm-modal/confirm-modal';

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

export interface VehicleReminder {
  id: number;
  title: string;
  due_date: string | null;
  due_mileage: number | null;
  notes: string;
  is_completed: boolean;
  created_at: string;
}

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, BottomNav, RippleLoader, ConfirmModalComponent],
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

  // Dynamic "Next up" reminder
  nextUp = computed(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    
    const upcoming = this.reminders()
      // 1. Filter out completed reminders and ones without a due date
      .filter(r => !r.is_completed && !!r.due_date && r.due_date >= todayStr)
      // 2. Safely sort by date (TypeScript now knows it's a string)
      .sort((a, b) => (a.due_date as string).localeCompare(b.due_date as string));

    return upcoming.length > 0 ? upcoming[0].title : 'All caught up!';
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

    // Reminders State
  reminders = signal<VehicleReminder[]>([]);
  isRemindersLoading = signal(false);
  showReminderForm = signal(false);
  isSavingReminder = signal(false);
  
  // Reminder Form Fields
  reminderTitle = '';
  reminderDate = '';
  reminderMileage = '';
  reminderNotes = '';

  today = new Date().toISOString().split('T')[0]; 

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
      this.loadReminders(vehicleId);
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
    this.openModal(
      'Delete service record?', 
      'This action cannot be undone.',
      () => {
        const vehicleId = this.vehicle()?.id;
        if (!vehicleId) return;
        this.vehicleService.deleteService(vehicleId, serviceId).subscribe({
          next: () => this.services.update(s => s.filter(svc => svc.id !== serviceId)),
          error: (err) => console.error('Failed to delete service', err)
        });
      }
    );
  }

  deleteDocument(docId: number): void {
    this.openModal(
      'Delete document?', 
      'This will remove the document from your records.',
      () => {
        const vehicleId = this.vehicle()?.id;
        if (!vehicleId) return;
        this.vehicleService.deleteDocument(vehicleId, docId).subscribe({
          next: () => this.documents.update(d => d.filter(doc => doc.id !== docId)),
          error: (err) => console.error('Failed to delete document', err)
        });
      }
    );
  }

  goBack() {
    this.router.navigate(['/vehicles']);
  }

  deleteVehicle(): void {
    this.openModal(
      'Remove vehicle?', 
      'This will permanently delete this vehicle and all its associated records.',
      () => {
        const id = this.vehicle()?.id;
        if (!id) return;
        this.vehicleService.deleteVehicle(id).subscribe({
          next: () => this.router.navigate(['/vehicles']),
          error: (err) => console.error('Failed to delete vehicle', err)
        });
      }
    );
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

    loadReminders(vehicleId: string): void {
    this.isRemindersLoading.set(true);
    this.vehicleService.getReminders(vehicleId).subscribe({
      next: (data) => {
        this.reminders.set(data);
        this.isRemindersLoading.set(false);
      },
      error: (err) => {
        console.error('Error fetching reminders:', err);
        this.isRemindersLoading.set(false);
      }
    });
  }

  submitReminder(): void {
    if (!this.reminderTitle.trim()) {
      alert('Please enter a reminder title.');
      return;
    }

    this.isSavingReminder.set(true);
    const vehicleId = this.vehicle()?.id;
    if (!vehicleId) return;

    const payload = {
      title: this.reminderTitle.trim(),
      due_date: this.reminderDate || null,
      due_mileage: this.reminderMileage ? Number(this.reminderMileage) : null,
      notes: this.reminderNotes.trim(),
      is_completed: false
    };

    this.vehicleService.addReminder(vehicleId, payload).subscribe({
      next: (newReminder) => {
        this.reminders.update(reminders => [...reminders, newReminder]);
        this.resetReminderForm();
      },
      error: (err) => {
        console.error('Failed to save reminder', err);
        alert('Failed to save reminder.');
      },
      complete: () => this.isSavingReminder.set(false)
    });
  }

  deleteReminder(reminderId: number): void {
    this.openModal(
      'Delete reminder?', 
      'This reminder will be permanently removed.',
      () => {
        const vehicleId = this.vehicle()?.id;
        if (!vehicleId) return;
        this.vehicleService.deleteReminder(vehicleId, reminderId).subscribe({
          next: () => this.reminders.update(r => r.filter(rem => rem.id !== reminderId)),
          error: (err) => console.error('Failed to delete reminder', err)
        });
      }
    );
  }
  resetReminderForm(): void {
    this.showReminderForm.set(false);
    this.reminderTitle = '';
    this.reminderDate = '';
    this.reminderMileage = '';
    this.reminderNotes = '';
  }

  // Helper to format date nicely for the UI
  formatReminderDate(dateStr: string | null): string {
    if (!dateStr) return 'No date set';
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }

    toggleReminderCompletion(reminder: VehicleReminder): void {
    const vehicleId = this.vehicle()?.id;
    if (!vehicleId) return;

    // 1. Optimistic UI update (flip the status instantly)
    const newStatus = !reminder.is_completed;
    this.reminders.update(reminders => 
      reminders.map(r => r.id === reminder.id ? { ...r, is_completed: newStatus } : r)
    );

    // 2. Send to backend
    this.vehicleService.updateReminder(vehicleId, reminder.id, { is_completed: newStatus }).subscribe({
      error: (err) => {
        console.error('Failed to update reminder', err);
        // Revert UI if the backend fails
        this.reminders.update(reminders => 
          reminders.map(r => r.id === reminder.id ? { ...r, is_completed: reminder.is_completed } : r)
        );
      }
    });
  }

    // Modal State
  modalState = signal({
    isOpen: false,
    title: '',
    message: '',
    action: null as (() => void) | null,
    isDestructive: true
  });

  openModal(title: string, message: string, action: () => void, isDestructive = true): void {
    this.modalState.set({
      isOpen: true,
      title,
      message,
      action,
      isDestructive
    });
  }

  closeModal(): void {
    this.modalState.update(state => ({ ...state, isOpen: false, action: null }));
  }

  handleModalConfirm(): void {
    if (this.modalState().action) {
      this.modalState().action!(); // Execute the delete logic
    }
    this.closeModal();
  }
}