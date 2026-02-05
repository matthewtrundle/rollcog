/**
 * @fileoverview Booking confirmation display after successful appointment
 * @module features/scheduling/components/booking-confirmation
 */

import { type ReactElement } from "react";
import { COMPANY } from "@/lib/utils/constants";

interface BookingConfirmationProps {
  appointmentDate: string;
  appointmentTime: string;
  propertyAddress?: string;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

export function BookingConfirmation({
  appointmentDate,
  appointmentTime,
  propertyAddress,
}: BookingConfirmationProps): ReactElement {
  return (
    <div className="text-center">
      {/* Success Icon */}
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      {/* Header */}
      <h3 className="text-2xl font-bold text-[var(--foreground)]">You&apos;re All Set!</h3>
      <p className="mt-2 text-[var(--text-body)]">
        Your site visit has been confirmed.
      </p>

      {/* Appointment Details Card */}
      <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left border border-gray-100">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-gray-500">Date & Time</p>
            <p className="font-semibold text-[var(--foreground)]">
              {formatDisplayDate(appointmentDate)}
            </p>
            <p className="text-[var(--accent)] font-medium">
              {formatDisplayTime(appointmentTime)} (Central Time)
            </p>
          </div>
        </div>

        {propertyAddress && (
          <div className="flex items-start gap-3 pt-4 border-t border-gray-200">
            <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Property Address</p>
              <p className="font-medium text-[var(--foreground)]">{propertyAddress}</p>
            </div>
          </div>
        )}
      </div>

      {/* What to expect */}
      <div className="mt-6 text-left">
        <p className="text-sm font-medium text-[var(--foreground)] mb-2">What to Expect:</p>
        <ul className="text-sm text-[var(--text-body)] space-y-1.5">
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Confirmation email sent to your inbox</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Reminder email 24 hours before</span>
          </li>
          <li className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Free, no-obligation estimate provided on-site</span>
          </li>
        </ul>
      </div>

      {/* Contact */}
      <a
        href={`tel:${COMPANY.phone}`}
        className="inline-flex items-center gap-2 mt-6 text-[var(--accent)] font-semibold hover:underline"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        Need to reschedule? Call {COMPANY.phone}
      </a>
    </div>
  );
}
