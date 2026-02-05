/**
 * @fileoverview Database functions for the scheduling system
 * @module lib/db/scheduling
 */

import { query } from "./index";
import type {
  Appointment,
  AvailabilitySlot,
  TimeSlot,
  DayAvailability,
  BookingData,
  AppointmentStatus,
} from "@/features/scheduling/types/scheduling.types";

/**
 * Format time from HH:MM:SS to HH:MM
 */
function formatTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * Convert 24hr time to 12hr display format
 */
function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

/**
 * Format date for display
 */
function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00"); // Avoid timezone issues
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

/**
 * Get day of week from date (0=Sun, 6=Sat)
 */
function getDayOfWeek(dateStr: string): number {
  const date = new Date(dateStr + "T12:00:00");
  return date.getDay();
}

/**
 * Get availability slots for a specific day of week
 */
export async function getAvailabilitySlotsForDay(
  dayOfWeek: number
): Promise<AvailabilitySlot[]> {
  const result = await query<AvailabilitySlot>(
    `SELECT * FROM availability_slots
     WHERE day_of_week = $1 AND is_active = true
     ORDER BY start_time`,
    [dayOfWeek]
  );
  return result.rows;
}

/**
 * Get all booked appointments for a specific date
 */
export async function getBookedAppointmentsForDate(
  date: string
): Promise<Appointment[]> {
  const result = await query<Appointment>(
    `SELECT * FROM appointments
     WHERE appointment_date = $1
     AND status NOT IN ('cancelled')
     ORDER BY appointment_time`,
    [date]
  );
  return result.rows;
}

/**
 * Generate time slots between start and end time
 */
function generateTimeSlots(
  startTime: string,
  endTime: string,
  durationMinutes: number
): string[] {
  const slots: string[] = [];
  const [startHour, startMin] = startTime.split(":").map(Number);
  const [endHour, endMin] = endTime.split(":").map(Number);

  let currentHour = startHour;
  let currentMin = startMin;

  const endTimeMinutes = endHour * 60 + endMin;

  while (currentHour * 60 + currentMin + durationMinutes <= endTimeMinutes) {
    slots.push(
      `${currentHour.toString().padStart(2, "0")}:${currentMin.toString().padStart(2, "0")}`
    );
    currentMin += durationMinutes;
    if (currentMin >= 60) {
      currentHour += Math.floor(currentMin / 60);
      currentMin = currentMin % 60;
    }
  }

  return slots;
}

/**
 * Get available time slots for a specific date
 */
export async function getAvailableSlots(date: string): Promise<TimeSlot[]> {
  const dayOfWeek = getDayOfWeek(date);

  // Get availability config for this day
  const availabilitySlots = await getAvailabilitySlotsForDay(dayOfWeek);

  if (availabilitySlots.length === 0) {
    return [];
  }

  // Get already booked appointments
  const bookedAppointments = await getBookedAppointmentsForDate(date);
  const bookedTimes = new Set(
    bookedAppointments.map((apt) => formatTime(apt.appointment_time))
  );

  // Generate all possible slots and mark availability
  const allSlots: TimeSlot[] = [];

  for (const availability of availabilitySlots) {
    const times = generateTimeSlots(
      formatTime(availability.start_time),
      formatTime(availability.end_time),
      availability.slot_duration_minutes
    );

    for (const time of times) {
      // Check if this time is in the past for today
      const now = new Date();
      const today = now.toISOString().split("T")[0];
      let isPast = false;

      if (date === today) {
        const [slotHour, slotMin] = time.split(":").map(Number);
        const currentHour = now.getHours();
        const currentMin = now.getMinutes();
        // Add 1 hour buffer - can't book same-day slots less than 1 hour away
        isPast =
          slotHour < currentHour ||
          (slotHour === currentHour && slotMin <= currentMin + 60);
      }

      allSlots.push({
        time,
        displayTime: formatDisplayTime(time),
        available: !bookedTimes.has(time) && !isPast,
      });
    }
  }

  return allSlots;
}

/**
 * Get availability for the next N days
 */
export async function getWeeklyAvailability(
  days: number = 7
): Promise<DayAvailability[]> {
  const result: DayAvailability[] = [];
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();

    const slots = await getAvailableSlots(dateStr);
    const availableSlots = slots.filter((s) => s.available);

    result.push({
      date: dateStr,
      displayDate: formatDisplayDate(dateStr),
      dayOfWeek,
      slots,
      isAvailable: availableSlots.length > 0,
    });
  }

  return result;
}

/**
 * Create a new appointment
 */
export async function createAppointment(
  data: BookingData
): Promise<Appointment> {
  const result = await query<Appointment>(
    `INSERT INTO appointments
     (lead_id, appointment_date, appointment_time, property_address, notes)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [
      data.leadId,
      data.appointmentDate,
      data.appointmentTime,
      data.propertyAddress || null,
      data.notes || null,
    ]
  );

  const appointment = result.rows[0];

  // Update the lead with the appointment reference
  await query(
    `UPDATE leads
     SET appointment_id = $1, booking_status = 'booked', updated_at = NOW()
     WHERE id = $2`,
    [appointment.id, data.leadId]
  );

  return appointment;
}

/**
 * Get an appointment by ID
 */
export async function getAppointmentById(
  id: number
): Promise<Appointment | null> {
  const result = await query<Appointment>(
    "SELECT * FROM appointments WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

/**
 * Get appointment with lead details
 */
export async function getAppointmentWithLead(id: number): Promise<{
  appointment: Appointment;
  lead: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
} | null> {
  const result = await query<
    Appointment & { lead_name: string; lead_email: string; lead_phone: string | null }
  >(
    `SELECT a.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
     FROM appointments a
     JOIN leads l ON a.lead_id = l.id
     WHERE a.id = $1`,
    [id]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  return {
    appointment: {
      id: row.id,
      lead_id: row.lead_id,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      status: row.status,
      property_address: row.property_address,
      notes: row.notes,
      reminder_sent: row.reminder_sent,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    lead: {
      id: row.lead_id,
      name: row.lead_name,
      email: row.lead_email,
      phone: row.lead_phone,
    },
  };
}

/**
 * Update an appointment
 */
export async function updateAppointment(
  id: number,
  data: Partial<{
    appointment_date: string;
    appointment_time: string;
    status: AppointmentStatus;
    property_address: string;
    notes: string;
    reminder_sent: boolean;
  }>
): Promise<Appointment | null> {
  const fields: string[] = [];
  const values: unknown[] = [];
  let paramIndex = 1;

  if (data.appointment_date !== undefined) {
    fields.push(`appointment_date = $${paramIndex++}`);
    values.push(data.appointment_date);
  }
  if (data.appointment_time !== undefined) {
    fields.push(`appointment_time = $${paramIndex++}`);
    values.push(data.appointment_time);
  }
  if (data.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(data.status);
  }
  if (data.property_address !== undefined) {
    fields.push(`property_address = $${paramIndex++}`);
    values.push(data.property_address);
  }
  if (data.notes !== undefined) {
    fields.push(`notes = $${paramIndex++}`);
    values.push(data.notes);
  }
  if (data.reminder_sent !== undefined) {
    fields.push(`reminder_sent = $${paramIndex++}`);
    values.push(data.reminder_sent);
  }

  if (fields.length === 0) return null;

  fields.push(`updated_at = NOW()`);
  values.push(id);

  const result = await query<Appointment>(
    `UPDATE appointments SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result.rows[0] || null;
}

/**
 * Get upcoming appointments needing reminders
 * Returns appointments happening in the next 20-28 hours that haven't had reminders sent
 */
export async function getAppointmentsNeedingReminders(): Promise<
  Array<{
    appointment: Appointment;
    lead: { id: number; name: string; email: string; phone: string | null };
  }>
> {
  const result = await query<
    Appointment & { lead_name: string; lead_email: string; lead_phone: string | null }
  >(
    `SELECT a.*, l.name as lead_name, l.email as lead_email, l.phone as lead_phone
     FROM appointments a
     JOIN leads l ON a.lead_id = l.id
     WHERE a.status = 'scheduled'
     AND a.reminder_sent = false
     AND (a.appointment_date + a.appointment_time)
         BETWEEN NOW() + INTERVAL '20 hours' AND NOW() + INTERVAL '28 hours'
     ORDER BY a.appointment_date, a.appointment_time`
  );

  return result.rows.map((row) => ({
    appointment: {
      id: row.id,
      lead_id: row.lead_id,
      appointment_date: row.appointment_date,
      appointment_time: row.appointment_time,
      status: row.status,
      property_address: row.property_address,
      notes: row.notes,
      reminder_sent: row.reminder_sent,
      created_at: row.created_at,
      updated_at: row.updated_at,
    },
    lead: {
      id: row.lead_id,
      name: row.lead_name,
      email: row.lead_email,
      phone: row.lead_phone,
    },
  }));
}

/**
 * Cancel an appointment
 */
export async function cancelAppointment(id: number): Promise<Appointment | null> {
  const appointment = await updateAppointment(id, { status: "cancelled" });

  if (appointment) {
    // Update the lead's booking status
    await query(
      `UPDATE leads SET booking_status = 'cancelled', updated_at = NOW() WHERE id = $1`,
      [appointment.lead_id]
    );
  }

  return appointment;
}
