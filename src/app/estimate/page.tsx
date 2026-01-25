/**
 * @fileoverview Google Ads Landing Page - Premium conversion-optimized design
 * @module app/estimate/page
 *
 * Key features:
 * - Hero video background with form overlay
 * - Dynamic content based on ad source
 * - Trust signals and social proof
 * - Animated stats counters
 * - Premium testimonials with photos
 * - Mobile-optimized click-to-call
 */

"use client";

import { type ReactElement, useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, useScroll, useTransform, type Variants, useInView } from "framer-motion";
import { Button } from "@/components/ui";
import { LeadMagnetCard } from "@/components/lead-magnets";
import { contactFormSchema, type ContactFormData } from "@/features/contact/schemas/contact-schema";
import { COMPANY } from "@/lib/utils/constants";
import { trackEvent } from "@/lib/utils";

// Dynamic content based on source parameter
const SOURCE_CONFIG: Record<string, {
  headline: string;
  subheadline: string;
  video: string;
  poster: string;
  accentFeature: string;
}> = {
  repair: {
    headline: "Emergency Roof Repair",
    subheadline: "Fast response. Expert repairs. Protect your business today.",
    video: "/videos/aerial-drone.mp4",
    poster: "/images/flat-roof-repair.png",
    accentFeature: "Emergency repairs within 5 days",
  },
  "flat-roof": {
    headline: "Flat Roof Specialists",
    subheadline: "TPO, Modified Bitumen & EPDM experts with 27+ years experience.",
    video: "/videos/aerial-scene.mp4",
    poster: "/images/tpo-roofing-installation.png",
    accentFeature: "20-30 year roof lifespan",
  },
  industrial: {
    headline: "Industrial Roofing Experts",
    subheadline: "Large-scale projects. Minimal disruption. On-time delivery.",
    video: "/videos/commercial-building.mp4",
    poster: "/images/commercial-warehouse-roofing.png",
    accentFeature: "Multi-state coverage",
  },
  general: {
    headline: "Commercial Roofing",
    subheadline: "GAF Certified contractors with 27+ years of excellence.",
    video: "/videos/hero-cinematic.mp4",
    poster: "/images/hero-roofing-team.png",
    accentFeature: "24-hour estimate delivery",
  },
};

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

// Stats data
const STATS = [
  { value: 27, suffix: "+", label: "Years Experience" },
  { value: 500, suffix: "+", label: "Projects Completed" },
  { value: 9, suffix: "+", label: "States Served" },
  { value: 24, suffix: "hr", label: "Estimate Delivery" },
];

// Trust badges
const TRUST_BADGES = [
  { icon: "shield", text: "GAF Certified" },
  { icon: "clock", text: "24-Hour Estimates" },
  { icon: "star", text: "5-Star Rated" },
  { icon: "check", text: "Licensed & Insured" },
];

// Premium testimonials with photos
const TESTIMONIALS = [
  {
    quote: "Rollcog transformed our warehouse roof in record time. Professional from start to finish.",
    name: "Michael Chen",
    title: "Facility Director",
    company: "Midwest Logistics",
    image: "/images/hero-roofing-team.png",
    rating: 5,
  },
  {
    quote: "Emergency repair when we needed it most. They saved us from a potential disaster.",
    name: "Sarah Thompson",
    title: "Property Manager",
    company: "Sterling Properties",
    image: "/images/roofing-inspection.png",
    rating: 5,
  },
];

/**
 * Landing Page Content - wrapped in Suspense for useSearchParams
 */
function LandingPageContent(): ReactElement {
  const searchParams = useSearchParams();
  const source = searchParams.get("source") || "general";
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.general;

  // Track landing page view with source
  useEffect(() => {
    trackEvent("landing_page_view", "Landing Page", source);
  }, [source]);

  return (
    <div className="min-h-screen bg-[var(--charcoal)]">
      {/* Minimal Header */}
      <Header source={source} />

      {/* Hero with Video Background */}
      <HeroSection config={config} source={source} />

      {/* Trust Bar */}
      <TrustBar />

      {/* Stats Section */}
      <StatsSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* Lead Magnet Section */}
      <LeadMagnetSection source={source} />

      {/* Final CTA */}
      <FinalCTASection source={source} />
    </div>
  );
}

/**
 * Minimal header with logo and phone
 */
function Header({ source }: { source: string }): ReactElement {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 via-black/50 to-transparent"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <Image
            src="/images/logo.png"
            alt="Rollcog Roofs"
            width={44}
            height={44}
            className="rounded-lg shadow-lg"
          />
          <span className="text-white font-semibold text-lg hidden sm:block group-hover:text-[var(--accent)] transition-colors">
            Rollcog Roofs
          </span>
        </Link>

        <a
          href={`tel:${COMPANY.phone}`}
          className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-4 py-2.5 rounded-full text-white transition-all hover:scale-105"
          onClick={() => trackEvent("phone_click", "Landing Page Header", source)}
        >
          <div className="w-8 h-8 bg-[var(--accent)] rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <span className="font-semibold hidden sm:block">{COMPANY.phone}</span>
          <span className="font-semibold sm:hidden">Call Now</span>
        </a>
      </div>
    </motion.header>
  );
}

/**
 * Hero section with video background and floating form
 */
function HeroSection({
  config,
  source,
}: {
  config: typeof SOURCE_CONFIG.general;
  source: string;
}): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const overlayOpacity = useTransform(scrollYProgress, [0, 0.5], [0.6, 0.8]);

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden">
      {/* Video Background */}
      <motion.div className="absolute inset-0" style={{ scale: videoScale }}>
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          poster={config.poster}
        >
          <source src={config.video} type="video/mp4" />
        </video>
      </motion.div>

      {/* Gradient Overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40"
        style={{ opacity: overlayOpacity }}
      />

      {/* Additional cinematic overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

      {/* Content Grid */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-32 lg:pb-24 w-full">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column - Content */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="lg:col-span-6 xl:col-span-7"
          >
            {/* Badge */}
            <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm text-white/90 font-medium">Free Estimates Available</span>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-white leading-[1.05] tracking-tight"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              {config.headline}
              <span className="text-[var(--accent)]">.</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="mt-6 text-lg sm:text-xl text-white/80 leading-relaxed max-w-xl"
            >
              {config.subheadline}
            </motion.p>

            {/* Feature highlight */}
            <motion.div
              variants={fadeInUp}
              className="mt-8 flex items-center gap-3 bg-[var(--accent)]/20 backdrop-blur-sm px-5 py-3 rounded-xl w-fit"
            >
              <svg className="w-6 h-6 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="text-white font-medium">{config.accentFeature}</span>
            </motion.div>

            {/* Trust badges row */}
            <motion.div
              variants={fadeInUp}
              className="mt-10 pt-8 border-t border-white/20"
            >
              <div className="flex flex-wrap gap-x-8 gap-y-4">
                {TRUST_BADGES.slice(0, 3).map((badge) => (
                  <div key={badge.text} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                      <svg className="w-3 h-3 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-sm text-white/70">{badge.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mobile CTA - shows below form on mobile */}
            <motion.div variants={fadeInUp} className="mt-8 lg:hidden">
              <a
                href={`tel:${COMPANY.phone}`}
                className="flex items-center justify-center gap-3 bg-white text-[var(--charcoal)] font-semibold px-6 py-4 rounded-xl w-full hover:bg-gray-100 transition-colors"
                onClick={() => trackEvent("phone_click", "Landing Page Hero Mobile", source)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                Call {COMPANY.phone}
              </a>
            </motion.div>
          </motion.div>

          {/* Right Column - Form Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="lg:col-span-6 xl:col-span-5"
          >
            <div className="relative">
              {/* Glow effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-orange-400 rounded-3xl blur-lg opacity-30" />
              <LandingPageForm source={source} />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * Premium contact form with glass effect
 */
function LandingPageForm({ source }: { source: string }): ReactElement {
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const formLoadedAt = useRef<number>(Date.now());

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
          source,
          formLoadedAt: formLoadedAt.current,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");

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
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
        >
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </motion.div>
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
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6"
        >
          <p className="text-sm text-red-600 text-center">
            Something went wrong. Please try again or call us directly.
          </p>
        </motion.div>
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

/**
 * Trust bar with certifications
 */
function TrustBar(): ReactElement {
  return (
    <section className="bg-[var(--charcoal)] border-t border-white/10 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="flex flex-wrap items-center justify-center gap-8 lg:gap-16"
        >
          {TRUST_BADGES.map((badge, index) => (
            <motion.div
              key={badge.text}
              variants={fadeIn}
              custom={index}
              className="flex items-center gap-3 text-white/60"
            >
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                {badge.icon === "shield" && (
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
                {badge.icon === "clock" && (
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                )}
                {badge.icon === "star" && (
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                )}
                {badge.icon === "check" && (
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-medium">{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Animated stats counter component
 */
function AnimatedCounter({ value, suffix }: { value: number; suffix: string }): ReactElement {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const duration = 2000;
    const steps = 60;
    const increment = value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setCount(value);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

/**
 * Stats section with animated counters
 */
function StatsSection(): ReactElement {
  return (
    <section className="bg-gradient-to-b from-[var(--charcoal)] to-[#1a1a2e] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-12"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-4"
          >
            By The Numbers
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl lg:text-4xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Trusted by Businesses Across America
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              custom={index}
              className="text-center"
            >
              <div className="inline-flex items-baseline">
                <span className="text-5xl lg:text-6xl font-bold text-white">
                  <AnimatedCounter value={stat.value} suffix={stat.suffix} />
                </span>
              </div>
              <p className="mt-2 text-white/60 font-medium">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Premium testimonials section
 */
function TestimonialsSection(): ReactElement {
  return (
    <section className="bg-[var(--cream)] py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-16"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4"
          >
            Client Success Stories
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-3xl lg:text-4xl font-bold text-[var(--foreground)]"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            What Our Clients Say
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              custom={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--border)] relative overflow-hidden"
            >
              {/* Background accent */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, i) => (
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

              {/* Quote */}
              <blockquote className="text-lg text-[var(--text-body)] leading-relaxed mb-8 relative">
                <span className="absolute -top-4 -left-2 text-6xl text-[var(--accent)]/10 font-serif">&ldquo;</span>
                {testimonial.quote}
              </blockquote>

              {/* Author */}
              <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden relative">
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-[var(--foreground)]">
                    {testimonial.name}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Lead magnet section - secondary CTA for visitors not ready to convert
 */
function LeadMagnetSection({ source }: { source: string }): ReactElement {
  return (
    <section className="bg-[var(--charcoal)] py-16 border-t border-white/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="text-center mb-10"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-white/50 uppercase tracking-wider mb-3"
          >
            Not Ready to Talk Yet?
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="text-2xl lg:text-3xl font-bold text-white"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Get Our Free Inspection Resources
          </motion.h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto"
        >
          <motion.div variants={fadeInUp}>
            <LeadMagnetCard variant="quiz" source={source} />
          </motion.div>
          <motion.div variants={fadeInUp}>
            <LeadMagnetCard variant="maintenance-guide" source={source} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/**
 * Final CTA section
 */
function FinalCTASection({ source }: { source: string }): ReactElement {
  const scrollToForm = (): void => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <section className="relative bg-[var(--charcoal)] py-24 overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-4 sm:px-6 text-center">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 bg-[var(--accent)]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
          >
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            <span className="text-sm text-white/90 font-medium">Free Estimates Available Now</span>
          </motion.div>

          <motion.h2
            variants={fadeInUp}
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Ready to Protect Your Investment?
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Get your free, no-obligation estimate today. Our team will respond within 24 hours with a detailed quote.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <a
              href={`tel:${COMPANY.phone}`}
              className="inline-flex items-center justify-center gap-3 bg-white text-[var(--charcoal)] font-semibold px-8 py-4 rounded-xl hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
              onClick={() => trackEvent("phone_click", "Landing Page CTA", source)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {COMPANY.phone}
            </a>

            <button
              onClick={scrollToForm}
              className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold px-8 py-4 rounded-xl hover:bg-[var(--accent-dark)] transition-all hover:scale-105 shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
              Get Free Estimate
            </button>
          </motion.div>
        </motion.div>
      </div>

      {/* Minimal footer */}
      <div className="relative mt-20 pt-8 border-t border-white/10 text-center text-sm text-white/40">
        <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-6">
          <Link href="/privacy" className="hover:text-white/70 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-white/70 transition-colors">
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
 * Loading skeleton
 */
function LandingPageSkeleton(): ReactElement {
  return (
    <div className="min-h-screen bg-[var(--charcoal)]">
      <div className="animate-pulse pt-24 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="h-16 bg-white/10 rounded-lg w-3/4" />
            <div className="h-6 bg-white/10 rounded w-1/2" />
            <div className="h-24 bg-white/10 rounded w-full" />
          </div>
          <div className="h-[500px] bg-white/20 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
