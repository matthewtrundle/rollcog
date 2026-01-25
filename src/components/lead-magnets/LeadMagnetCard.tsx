/**
 * @fileoverview Lead magnet CTA card component for landing pages
 * @module components/lead-magnets/LeadMagnetCard
 */

"use client";

import { type ReactElement, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/utils";
import { leadMagnetSchema, type LeadMagnetFormData, type LeadMagnetType } from "./lead-magnet-schema";
import { InspectionQuiz } from "./InspectionQuiz";

interface LeadMagnetCardProps {
  variant?: "quiz" | "inspection-guide" | "maintenance-guide";
  source?: string;
  className?: string;
}

const LEAD_MAGNET_CONFIG = {
  quiz: {
    title: "Not Sure If You Need an Inspection?",
    subtitle: "Take our 2-minute quiz to find out",
    description: "Answer 8 simple questions about your roof and get personalized recommendations.",
    cta: "Start Free Quiz",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  "inspection-guide": {
    title: "Free Roof Inspection Guide",
    subtitle: "The complete checklist for property managers",
    description: "Get our 6-page professional inspection guide with checklists and warning signs.",
    cta: "Get Free Guide",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
  "maintenance-guide": {
    title: "Free Maintenance Guide",
    subtitle: "Year-round roof care made simple",
    description: "Download our 8-page maintenance guide with monthly checklists and seasonal tips.",
    cta: "Download Free Guide",
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

/**
 * Compact lead magnet card for landing pages.
 * Shows either a quiz or email capture for PDF download.
 */
export function LeadMagnetCard({
  variant = "quiz",
  source = "landing-page",
  className = "",
}: LeadMagnetCardProps): ReactElement {
  const [isExpanded, setIsExpanded] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());
  const config = LEAD_MAGNET_CONFIG[variant];

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LeadMagnetFormData>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      leadMagnetType: variant === "quiz" ? "quiz-results" : variant as LeadMagnetType,
      source,
    },
  });

  const handleExpand = (): void => {
    setIsExpanded(true);
    trackEvent("lead_magnet_form_view", "Lead Magnet", variant);
  };

  const onSubmit = async (data: LeadMagnetFormData): Promise<void> => {
    try {
      const response = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      trackEvent("lead_magnet_download", "Lead Magnet", variant);
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  // Success state
  if (submitStatus === "success") {
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-lg border border-[var(--border)] ${className}`}>
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"
          >
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </motion.div>
          <h4 className="font-bold text-[var(--foreground)]">Check Your Email!</h4>
          <p className="text-sm text-[var(--text-body)] mt-1">Your guide is on its way.</p>
        </div>
      </div>
    );
  }

  // Expanded quiz view
  if (isExpanded && variant === "quiz") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl p-6 shadow-lg border border-[var(--border)] ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[var(--foreground)]">Do I Need a Roof Inspection?</h4>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <InspectionQuiz source={source} onComplete={() => setSubmitStatus("success")} />
      </motion.div>
    );
  }

  // Expanded email form view
  if (isExpanded) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`bg-white rounded-2xl p-6 shadow-lg border border-[var(--border)] ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-bold text-[var(--foreground)]">{config.title}</h4>
          <button
            onClick={() => setIsExpanded(false)}
            className="text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          {submitStatus === "error" && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600 text-center">
              Something went wrong. Please try again.
            </div>
          )}

          <input
            type="text"
            {...register("name")}
            placeholder="Your Name *"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
          />
          {errors.name && <p className="text-xs text-red-500 ml-1">{errors.name.message}</p>}

          <input
            type="email"
            {...register("email")}
            placeholder="Email Address *"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
          />
          {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}

          {/* Hidden fields */}
          <input type="hidden" {...register("leadMagnetType")} />
          <input type="hidden" {...register("source")} />

          {/* Honeypot */}
          <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
            <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
          </div>

          <Button type="submit" variant="primary" size="md" className="w-full" isLoading={isSubmitting}>
            {isSubmitting ? "Sending..." : "Send My Free Guide"}
          </Button>
        </form>
      </motion.div>
    );
  }

  // Collapsed card view
  return (
    <div
      className={`bg-gradient-to-br from-[var(--charcoal)] to-[#1e293b] rounded-2xl p-6 shadow-lg ${className}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-14 h-14 bg-[var(--accent)]/20 rounded-xl flex items-center justify-center text-[var(--accent)]">
          {config.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-[var(--accent)] font-semibold uppercase tracking-wider mb-1">
            {config.subtitle}
          </p>
          <h4 className="text-lg font-bold text-white mb-2">{config.title}</h4>
          <p className="text-sm text-white/70 mb-4">{config.description}</p>
          <Button onClick={handleExpand} variant="primary" size="sm">
            {config.cta}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default LeadMagnetCard;
