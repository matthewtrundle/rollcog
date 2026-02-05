/**
 * @fileoverview TypeScript types for the scheduling system
 * @module features/scheduling/types
 */

export interface AvailabilitySlot {
  id: number;
  day_of_week: number; // 0=Sun, 1=Mon, ..., 6=Sat
  start_time: string; // HH:MM format
  end_time: string; // HH:MM format
  slot_duration_minutes: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  lead_id: number;
  appointment_date: string; // YYYY-MM-DD
  appointment_time: string; // HH:MM format
  status: AppointmentStatus;
  property_address: string | null;
  notes: string | null;
  reminder_sent: boolean;
  created_at: Date;
  updated_at: Date;
}

export type AppointmentStatus = "scheduled" | "completed" | "cancelled" | "no_show";

export interface TimeSlot {
  time: string; // HH:MM format (24hr)
  displayTime: string; // e.g., "9:00 AM"
  available: boolean;
}

export interface DayAvailability {
  date: string; // YYYY-MM-DD
  displayDate: string; // e.g., "Mon, Feb 5"
  dayOfWeek: number;
  slots: TimeSlot[];
  isAvailable: boolean;
}

export interface BookingData {
  leadId: number;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  propertyAddress?: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  appointment?: Appointment;
  error?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  days: DayAvailability[];
  error?: string;
}

export interface SlotsResponse {
  success: boolean;
  slots: TimeSlot[];
  date: string;
  error?: string;
}
