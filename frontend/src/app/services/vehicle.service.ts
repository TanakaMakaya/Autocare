import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Vehicle {
  id: string;
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
  owner_name?: string; 
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private apiUrl = `${environment.apiUrl}/vehicles/`;

  constructor(private http: HttpClient) {}

  // Get all vehicles for the logged-in user
  getVehicles(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(this.apiUrl);
  }

  // Add a new vehicle
  addVehicle(vehicleData: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicleData);
  }

  // Get a single vehicle by ID
  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  // Update a vehicle (e.g., update mileage)
  updateVehicle(id: string, vehicleData: Partial<Vehicle>): Observable<Vehicle> {
    return this.http.patch<Vehicle>(`${this.apiUrl}/${id}/`, vehicleData);
  }

  // Delete a vehicle
  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}/`);
  }
}