/**
 * @fileoverview Scheduling feature exports
 * @module features/scheduling
 */

// Components
export { BookingFlow } from "./components/booking-flow";
export { DatePicker } from "./components/date-picker";
export { TimeSlots } from "./components/time-slots";
export { BookingConfirmation } from "./components/booking-confirmation";
export { ProgressIndicator } from "./components/progress-indicator";

// API
export { fetchAvailability, fetchSlots, bookAppointment } from "./api/scheduling-api";

// Types
export type {
  AvailabilitySlot,
  Appointment,
  AppointmentStatus,
  TimeSlot,
  DayAvailability,
  BookingData,
  BookingResponse,
  AvailabilityResponse,
  SlotsResponse,
} from "./types/scheduling.types";

// Email templates
export {
  generateBookingConfirmationEmail,
  generateBookingConfirmationEmailText,
  generateReminderEmail,
  generateReminderEmailText,
} from "./email-templates";
