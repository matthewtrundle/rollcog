/**
 * @fileoverview Client-side form component for estimate landing page
 * @module app/estimate/estimate-form
 *
 * Isolated client component to keep main page as Server Component.
 * Includes optional inline appointment booking.
 */

"use client";

import { type ReactElement, useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "@/features/contact/schemas/contact-schema";
import { COMPANY } from "@/lib/utils/constants";
import { trackFormSubmission, trackLandingPageView, getUTMParams } from "@/lib/utils";
import { DatePicker } from "@/features/scheduling/components/date-picker";
import { TimeSlots } from "@/features/scheduling/components/time-slots";
import { fetchAvailability, fetchSlots } from "@/features/scheduling/api/scheduling-api";
import type { DayAvailability, TimeSlot } from "@/features/scheduling/types/scheduling.types";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

interface EstimateFormProps {
  source: string;
}

function formatDisplayTime(time24: string): string {
  const [hours, minutes] = time24.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, "0")} ${period}`;
}

function formatDisplayDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

export function EstimateForm({ source }: EstimateFormProps): ReactElement {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

  // Scheduling state — collapsed by default, expands on click
  const [showScheduling, setShowScheduling] = useState(false);
  const [days, setDays] = useState<DayAvailability[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [propertyAddress, setPropertyAddress] = useState("");
  const [isLoadingDays, setIsLoadingDays] = useState(false);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState<{
    date: string;
    time: string;
    address?: string;
  } | null>(null);

  // Track page view on mount
  useEffect(() => {
    formLoadedAt.current = Date.now();
    const utmParams = getUTMParams();
    trackLandingPageView(
      utmParams.utm_source || source,
      utmParams.utm_medium || undefined,
      utmParams.utm_campaign || undefined
    );
  }, [source]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    mode: "onBlur",
  });

  // Lazy-load availability when scheduling section is opened
  const hasFetchedDays = useRef(false);
  useEffect(() => {
    if (!showScheduling || hasFetchedDays.current) return;
    hasFetchedDays.current = true;

    async function loadAvailability(): Promise<void> {
      try {
        setIsLoadingDays(true);
        const response = await fetchAvailability(10);
        if (response.success) {
          setDays(response.days);
          const firstAvailable = response.days.find((d) => d.isAvailable);
          if (firstAvailable) {
            setSelectedDate(firstAvailable.date);
          }
        }
      } catch (err) {
        console.error("Failed to load availability:", err);
      } finally {
        setIsLoadingDays(false);
      }
    }
    loadAvailability();
  }, [showScheduling]);

  // Load slots when date changes
  useEffect(() => {
    async function loadSlots(): Promise<void> {
      if (!selectedDate || !showScheduling) return;
      try {
        setIsLoadingSlots(true);
        setSelectedTime(null);
        const response = await fetchSlots(selectedDate);
        if (response.success) {
          setSlots(response.slots);
        }
      } catch (err) {
        console.error("Failed to load slots:", err);
      } finally {
        setIsLoadingSlots(false);
      }
    }
    loadSlots();
  }, [selectedDate, showScheduling]);

  const handleToggleScheduling = (): void => {
    setShowScheduling((prev) => !prev);
  };

  const handleDateSelect = useCallback((date: string) => {
    setSelectedDate(date);
  }, []);

  const handleTimeSelect = useCallback((time: string) => {
    setSelectedTime(time);
  }, []);

  const hasBookingSelected = showScheduling && selectedDate && selectedTime;

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      // Submit lead + optional booking in a single request
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source,
          formLoadedAt: formLoadedAt.current,
          // Include scheduling data if selected
          ...(hasBookingSelected && {
            scheduling: {
              date: selectedDate,
              time: selectedTime,
              propertyAddress: propertyAddress || undefined,
            },
          }),
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

      const result = await response.json();

      // Track form submission
      trackFormSubmission("estimate", source);

      // Google Ads conversion tracking
      if (typeof window !== "undefined" && window.gtag) {
        const formConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION;
        if (formConversionId) {
          window.gtag("event", "conversion", {
            send_to: formConversionId,
          });
        }
      }

      // Track if booking was confirmed
      if (result.booked && selectedDate && selectedTime) {
        setBookedAppointment({
          date: selectedDate,
          time: selectedTime,
          address: propertyAddress || undefined,
        });
      }

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  // Success state
  if (submitStatus === "success") {
    return (
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        {bookedAppointment ? (
          <>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">You&apos;re All Set!</h3>
            <p className="mt-2 text-[var(--text-body)]">
              Your estimate request and site visit have been confirmed.
            </p>

            {/* Appointment details card */}
            <div className="mt-6 bg-gray-50 rounded-xl p-5 text-left border border-gray-100">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Site Visit</p>
                  <p className="font-semibold text-[var(--foreground)]">
                    {formatDisplayDate(bookedAppointment.date)}
                  </p>
                  <p className="text-[var(--accent)] font-medium">
                    {formatDisplayTime(bookedAppointment.time)} (Central)
                  </p>
                </div>
              </div>
              {bookedAppointment.address && (
                <div className="flex items-start gap-3 pt-3 border-t border-gray-200">
                  <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Property</p>
                    <p className="font-medium text-[var(--foreground)]">{bookedAppointment.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 text-left">
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
                  <span>Reminder email 24 hours before your visit</span>
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-[var(--foreground)]">Thank You!</h3>
            <p className="mt-3 text-[var(--text-body)]">
              We&apos;ll contact you within 24 hours with your free estimate.
            </p>
          </>
        )}

        <a
          href={`tel:${COMPANY.phone}`}
          className="inline-flex items-center gap-2 mt-6 text-[var(--accent)] font-semibold hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          {bookedAppointment ? `Need to reschedule? Call ${COMPANY.phone}` : `Or call us now: ${COMPANY.phone}`}
        </a>
      </div>
    );
  }

  const inputStyles = "w-full rounded-xl border-2 border-gray-100 bg-gray-50/50 px-4 py-3.5 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--accent)]/10 transition-all duration-200";

  return (
    <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-2xl">
      {/* Form header */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[var(--foreground)]">
          Get Your Free Estimate
        </h2>
        <p className="text-sm text-[var(--text-muted)] mt-2">
          No obligation. Response within 24 hours.
        </p>
      </div>

      {submitStatus === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-600 text-center">
            Something went wrong. Please try again or call us directly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 relative">
        <div>
          <input
            type="text"
            {...register("name")}
            className={inputStyles}
            placeholder="Your Name *"
          />
          {errors.name && (
            <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.name.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <input
              type="email"
              {...register("email")}
              className={inputStyles}
              placeholder="Email *"
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.email.message}</p>
            )}
          </div>
          <div>
            <input
              type="tel"
              {...register("phone")}
              className={inputStyles}
              placeholder="Phone"
            />
            {errors.phone && (
              <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.phone.message}</p>
            )}
          </div>
        </div>

        <div>
          <textarea
            {...register("message")}
            rows={3}
            className={`${inputStyles} resize-none`}
            placeholder="Tell us about your project... *"
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1.5 ml-1">{errors.message.message}</p>
          )}
        </div>

        {/* Site Visit Scheduling — clickable expandable box */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 overflow-hidden transition-colors duration-200 hover:border-[var(--accent)]/40">
          <button
            type="button"
            onClick={handleToggleScheduling}
            className="w-full flex items-center gap-4 px-4 py-4 text-left"
          >
            {/* Calendar icon with pulsing dot */}
            <div className="relative w-10 h-10 rounded-lg bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {!showScheduling && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--accent)] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[var(--accent)]" />
                </span>
              )}
            </div>

            {/* Title + subtitle */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-[var(--foreground)]">
                Book a FREE Site Visit
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Optional — lock in a time slot now
              </p>
            </div>

            {/* Chevron */}
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 flex-shrink-0 ${showScheduling ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Expanded calendar content */}
          {showScheduling && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100">
              {/* Date Selection */}
              <div className="pt-4">
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                  Preferred Day
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
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Preferred Time
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
                <div>
                  <input
                    type="text"
                    value={propertyAddress}
                    onChange={(e) => setPropertyAddress(e.target.value)}
                    placeholder="Property address for the visit (optional)"
                    className={inputStyles}
                  />
                </div>
              )}

              {/* Selection summary */}
              {selectedDate && selectedTime && (
                <div className="bg-green-50 rounded-lg p-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-green-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <p className="text-sm text-green-700">
                    {formatDisplayDate(selectedDate)} at {formatDisplayTime(selectedTime)}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedDate(null);
                      setSelectedTime(null);
                      setPropertyAddress("");
                    }}
                    className="ml-auto text-gray-400 hover:text-gray-600 text-xs"
                  >
                    Clear
                  </button>
                </div>
              )}

              {/* Disclaimer */}
              <p className="text-xs text-gray-400 leading-relaxed">
                * We&apos;ll do our best to accommodate your preferred time. We may reach out to confirm or adjust.
              </p>
            </div>
          )}
        </div>

        {/* Honeypot */}
        <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
          <label htmlFor="lp-website">Website</label>
          <input
            type="text"
            id="lp-website"
            {...register("website")}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full text-base"
          isLoading={isSubmitting}
        >
          {isSubmitting
            ? "Sending..."
            : hasBookingSelected
              ? "Get Estimate & Book Visit"
              : "Get My Free Estimate"
          }
        </Button>

        <div className="flex items-center justify-center gap-4 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span>No Spam</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            <span>Free</span>
          </div>
        </div>
      </form>
    </div>
  );
}
