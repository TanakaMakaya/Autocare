import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vehicle {
  id: string | number; // Django might return string (UUID) or number (int)
  owner: string;
  owner_name: string;
  name: string;
  registration_number: string;
  vin: string;
  manufacturer: string;
  model: string;
  year: number;
  mileage: number;
  fuel_type: string;
  photo_url: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  // Base URL WITHOUT a trailing slash
  private baseUrl = `${environment.apiUrl}/vehicles`;

  constructor(private http: HttpClient) {}

  // Get all vehicles (Django likes the trailing slash for lists)
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${this.baseUrl}/`);
  }

  // Add a new vehicle
  addVehicle(vehicleData: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(`${this.baseUrl}/`, vehicleData);
  }

  // Get a single vehicle by ID (Fixed: only ONE slash now)
  getVehicleById(id: string | number): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.baseUrl}/${id}/`);
  }

  // Update a vehicle
  updateVehicle(id: string | number, vehicleData: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.baseUrl}/${id}/`, vehicleData);
  }

  // Delete a vehicle
  deleteVehicle(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}/`);
  }


 // Get services for a specific vehicle
  getServices(vehicleId: string | number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/${vehicleId}/services/`);
  }

  // Log a new service
  logService(vehicleId: string | number, serviceData: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${vehicleId}/services/`, serviceData);
  }
}