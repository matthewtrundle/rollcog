/**
 * @fileoverview Time slot selection component
 * @module features/scheduling/components/time-slots
 */

import { type ReactElement } from "react";
import type { TimeSlot } from "../types/scheduling.types";

interface TimeSlotsProps {
  slots: TimeSlot[];
  selectedTime: string | null;
  onSelectTime: (time: string) => void;
  isLoading?: boolean;
}

export function TimeSlots({
  slots,
  selectedTime,
  onSelectTime,
  isLoading = false,
}: TimeSlotsProps): ReactElement {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>No available times for this date</p>
        <p className="text-sm mt-1">Please select a different day</p>
      </div>
    );
  }

  const availableSlots = slots.filter((s) => s.available);

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg
          className="w-12 h-12 mx-auto mb-3 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p>All times are booked for this date</p>
        <p className="text-sm mt-1">Please select a different day</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {availableSlots.map((slot) => {
        const isSelected = selectedTime === slot.time;

        return (
          <button
            key={slot.time}
            type="button"
            onClick={() => onSelectTime(slot.time)}
            className={`
              py-3 px-4 rounded-lg border-2 text-center font-medium transition-all duration-200
              ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)] text-white shadow-md"
                  : "border-gray-200 bg-white text-[var(--foreground)] hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
              }
            `}
          >
            {slot.displayTime}
          </button>
        );
      })}
    </div>
  );
}
