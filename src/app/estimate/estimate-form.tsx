/**
 * @fileoverview Client-side form component for estimate landing page
 * @module app/estimate/estimate-form
 *
 * Isolated client component to keep main page as Server Component
 */

"use client";

import { type ReactElement, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "@/features/contact/schemas/contact-schema";
import { COMPANY } from "@/lib/utils/constants";
import { trackFormSubmission, trackLandingPageView, getUTMParams } from "@/lib/utils";

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

export function EstimateForm({ source }: EstimateFormProps): ReactElement {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

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

  const onSubmit = async (data: ContactFormData): Promise<void> => {
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source,
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

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

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-[var(--foreground)]">Thank You!</h3>
        <p className="mt-3 text-[var(--text-body)]">
          We&apos;ll contact you within 24 hours with your free estimate.
        </p>
        <a
          href={`tel:${COMPANY.phone}`}
          className="inline-flex items-center gap-2 mt-6 text-[var(--accent)] font-semibold hover:underline"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          Or call us now: {COMPANY.phone}
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
          {isSubmitting ? "Sending..." : "Get My Free Estimate"}
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
