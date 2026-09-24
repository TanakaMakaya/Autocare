import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomNav } from '../../shared/bottom-nav/bottom-nav';


export interface Reminder {
  id: number;
  title: string;
  vehicleName: string;
  dueDate: string;
  status: 'urgent' | 'soon' | 'upcoming';
  type: 'service' | 'license' | 'insurance';
}

@Component({
  selector: 'app-reminders',
  standalone: true,
  imports: [CommonModule, BottomNav],
  templateUrl: './reminders.html'
})
export class Reminders {
  // Mock data for now
  reminders = signal<Reminder[]>([
    {
      id: 1,
      title: 'License Disc Renewal',
      vehicleName: 'Renault Sandero Stepway',
      dueDate: 'Expires in 14 days',
      status: 'urgent',
      type: 'license'
    },
    {
      id: 2,
      title: 'Oil Change & Filter',
      vehicleName: 'Toyota Hilux D-4D',
      dueDate: 'Due in 500 km',
      status: 'soon',
      type: 'service'
    },
    {
      id: 3,
      title: 'Insurance Premium',
      vehicleName: 'Volkswagen Caddy',
      dueDate: 'Due on 15 Oct 2026',
      status: 'upcoming',
      type: 'insurance'
    },
    {
      id: 4,
      title: 'Brake Pad Inspection',
      vehicleName: 'Renault Sandero Stepway',
      dueDate: 'Due in 2,000 km',
      status: 'upcoming',
      type: 'service'
    }
  ]);

  getIcon(type: string): string {
    switch(type) {
      case 'license': return 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z';
      case 'insurance': return 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z';
      default: return 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z';
    }
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'soon': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'upcoming': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  }
}