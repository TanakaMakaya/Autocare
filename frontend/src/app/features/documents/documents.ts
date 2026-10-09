import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router'; // Import Router
import { VehicleService } from '../../services/vehicle.service';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';
import { RippleLoader } from '../../shared/ripple-loader/ripple-loader';

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule, BottomNav, RippleLoader],
  templateUrl: './documents.html'
})
export class DocumentsComponent implements OnInit {
  documents = signal<any[]>([]);
  vehicles = signal<any[]>([]);
  isLoading = signal(true);
  
  // Filter State ('all' by default)
  selectedVehicleId = signal<string>('all');

  constructor(
    private vehicleService: VehicleService,
    private router: Router // Inject Router
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    Promise.all([
      this.vehicleService.getVehicles().toPromise(),
      this.vehicleService.getAllDocuments().toPromise()
    ]).then(([vehicles, documents]) => {
      this.vehicles.set(vehicles || []);
      this.documents.set(documents || []);
      this.isLoading.set(false);
    }).catch(err => {
      console.error('Failed to load documents', err);
      this.isLoading.set(false);
    });
  }

  filteredDocuments = computed(() => {
    const selectedId = this.selectedVehicleId();
    if (selectedId === 'all') return this.documents();
    return this.documents().filter(doc => doc.vehicle === Number(selectedId));
  });

  // Updated to accept the string value directly from the dropdown
  setFilter(vehicleId: string): void {
    this.selectedVehicleId.set(vehicleId);
  }

  // New method for the back button
  goBack(): void {
    this.router.navigate(['/profile']);
  }

  openDocument(url: string): void {
    window.open(url, '_blank');
  }

  getFileIcon(category: string): string {
    if (category === 'Registration' || category === 'License') return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
    if (category === 'Insurance') return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
    return 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z';
  }

  formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}