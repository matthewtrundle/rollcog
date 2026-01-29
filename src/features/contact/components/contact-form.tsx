"use client";

/**
 * @fileoverview Contact form with European premium styling
 * @module features/contact/components/contact-form
 */

import { type ReactElement, useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "../schemas/contact-schema";
import { SERVICES } from "@/lib/utils/constants";
import { trackFormSubmission } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

function FormField({ label, error, required, children }: FormFieldProps): ReactElement {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-[var(--foreground)]">
        {label}
        {required && <span className="text-[var(--accent)] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-sm text-[var(--accent)]">{error}</p>
      )}
    </div>
  );
}

// Input styles - warm borders, red accent focus, off-white background
const inputStyles = "w-full rounded-[12px] border border-[var(--border-warm)] bg-[var(--off-white)] px-4 py-3.5 text-[var(--foreground)] placeholder-[var(--text-light)] focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors";

/**
 * Contact form component with European premium styling.
 *
 * Features:
 * - Warm border colors
 * - Red accent focus states
 * - Soft-rounded submit button
 *
 * @component
 */
export function ContactForm(): ReactElement {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

  // Track when form was loaded for bot detection
  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

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
      // Add form load timestamp for bot detection
      const submitData = {
        ...data,
        formLoadedAt: formLoadedAt.current,
      };

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Track conversion via Vercel Analytics
      trackFormSubmission("contact", data.service);

      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="rounded-[20px] bg-[var(--success)]/10 border border-[var(--success)] p-10 text-center">
        <svg
          className="h-14 w-14 text-[var(--success)] mx-auto mb-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-2xl font-bold text-[var(--foreground)]">
          Message Sent!
        </h3>
        <p className="mt-3 text-lg text-[var(--text-body)]">
          Thank you for contacting us. We&apos;ll respond within 24 hours.
        </p>
        <Button
          variant="secondary"
          className="mt-8"
          onClick={() => setSubmitStatus("idle")}
        >
          Send Another Message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
      {submitStatus === "error" && (
        <div className="rounded-[12px] bg-[var(--accent)]/10 border border-[var(--accent)] p-4">
          <p className="text-sm text-[var(--accent)]">
            There was an error sending your message. Please try again or call us directly.
          </p>
        </div>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Full Name" error={errors.name?.message} required>
          <input
            type="text"
            {...register("name")}
            className={inputStyles}
            placeholder="John Smith"
          />
        </FormField>

        <FormField label="Email Address" error={errors.email?.message} required>
          <input
            type="email"
            {...register("email")}
            className={inputStyles}
            placeholder="john@company.com"
          />
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField label="Phone Number" error={errors.phone?.message}>
          <input
            type="tel"
            {...register("phone")}
            className={inputStyles}
            placeholder="(555) 123-4567"
          />
        </FormField>

        <FormField label="Company Name" error={errors.company?.message}>
          <input
            type="text"
            {...register("company")}
            className={inputStyles}
            placeholder="ABC Corporation"
          />
        </FormField>
      </div>

      <FormField label="Service Interested In" error={errors.service?.message}>
        <select
          {...register("service")}
          className={inputStyles}
        >
          <option value="">Select a service...</option>
          {SERVICES.map((service) => (
            <option key={service.id} value={service.id}>
              {service.name}
            </option>
          ))}
          <option value="other">Other / Not Sure</option>
        </select>
      </FormField>

      <FormField label="Message" error={errors.message?.message} required>
        <textarea
          {...register("message")}
          rows={5}
          className={`${inputStyles} resize-none`}
          placeholder="Tell us about your roofing project..."
        />
      </FormField>

      {/* Honeypot field - hidden from humans, bots will fill it */}
      <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input
          type="text"
          id="website"
          {...register("website")}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        showArrow
        className="w-full sm:w-auto"
        isLoading={isSubmitting}
      >
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>
    </form>
  );
}
