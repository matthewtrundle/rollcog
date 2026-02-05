/**
 * @fileoverview Date picker component for selecting appointment date
 * @module features/scheduling/components/date-picker
 */

import { type ReactElement } from "react";
import type { DayAvailability } from "../types/scheduling.types";

interface DatePickerProps {
  days: DayAvailability[];
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
  isLoading?: boolean;
}

export function DatePicker({
  days,
  selectedDate,
  onSelectDate,
  isLoading = false,
}: DatePickerProps): ReactElement {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {[...Array(7)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {days.map((day) => {
        const isSelected = selectedDate === day.date;
        const isDisabled = !day.isAvailable;

        return (
          <button
            key={day.date}
            type="button"
            onClick={() => !isDisabled && onSelectDate(day.date)}
            disabled={isDisabled}
            className={`
              p-3 rounded-lg border-2 text-center transition-all duration-200
              ${
                isSelected
                  ? "border-[var(--accent)] bg-[var(--accent)]/10 ring-2 ring-[var(--accent)]/20"
                  : isDisabled
                    ? "border-gray-100 bg-gray-50 cursor-not-allowed opacity-50"
                    : "border-gray-100 bg-white hover:border-gray-300 hover:shadow-sm"
              }
            `}
          >
            <div
              className={`text-xs font-medium uppercase ${
                isSelected ? "text-[var(--accent)]" : "text-gray-500"
              }`}
            >
              {day.displayDate.split(",")[0]}
            </div>
            <div
              className={`text-lg font-bold ${
                isSelected ? "text-[var(--foreground)]" : isDisabled ? "text-gray-400" : "text-[var(--foreground)]"
              }`}
            >
              {new Date(day.date + "T12:00:00").getDate()}
            </div>
            <div
              className={`text-xs ${
                isSelected ? "text-[var(--accent)]" : "text-gray-400"
              }`}
            >
              {new Date(day.date + "T12:00:00").toLocaleDateString("en-US", { month: "short" })}
            </div>
          </button>
        );
      })}
    </div>
  );
}
