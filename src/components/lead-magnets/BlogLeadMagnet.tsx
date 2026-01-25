/**
 * @fileoverview Inline lead magnet CTA component for blog articles
 * @module components/lead-magnets/BlogLeadMagnet
 */

"use client";

import { type ReactElement, useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui";
import { trackEvent } from "@/lib/utils";
import { leadMagnetSchema, type LeadMagnetFormData } from "./lead-magnet-schema";

interface BlogLeadMagnetProps {
  variant: "inspection-guide" | "maintenance-guide" | "both";
  articleSlug?: string;
  className?: string;
}

const GUIDE_CONFIG = {
  "inspection-guide": {
    title: "Free Roof Inspection Guide",
    description: "Get our comprehensive 6-page inspection checklist with warning signs, DIY tips, and when to call a professional.",
    badge: "Free Download",
    fileName: "roof-inspection-guide.pdf",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
  "maintenance-guide": {
    title: "Free Maintenance Guide",
    description: "Download our 8-page year-round maintenance guide with monthly checklists, seasonal tips, and emergency procedures.",
    badge: "Free Download",
    fileName: "maintenance-guide.pdf",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
};

/**
 * Inline lead magnet component designed for blog article content.
 * Styled as a callout box that fits within article flow.
 */
export function BlogLeadMagnet({
  variant,
  articleSlug = "blog",
  className = "",
}: BlogLeadMagnetProps): ReactElement {
  const [selectedGuide, setSelectedGuide] = useState<"inspection-guide" | "maintenance-guide">(
    variant === "both" ? "inspection-guide" : variant
  );
  const [showForm, setShowForm] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

  useEffect(() => {
    formLoadedAt.current = Date.now();
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<LeadMagnetFormData>({
    resolver: zodResolver(leadMagnetSchema),
    defaultValues: {
      leadMagnetType: selectedGuide,
      source: `blog-${articleSlug}`,
    },
  });

  const handleSelectGuide = (guide: "inspection-guide" | "maintenance-guide"): void => {
    setSelectedGuide(guide);
    setValue("leadMagnetType", guide);
    setShowForm(true);
    trackEvent("lead_magnet_form_view", "Lead Magnet", `${guide}-blog`);
  };

  const onSubmit = async (data: LeadMagnetFormData): Promise<void> => {
    try {
      const response = await fetch("/api/lead-magnet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          leadMagnetType: selectedGuide,
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit");

      trackEvent("lead_magnet_download", "Lead Magnet", `${selectedGuide}-blog`);
      setSubmitStatus("success");
    } catch {
      setSubmitStatus("error");
    }
  };

  const config = GUIDE_CONFIG[selectedGuide];

  // Success state
  if (submitStatus === "success") {
    return (
      <div className={`my-8 rounded-2xl bg-green-50 border-2 border-green-200 p-6 ${className}`}>
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h4 className="font-bold text-green-800">Check Your Email!</h4>
            <p className="text-sm text-green-700">
              Your free {selectedGuide === "inspection-guide" ? "inspection" : "maintenance"} guide is on its way.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`my-8 rounded-2xl bg-gradient-to-br from-[var(--cream)] to-[#fef3c7] border-2 border-[var(--accent)]/20 p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <span className="inline-flex items-center gap-1 bg-[var(--accent)] text-white text-xs font-bold px-2.5 py-1 rounded-full">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 5a3 3 0 015-2.236A3 3 0 0114.83 6H16a2 2 0 110 4h-5V9a1 1 0 10-2 0v1H4a2 2 0 110-4h1.17C5.06 5.687 5 5.35 5 5zm4 1V5a1 1 0 10-1 1h1zm3 0a1 1 0 10-1-1v1h1z" clipRule="evenodd" />
            <path d="M9 11H3v5a2 2 0 002 2h4v-7zM11 18h4a2 2 0 002-2v-5h-6v7z" />
          </svg>
          {config.badge}
        </span>
      </div>

      {/* Guide selection for "both" variant */}
      {variant === "both" && !showForm && (
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-[var(--foreground)]">
            Get Your Free Roofing Guide
          </h4>
          <p className="text-[var(--text-body)]">
            Choose the guide that&apos;s most relevant to you:
          </p>
          <div className="grid sm:grid-cols-2 gap-3">
            {(["inspection-guide", "maintenance-guide"] as const).map((guide) => (
              <button
                key={guide}
                onClick={() => handleSelectGuide(guide)}
                className="flex items-start gap-3 p-4 rounded-xl bg-white border-2 border-gray-200 hover:border-[var(--accent)] hover:bg-[var(--accent)]/5 transition-all text-left group"
              >
                <div className="flex-shrink-0 w-10 h-10 bg-[var(--accent)]/10 group-hover:bg-[var(--accent)]/20 rounded-lg flex items-center justify-center text-[var(--accent)] transition-colors">
                  {GUIDE_CONFIG[guide].icon}
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {GUIDE_CONFIG[guide].title}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    {guide === "inspection-guide" ? "6 pages • Checklists & tips" : "8 pages • Monthly schedules"}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Single guide or form shown */}
      {(variant !== "both" || showForm) && (
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Guide info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center text-[var(--accent)]">
                {config.icon}
              </div>
              <h4 className="text-lg font-bold text-[var(--foreground)]">{config.title}</h4>
            </div>
            <p className="text-sm text-[var(--text-body)]">{config.description}</p>

            {/* Benefits list */}
            <ul className="mt-4 space-y-2">
              {selectedGuide === "inspection-guide" ? (
                <>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Professional inspection checklist
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Warning signs explained
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    DIY vs professional guidance
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Monthly maintenance checklists
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Seasonal preparation guides
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[var(--text-body)]">
                    <svg className="w-4 h-4 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Emergency response procedures
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Email form */}
          <div className="sm:w-64 flex-shrink-0">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              {submitStatus === "error" && (
                <div className="rounded-lg bg-red-50 border border-red-200 p-2 text-xs text-red-600 text-center">
                  Something went wrong. Please try again.
                </div>
              )}

              <input
                type="text"
                {...register("name")}
                placeholder="Your Name"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}

              <input
                type="email"
                {...register("email")}
                placeholder="Email Address"
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/10 transition-all"
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}

              {/* Hidden fields */}
              <input type="hidden" {...register("leadMagnetType")} />
              <input type="hidden" {...register("source")} />

              {/* Honeypot */}
              <div className="absolute -left-[9999px] opacity-0" aria-hidden="true">
                <input type="text" {...register("website")} tabIndex={-1} autoComplete="off" />
              </div>

              <Button type="submit" variant="primary" size="sm" className="w-full" isLoading={isSubmitting}>
                {isSubmitting ? "Sending..." : "Get Free Guide"}
              </Button>

              <p className="text-xs text-center text-[var(--text-muted)]">
                No spam. Unsubscribe anytime.
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Back button for "both" variant when form is shown */}
      {variant === "both" && showForm && (
        <button
          onClick={() => setShowForm(false)}
          className="mt-4 text-sm text-[var(--text-muted)] hover:text-[var(--foreground)] transition-colors"
        >
          &larr; Choose a different guide
        </button>
      )}
    </div>
  );
}

export default BlogLeadMagnet;
