/**
 * @fileoverview Ultra-optimized Google Ads Landing Page
 * @module app/estimate/page
 *
 * Performance-focused design:
 * - Server Component (no client-side JS hydration for main content)
 * - No Framer Motion (saves ~40KB)
 * - Static images only (no video)
 * - CSS animations only
 * - Minimal client-side code (form only)
 */

import { type ReactElement, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { COMPANY } from "@/lib/utils/constants";
import { EstimateForm } from "./estimate-form";

// Dynamic content based on source parameter
const SOURCE_CONFIG: Record<string, {
  headline: string;
  subheadline: string;
  image: string;
  accentFeature: string;
}> = {
  repair: {
    headline: "Emergency Commercial Roof Repair",
    subheadline: "Fast response in Chicago & Chicagoland. Expert repairs. Protect your business today.",
    image: "/images/flat-roof-repair.webp",
    accentFeature: "Emergency repairs within 5 days",
  },
  "flat-roof": {
    headline: "Chicago Flat Roof Specialists",
    subheadline: "TPO, Modified Bitumen & EPDM experts serving Chicagoland for 27+ years.",
    image: "/images/tpo-roofing-installation.webp",
    accentFeature: "20-30 year roof lifespan",
  },
  industrial: {
    headline: "Industrial Roofing Experts",
    subheadline: "Large-scale projects across Chicago & the Midwest. Minimal disruption. On-time delivery.",
    image: "/images/commercial-warehouse-roofing.webp",
    accentFeature: "Multi-state coverage",
  },
  general: {
    headline: "Commercial Roofing Chicago",
    subheadline: "GAF Certified contractors serving Chicagoland with 27+ years of excellence.",
    image: "/images/hero-roofing-team.webp",
    accentFeature: "24-hour estimate delivery",
  },
  tpo: {
    headline: "TPO Roofing Installation",
    subheadline: "Energy-efficient TPO roofing for Chicago commercial buildings. GAF Certified.",
    image: "/images/tpo-roofing-installation.webp",
    accentFeature: "Up to 30% cooling cost savings",
  },
  "mod-bit": {
    headline: "Modified Bitumen Roofing",
    subheadline: "Multi-layer protection for Chicago commercial properties. 40+ year proven track record.",
    image: "/images/mod-bit-torch-applied.webp",
    accentFeature: "Superior puncture resistance",
  },
};

// Stats data
const STATS = [
  { value: "27+", label: "Years Experience" },
  { value: "500+", label: "Projects Completed" },
  { value: "9+", label: "States Served" },
  { value: "24hr", label: "Estimate Delivery" },
];

// Testimonials
const TESTIMONIALS = [
  {
    quote: "Rollcog transformed our warehouse roof in record time. Professional from start to finish.",
    name: "Michael Chen",
    title: "Facility Director",
    company: "Midwest Logistics",
  },
  {
    quote: "Emergency repair when we needed it most. They saved us from a potential disaster.",
    name: "Sarah Thompson",
    title: "Property Manager",
    company: "Sterling Properties",
  },
];

interface PageProps {
  searchParams: Promise<{ source?: string }>;
}

/**
 * Ultra-optimized landing page - Server Component
 */
export default async function EstimateLandingPage({ searchParams }: PageProps): Promise<ReactElement> {
  const params = await searchParams;
  const source = params.source || "general";
  const config = SOURCE_CONFIG[source] || SOURCE_CONFIG.general;

  return (
    <div className="min-h-screen bg-[var(--charcoal)]">
      {/* Inline critical CSS for animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .animate-fade-in-up { animation: fadeInUp 0.4s ease-out forwards; }
        .animate-fade-in-up-delay { animation: fadeInUp 0.4s ease-out 0.1s forwards; opacity: 0; }
        .animate-pulse-slow { animation: pulse 2s ease-in-out infinite; }
      `}} />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <Image
              src="/logo.png"
              alt="Rollcog Roofs"
              width={44}
              height={44}
              className="rounded-lg shadow-lg"
              priority
            />
            <span className="text-gray-900 font-semibold text-lg hidden sm:block group-hover:text-[var(--accent)] transition-colors">
              Rollcog Roofs
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            <Link href="/services" className="text-gray-700 hover:text-[var(--accent)] font-medium transition-colors">Services</Link>
            <Link href="/about" className="text-gray-700 hover:text-[var(--accent)] font-medium transition-colors">About</Link>
            <Link href="/faq" className="text-gray-700 hover:text-[var(--accent)] font-medium transition-colors">FAQ</Link>
            <Link href="/contact" className="text-gray-700 hover:text-[var(--accent)] font-medium transition-colors">Contact</Link>
          </nav>

          {/* CTA Button - scrolls to form */}
          <a
            href="#estimate-form"
            className="flex items-center gap-2 bg-[var(--accent)] hover:bg-orange-600 px-5 py-2.5 rounded-full text-white transition-all shadow-lg font-semibold"
          >
            Get Free Estimate
          </a>
        </div>
      </header>

      {/* Hero Section - Solid blue like homepage */}
      <section className="relative bg-[var(--charcoal)] pt-24 pb-16 lg:pt-28 lg:pb-20 overflow-hidden">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left Column - Content */}
            <div className="animate-fade-in-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-[var(--accent)]/10 border border-[var(--accent)]/20 px-4 py-2 rounded-full mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse-slow" />
                <span className="text-sm text-white/90 font-medium">Free Estimates Available</span>
              </div>

              <h1
                className="text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-bold text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
              >
                {config.headline}
                <span className="text-[var(--accent)]">.</span>
              </h1>

              <p className="mt-5 text-lg text-white/70 leading-relaxed max-w-lg">
                {config.subheadline}
              </p>

              {/* Compact stats row */}
              <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">27+</span>
                  <span className="text-xs text-white/60">Years</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">500+</span>
                  <span className="text-xs text-white/60">Projects</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white">9+</span>
                  <span className="text-xs text-white/60">States</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-[var(--accent)]">24hr</span>
                  <span className="text-xs text-white/60">Response</span>
                </div>
              </div>

              {/* Hero Image - larger now with badges moved */}
              <div className="mt-6 relative rounded-2xl overflow-hidden shadow-2xl hidden lg:block">
                <div className="aspect-[4/3] relative">
                  <Image
                    src={config.image}
                    alt={config.headline}
                    fill
                    priority
                    className="object-cover"
                    sizes="50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)]/60 via-transparent to-transparent" />
                </div>
              </div>

              {/* Mobile CTA - scroll to form */}
              <div className="mt-8 lg:hidden">
                <a
                  href="#estimate-form"
                  className="flex items-center justify-center gap-3 bg-[var(--accent)] text-white font-semibold px-6 py-4 rounded-xl w-full hover:bg-orange-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Get Your Free Estimate
                </a>
              </div>
            </div>

            {/* Right Column - Trust Badges + Form Card */}
            <div id="estimate-form" className="animate-fade-in-up-delay scroll-mt-24">
              {/* Trust badges above form */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">GAF Certified</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">24-Hr Estimates</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span className="text-white text-sm font-medium">5-Star Rated</span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3 py-2.5 rounded-lg border border-white/20">
                  <svg className="w-5 h-5 text-[var(--accent)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-white text-sm font-medium">Licensed & Insured</span>
                </div>
              </div>

              {/* Form Card */}
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-[var(--accent)] to-orange-400 rounded-3xl blur-lg opacity-20" />
                <Suspense fallback={<FormSkeleton />}>
                  <EstimateForm source={source} />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-b from-[var(--charcoal)] to-[#1a1a2e] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-wider mb-4">
              By The Numbers
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold text-white"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              Trusted by Businesses Across America
            </h2>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <span className="text-5xl lg:text-6xl font-bold text-white">
                  {stat.value}
                </span>
                <p className="mt-2 text-white/60 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-[var(--cream)] py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Client Success Stories
            </p>
            <h2
              className="text-3xl lg:text-4xl font-bold text-[var(--foreground)]"
              style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
            >
              What Our Clients Say
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.name}
                className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--border)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />

                {/* Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <blockquote className="text-lg text-[var(--text-body)] leading-relaxed mb-8 relative">
                  <span className="absolute -top-4 -left-2 text-6xl text-[var(--accent)]/10 font-serif">&ldquo;</span>
                  {testimonial.quote}
                </blockquote>

                <div className="flex items-center gap-4 pt-6 border-t border-[var(--border)]">
                  <div className="w-12 h-12 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                    <span className="text-[var(--accent)] font-bold text-lg">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[var(--foreground)]">{testimonial.name}</p>
                    <p className="text-sm text-[var(--text-muted)]">
                      {testimonial.title}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative bg-[var(--charcoal)] py-24 overflow-hidden">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-[var(--accent)]/20 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <span className="w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse-slow" />
            <span className="text-sm text-white/90 font-medium">Free Estimates Available Now</span>
          </div>

          <h2
            className="text-4xl lg:text-5xl font-bold text-white mb-6"
            style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
          >
            Ready to Protect Your Investment?
          </h2>

          <p className="text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
            Get your free, no-obligation estimate today. Our team will respond within 24 hours with a detailed quote.
          </p>

          <a
            href="#estimate-form"
            className="inline-flex items-center justify-center gap-2 bg-[var(--accent)] text-white font-semibold px-10 py-4 rounded-xl hover:bg-[var(--accent-dark)] transition-all shadow-lg text-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
            Get Your Free Estimate
          </a>
        </div>

        {/* Footer */}
        <div className="relative mt-20 pt-8 border-t border-white/10 text-center text-sm text-white/40">
          <p>&copy; {new Date().getFullYear()} {COMPANY.name}. All rights reserved.</p>
          <div className="mt-3 flex justify-center gap-6">
            <Link href="/privacy" className="hover:text-white/70 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white/70 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FormSkeleton(): ReactElement {
  return (
    <div className="relative bg-white rounded-2xl p-6 sm:p-8 shadow-2xl animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-6" />
      <div className="space-y-4">
        <div className="h-12 bg-gray-200 rounded" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 bg-gray-200 rounded" />
          <div className="h-12 bg-gray-200 rounded" />
        </div>
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-12 bg-[var(--accent)]/30 rounded" />
      </div>
    </div>
  );
}
