/**
 * @fileoverview Google Ads Landing Page - Conversion-optimized
 * @module app/estimate/page
 *
 * Key differences from homepage:
 * - Form above the fold (inline with hero)
 * - No navigation menu (reduces exits)
 * - Shorter page (3-4 sections max)
 * - Click-to-call prominent
 * - Dynamic headline based on ad group
 */

"use client";

import { type ReactElement, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, type Variants } from "framer-motion";
import { Button, Section } from "@/components/ui";
import { contactFormSchema, type ContactFormData } from "@/features/contact/schemas/contact-schema";
import { COMPANY } from "@/lib/utils/constants";
import { trackEvent } from "@/lib/utils";

// Dynamic headlines based on source parameter
const HEADLINES: Record<string, { headline: string; subheadline: string }> = {
  repair: {
    headline: "Emergency Commercial Roof Repair in Chicago",
    subheadline: "Fast response. Expert repairs. Protect your business today.",
  },
  "flat-roof": {
    headline: "Chicago's Flat Roof Specialists",
    subheadline: "TPO, Modified Bitumen & EPDM experts with 27+ years experience.",
  },
  industrial: {
    headline: "Industrial & Warehouse Roofing Experts",
    subheadline: "Large-scale projects. Minimal disruption. On-time delivery.",
  },
  general: {
    headline: "Commercial Roofing Contractors - Free Estimate",
    subheadline: "GAF Certified. 24-Hour Estimates. Multi-State Coverage.",
  },
};

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

// Trust badges data
const TRUST_BADGES = [
  { icon: "certificate", text: "GAF Certified" },
  { icon: "clock", text: "24-Hour Estimates" },
  { icon: "experience", text: `${COMPANY.experience} Years Experience` },
];

// Simplified testimonials for landing page
const TESTIMONIALS = [
  {
    quote: "Rollcog Roofs transformed our old, worn-out roof into a modern marvel. Their expertise and professionalism were evident from the start.",
    name: "Jamie T.",
    location: "Illinois",
  },
  {
    quote: "The team at Rollcog Roofs provided a fast and cost-effective solution when our business was in a bind. Truly the best in the region!",
    name: "Raj S.",
    location: "Ohio",
  },
];

// Why choose us features
const FEATURES = [
  { title: "Free Inspections", description: "No-obligation roof assessments" },
  { title: "24-Hour Estimates", description: "Quick turnaround on quotes" },
  { title: "Emergency Service", description: "Repairs within 5 days" },
  { title: "Multi-State Coverage", description: "Serving 9+ states" },
];

/**
 * Landing Page Content - wrapped in Suspense for useSearchParams
 */
function LandingPageContent(): ReactElement {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "general";
  const { headline, subheadline } = HEADLINES[source] || HEADLINES.general;

  // Track landing page view with source
  useEffect(() => {
    trackEvent("landing_page_view", "Landing Page", source);
  }, [source]);

  return (
    <div className="min-h-screen bg-[var(--cream)]">
      {/* Minimal Header - Logo only */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--charcoal)]">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo.png"
              alt="Rollcog Roofs"
              width={40}
              height={40}
              className="rounded"
            />
            <span className="text-white font-semibold text-lg hidden sm:block">
              Rollcog Roofs
            </span>
          </Link>
          {/* Click-to-call for mobile */}
          <a
            href={`tel:${COMPANY.phone}`}
            className="flex items-center gap-2 text-white hover:text-[var(--accent)] transition-colors"
            onClick={() => trackEvent("phone_click", "Landing Page", source)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <span className="font-semibold">{COMPANY.phone}</span>
          </a>
        </div>
      </header>

      {/* Hero Section with Inline Form */}
      <HeroSection
        headline={headline}
        subheadline={subheadline}
        source={source}
      />

      {/* Why Choose Us */}
      <WhyChooseUsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Final CTA */}
      <FinalCTASection source={source} />
    </div>
  );
}

/**
 * Hero section with inline contact form
 */
function HeroSection({
  headline,
  subheadline,
  source,
}: {
  headline: string;
  subheadline: string;
  source: string;
}): ReactElement {
  return (
    <section className="bg-[var(--charcoal)] text-white pt-24 pb-16 lg:pt-28 lg:pb-20">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left Column - Headlines + Trust Badges */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:sticky lg:top-28"
          >
            <motion.h1
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-tight"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              {headline}
            </motion.h1>

            <motion.div variants={fadeInUp} className="w-20 h-1 bg-[var(--accent)] mt-6" />

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg text-white/80 leading-relaxed"
            >
              {subheadline}
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 flex flex-wrap gap-6"
            >
              {TRUST_BADGES.map((badge) => (
                <div key={badge.text} className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm text-white/70">{badge.text}</span>
                </div>
              ))}
            </motion.div>

            {/* Click-to-call on larger screens */}
            <motion.div variants={fadeInUp} className="mt-8">
              <p className="text-sm text-white/60 mb-2">Prefer to talk?</p>
              <a
                href={`tel:${COMPANY.phone}`}
                className="inline-flex items-center gap-3 text-xl font-semibold text-white hover:text-[var(--accent)] transition-colors"
                onClick={() => trackEvent("phone_click", "Landing Page Hero", source)}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {COMPANY.phone}
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column - Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <LandingPageForm source={source} />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/**
 * Simplified contact form for landing page
 */
function LandingPageForm({ source }: { source: string }): ReactElement {
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
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          source, // Include source for tracking
          formLoadedAt: formLoadedAt.current, // Bot detection
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Track conversion with source parameter for Google Ads
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "generate_lead", {
          event_category: "Lead",
          event_label: source,
          value: 100,
          currency: "USD",
        });
      }

      trackEvent("form_submit", "Landing Page", source);
      setSubmitStatus("success");
      reset();
    } catch {
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="bg-white rounded-2xl p-8 shadow-xl text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

  const inputStyles = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-[var(--foreground)] placeholder-gray-400 focus:border-[var(--accent)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 transition-colors";

  return (
    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xl">
      <h2 className="text-xl font-bold text-[var(--foreground)] mb-2">
        Get Your Free Estimate
      </h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">
        Fill out the form below and we&apos;ll respond within 24 hours.
      </p>

      {submitStatus === "error" && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6">
          <p className="text-sm text-red-600">
            There was an error. Please try again or call us directly.
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
            <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <input
            type="email"
            {...register("email")}
            className={inputStyles}
            placeholder="Email Address *"
          />
          {errors.email && (
            <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <input
            type="tel"
            {...register("phone")}
            className={inputStyles}
            placeholder="Phone Number"
          />
          {errors.phone && (
            <p className="text-xs text-red-500 mt-1">{errors.phone.message}</p>
          )}
        </div>

        <div>
          <textarea
            {...register("message")}
            rows={3}
            className={`${inputStyles} resize-none`}
            placeholder="Tell us about your roofing project... *"
          />
          {errors.message && (
            <p className="text-xs text-red-500 mt-1">{errors.message.message}</p>
          )}
        </div>

        {/* Honeypot field - hidden from humans, bots will fill it */}
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
          className="w-full"
          isLoading={isSubmitting}
        >
          {isSubmitting ? "Sending..." : "Get Free Estimate"}
        </Button>

        <p className="text-xs text-center text-gray-400 mt-4">
          No spam. No obligation. Just honest pricing.
        </p>
      </form>
    </div>
  );
}

/**
 * Why Choose Us section with 4 feature boxes
 */
function WhyChooseUsSection(): ReactElement {
  return (
    <Section variant="cream" padding="lg">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="text-center mb-12"
      >
        <motion.p
          variants={fadeInUp}
          className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3"
        >
          Why Choose Us
        </motion.p>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl lg:text-4xl font-semibold text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
        >
          The Rollcog Difference
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {FEATURES.map((feature) => (
          <motion.div
            key={feature.title}
            variants={fadeInUp}
            className="bg-white rounded-xl p-6 text-center shadow-sm border border-[var(--border)]"
          >
            <h3 className="font-semibold text-[var(--foreground)] mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-[var(--text-muted)]">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/**
 * Testimonials section - 2 cards
 */
function TestimonialsSection(): ReactElement {
  return (
    <Section variant="white" padding="lg">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="text-center mb-12"
      >
        <motion.p
          variants={fadeInUp}
          className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-3"
        >
          Testimonials
        </motion.p>
        <motion.h2
          variants={fadeInUp}
          className="text-3xl lg:text-4xl font-semibold text-[var(--foreground)]"
          style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
        >
          What Our Clients Say
        </motion.h2>
      </motion.div>

      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
        className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto"
      >
        {TESTIMONIALS.map((testimonial) => (
          <motion.div
            key={testimonial.name}
            variants={fadeInUp}
            className="bg-[var(--cream)] rounded-2xl p-8"
          >
            {/* 5 stars */}
            <div className="flex gap-1 mb-4">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-[var(--accent)]"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>

            <blockquote className="text-[var(--text-body)] leading-relaxed mb-6">
              &ldquo;{testimonial.quote}&rdquo;
            </blockquote>

            <div className="pt-4 border-t border-[var(--border)]">
              <p className="font-medium text-[var(--foreground)]">
                {testimonial.name}
              </p>
              <p className="text-sm text-[var(--text-muted)]">
                {testimonial.location}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </Section>
  );
}

/**
 * Final CTA section with phone and scroll-to-form
 */
function FinalCTASection({ source }: { source: string }): ReactElement {
  const scrollToForm = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="bg-[var(--charcoal)] text-white py-16 lg:py-20">
      <div className="mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.h2
            variants={fadeInUp}
            className="text-3xl lg:text-4xl font-semibold mb-6"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Ready to Get Started?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-lg text-white/80 mb-10 max-w-2xl mx-auto"
          >
            Get your free, no-obligation estimate today. Our team will respond within 24 hours.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center justify-center gap-3 bg-white text-[var(--charcoal)] font-semibold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors"
              onClick={() => trackEvent("phone_click", "Landing Page CTA", source)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {COMPANY.phone}
            </a>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold px-8 py-4 rounded-2xl hover:bg-[var(--accent-dark)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Back to Form
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Minimal footer */}
      <div className="mt-16 pt-8 border-t border-white/10 text-center text-sm text-white/50">
        <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        <div className="mt-2 flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-white/80 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/80 transition-colors">
            Terms of Service
          </Link>
        </div>
      </div>
    </section>
  );
}

/**
 * Main landing page component
 */
export default function EstimateLandingPage(): ReactElement {
  return (
    <Suspense fallback={<LandingPageSkeleton />}>
      <LandingPageContent />
    </Suspense>
  );
}

/**
 * Loading skeleton for the landing page
 */
function LandingPageSkeleton(): ReactElement {
  return (
    <div className="min-h-screen bg-[var(--charcoal)]">
      <div className="animate-pulse pt-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="h-12 bg-white/10 rounded-lg w-3/4" />
            <div className="h-4 bg-white/10 rounded w-1/2" />
            <div className="h-20 bg-white/10 rounded w-full" />
          </div>
          <div className="h-[400px] bg-white/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
