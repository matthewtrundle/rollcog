/**
 * @fileoverview Main booking flow component
 * @module features/scheduling/components/booking-flow
 */

"use client";

import { type ReactElement, useState, useEffect, useCallback } from "react";
import { ProgressIndicator } from "./progress-indicator";
import { DatePicker } from "./date-picker";
import { TimeSlots } from "./time-slots";
import { BookingConfirmation } from "./booking-confirmation";
import { fetchAvailability, fetchSlots, bookAppointment } from "../api/scheduling-api";
import type { DayAvailability, TimeSlot } from "../types/scheduling.types";
import { Button } from "@/components/ui";

interface BookingFlowProps {
  leadId: number;
  onSkip?: () => void;
}

type BookingStep = "booking" | "confirmed";

export function BookingFlow({ leadId, onSkip }: BookingFlowProps): ReactElement {
  const [step, setStep] = useState<BookingStep>("booking");
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [isLoadingDays, setIsLoadingDays] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load weekly availability on mount
  useEffect(() => {
    async function loadAvailability(): Promise<void> {
      try {
        setIsLoadingDays(true);
        const response = await fetchAvailability(10);
        if (response.success) {
          setDays(response.days);
          // Auto-select first available day
          const firstAvailable = response.days.find((d) => d.isAvailable);
          if (firstAvailable) {
            setSelectedDate(firstAvailable.date);
          }
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
        setError("Failed to load available dates. Please try again.");
      } finally {
        setIsLoadingDays(false);
      }
    }
    loadAvailability();
  }, []);

  // Load slots when date changes
  useEffect(() => {
    async function loadSlots(): Promise<void> {
      if (!selectedDate) return;

      try {
        setIsLoadingSlots(true);
        setSelectedTime(null);
        const response = await fetchSlots(selectedDate);
        if (response.success) {
          setSlots(response.slots);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
        setError("Failed to load time slots. Please try again.");
      } finally {
        setIsLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDate]);

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
    setError(null);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
    setError(null);
  }, []);

  const handleSubmit = async (): Promise<void> => {
    if (!selectedDate || !selectedTime) {
      setError("Please select a date and time");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const response = await bookAppointment({
        leadId,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        propertyAddress: propertyAddress || undefined,
      });

      if (response.success) {
        setStep("confirmed");
      } else {
        setError(response.error || "Failed to book appointment. Please try again.");
      }
    } catch (err) {
      console.error("Booking error:", err);
      setError("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show confirmation after booking
  if (step === "confirmed" && selectedDate && selectedTime) {
    return (
      <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
        <ProgressIndicator currentStep={3} />
        <BookingConfirmation
          appointmentDate={selectedDate}
          appointmentTime={selectedTime}
          propertyAddress={propertyAddress || undefined}
        />
      </div>
    );
  }

  // Booking form
  return (
    <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
      <ProgressIndicator currentStep={2} />

      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[var(--foreground)]">
          Request Received!
        </h2>
        <p className="text-sm text-[var(--text-body)] mt-1">
          Now book your FREE site visit to lock in your spot.
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>
      )}

      {/* Date Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
          Select a Date
        </label>
        <DatePicker
          days={days}
          selectedDate={selectedDate}
          onSelectDate={handleDateSelect}
          isLoading={isLoadingDays}
        />
      </div>

      {/* Time Selection */}
      {selectedDate && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-3">
            Select a Time
          </label>
          <TimeSlots
            slots={slots}
            selectedTime={selectedTime}
            onSelectTime={handleTimeSelect}
            isLoading={isLoadingSlots}
          />
        </div>
      )}

      {/* Property Address */}
      {selectedTime && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
            Property Address <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={propertyAddress}
            onChange={(e) => setPropertyAddress(e.target.value)}
            placeholder="123 Main St, Chicago, IL 60601"
            className="w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3.5 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-200"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Where should we meet you for the inspection?
          </p>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="button"
        variant="primary"
        size="lg"
        className="w-full text-base"
        onClick={handleSubmit}
        disabled={!selectedDate || !selectedTime || isSubmitting}
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Booking..." : "Book My Site Visit"}
      </Button>

      {/* Skip option */}
      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
        >
          Skip for now - I&apos;ll wait for a call
        </button>
      )}

      {/* Trust signals */}
      <div className="flex items-center justify-center gap-4 pt-4 mt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Free Estimate</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>No Obligation</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>30-45 mins</span>
        </div>
      </div>
    </div>
  );
}
