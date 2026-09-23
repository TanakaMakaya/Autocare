import { Injectable, signal } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  
  // Signal to track upload progress (0 to 100)
  uploadProgress = signal<number>(0);

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseAnonKey);
  }

  async uploadVehiclePhoto(file: File, vehicleId: string): Promise<string> {
    this.uploadProgress.set(0);
    
    // Create a unique file name to prevent collisions
    const fileExt = file.name.split('.').pop();
    const fileName = `${vehicleId}-${Date.now()}.${fileExt}`;
    const filePath = `${fileName}`;

    const { data, error } = await this.supabase.storage
      .from('vehicle-photos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        // Note: Progress tracking in JS SDK is limited, but we simulate it here for UX
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error('Failed to upload image.');
    }

    // Get the public URL
    const { data: urlData } = this.supabase.storage
      .from('vehicle-photos')
      .getPublicUrl(filePath);

    this.uploadProgress.set(100);
    return urlData.publicUrl;
  }
}