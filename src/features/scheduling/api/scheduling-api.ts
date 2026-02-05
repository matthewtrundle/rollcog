/**
 * @fileoverview API client functions for the scheduling system
 * @module features/scheduling/api
 */

import type {
  AvailabilityResponse,
  SlotsResponse,
  BookingResponse,
  BookingData,
} from "../types/scheduling.types";

/**
 * Fetch weekly availability (next 7 days)
 */
export async function fetchAvailability(days: number = 7): Promise<AvailabilityResponse> {
  const response = await fetch(`/api/scheduling/availability?days=${days}`);
  return response.json();
}

/**
 * Fetch available slots for a specific date
 */
export async function fetchSlots(date: string): Promise<SlotsResponse> {
  const response = await fetch(`/api/scheduling/slots?date=${date}`);
  return response.json();
}

/**
 * Book an appointment
 */
export async function bookAppointment(data: BookingData): Promise<BookingResponse> {
  const response = await fetch("/api/scheduling/book", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  return response.json();
}
