/**
 * @fileoverview Homepage with editorial gallery design + polish animations
 * @module app/page
 */

"use client";

import { type ReactElement, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Button, Section } from "@/components/ui";
import { LoadingScreen } from "@/components/common/loading-screen";
import { trackCustomEventToPostgres } from "@/lib/utils/analytics";
import { COMPANY, SERVICES } from "@/lib/utils/constants";

// Service images mapping
const SERVICE_IMAGES: Record<string, string> = {
  "tpo-roofing": "/images/tpo-roofing-installation.png",
  "mod-bit": "/images/mod-bit-torch-applied.png",
  "flat-roof-repair": "/images/flat-roof-repair.png",
  "commercial-industrial": "/images/commercial-warehouse-roofing.png",
};

// Enhanced service details with rich descriptions and features
const SERVICE_DETAILS: Record<string, { description: string; features: string[] }> = {
  "tpo-roofing": {
    description: "The industry's leading single-ply membrane for commercial flat roofs. TPO delivers exceptional energy savings with its reflective white surface, reducing cooling costs by up to 30%. Heat-welded seams create watertight bonds that outlast traditional roofing adhesives.",
    features: ["Energy Star rated", "20-30 year lifespan", "Low maintenance"]
  },
  "mod-bit": {
    description: "Multi-layer modified bitumen systems provide superior waterproofing through redundant protection. Ideal for buildings with heavy foot traffic or rooftop equipment. Torch-applied or cold-applied options available for any installation environment.",
    features: ["Multi-layer protection", "High puncture resistance", "Proven 40+ year track record"]
  },
  "flat-roof-repair": {
    description: "From minor leaks to complete tear-offs, we diagnose and resolve flat roof issues quickly. Emergency repairs within 5 days protect your building, inventory, and operations. Free inspections help identify problems before they become expensive disasters.",
    features: ["Emergency response within 5 days", "Free inspections", "All flat roof types serviced"]
  },
  "commercial-industrial": {
    description: "Full-service roofing for warehouses, factories, retail centers, office buildings, and industrial complexes. We work around your business hours to minimize disruption and deliver quotes within 24 hours so you can plan accordingly.",
    features: ["Minimal business disruption", "Multi-state coverage", "All building types"]
  }
};

// Descriptive alt text for service images (accessibility)
const SERVICE_ALT_TEXT: Record<string, string> = {
  "tpo-roofing": "Commercial building with white TPO roofing membrane installation in progress",
  "mod-bit": "Roofing crew applying modified bitumen with torch-down method",
  "flat-roof-repair": "Close-up of flat roof repair work showing damaged section being replaced",
  "commercial-industrial": "Large commercial warehouse with completed industrial roofing system",
};

// Animation variants
const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const slideInLeft: Variants = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0 },
};

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

/**
 * Homepage component with editorial gallery design and polish animations.
 */
export default function HomePage(): ReactElement {
  return (
    <>
      <LoadingScreen minDisplayTime={1200} />

      {/* Hero - Full-bleed with parallax */}
      <HeroSection />

      {/* Statement + Work - Asymmetric layout */}
      <StatementSection />

      {/* Services - With hover image previews */}
      <ServicesSection />

      {/* Single Featured Testimonial */}
      <TestimonialSection />
    </>
  );
}

function HeroSection(): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Parallax effect for video
  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative bg-[var(--charcoal)] text-white overflow-hidden"
    >
      {/* Blue letterbox area - creates the IMAX feel */}
      <div className="relative py-10 lg:py-16">
        {/* Content container with 2-column layout */}
        <motion.div
          className="relative mx-auto max-w-7xl px-6 lg:px-8"
          style={{ opacity: contentOpacity }}
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Text content - left side */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="relative z-10"
            >
              <motion.h1
                variants={fadeInUp}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-semibold text-white leading-[1.1] tracking-tight"
                style={{ fontFamily: 'var(--font-heading), Georgia, serif' }}
              >
                Your Trusted Commercial Roofing Contractors
              </motion.h1>

              <motion.div variants={fadeInUp} className="w-24 h-1 bg-[var(--accent)] mt-6" />

              <motion.p
                variants={fadeInUp}
                className="mt-6 text-base lg:text-lg text-white/80 leading-relaxed max-w-lg"
              >
                Premium flat roof solutions for commercial and industrial buildings.
                Trusted by property managers and developers across the Midwest.
              </motion.p>

              <motion.div variants={fadeInUp} className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link href="/contact">
                  <Button variant="primary" size="lg" showArrow trackingLabel="Hero">
                    Get Free Estimate
                  </Button>
                </Link>
                <Link href="/services">
                  <Button variant="outline-light" size="lg" trackingLabel="Hero">
                    Our Services
                  </Button>
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                variants={fadeInUp}
                className="mt-10 pt-6 border-t border-white/20 flex flex-wrap gap-6 text-sm text-white/60"
              >
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>24-Hour Estimates</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Emergency Repairs</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>9+ States Served</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Video container - right side */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              className="relative"
            >
              {/* Credentials badge above video */}
              <motion.p
                variants={fadeInUp}
                className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4 lg:text-right"
              >
                GAF Certified · {COMPANY.experience}+ Years Experience
              </motion.p>

              {/* 16:9 aspect ratio for more height */}
              <motion.div
                className="relative aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10"
                style={{ scale: videoScale }}
              >
                <video
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  className="absolute inset-0 w-full h-full object-cover scale-110 origin-top-left"
                  poster="/images/hero-roofing-team.png"
                >
                  <source src="/videos/aerial-drone.mp4" type="video/mp4" />
                </video>
                {/* Subtle vignette overlay - also helps hide any remaining watermark */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </motion.div>
              {/* Cinematic label */}
              <div className="absolute -bottom-3 right-4 text-[10px] uppercase tracking-widest text-white/30 font-medium">
                Aerial View
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
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

function StatementSection(): ReactElement {
  return (
    <Section variant="cream" padding="xl">
      <div className="grid gap-16 lg:grid-cols-12 items-center">
        {/* Text - Narrower column with slide-in */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideInLeft}
          className="lg:col-span-5"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4"
          >
            Who We Serve
          </motion.p>
          <motion.h2
            variants={fadeInUp}
            className="heading-section text-[var(--foreground)]"
          >
            Building owners and property managers who value quality over
            shortcuts
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-lg text-[var(--text-body)] leading-relaxed"
          >
            For over {COMPANY.experience} years, we&apos;ve worked with general
            contractors, developers, and facility managers who need roofing
            partners they can trust. No surprises, no games—just honest work at
            fair prices.
          </motion.p>
          <motion.div variants={fadeInUp} className="mt-8">
            <Link href="/about">
              <Button variant="secondary" size="lg" showArrow trackingLabel="Statement">
                About Our Work
              </Button>
            </Link>
          </motion.div>
        </motion.div>

        {/* Video - Larger column with slide-in */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={slideInRight}
          className="lg:col-span-7"
        >
          <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden group">
            <video
              autoPlay
              muted
              loop
              playsInline
              className="absolute inset-0 w-full h-full object-cover scale-110 origin-top-left transition-transform duration-700 group-hover:scale-[1.15]"
              poster="/images/commercial-warehouse-roofing.png"
            >
              <source src="/videos/aerial-scene.mp4" type="video/mp4" />
            </video>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

function ServicesSection(): ReactElement {
  const [hoveredService, setHoveredService] = useState<string | null>(null);

  return (
    <Section variant="charcoal" padding="xl">
      <div className="grid lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Services list */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="lg:col-span-7"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4"
          >
            Services
          </motion.p>
          <motion.h2 variants={fadeInUp} className="heading-section mb-14">
            What We Do
          </motion.h2>

          {/* Clean vertical text list with generous spacing */}
          <div className="space-y-0">
            {SERVICES.map((service, index) => {
              const details = SERVICE_DETAILS[service.id];
              return (
                <motion.div
                  key={service.id}
                  variants={fadeInUp}
                  custom={index}
                  className={index > 0 ? "border-t border-white/10 mt-10 pt-10 lg:mt-12 lg:pt-12" : ""}
                >
                  <Link
                    href={service.href}
                    className="group block"
                    onMouseEnter={() => setHoveredService(service.id)}
                    onMouseLeave={() => setHoveredService(null)}
                    onClick={() => trackCustomEventToPostgres("engagement", "service_click", {
                      service_id: service.id,
                      service_name: service.name,
                    })}
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div className="space-y-5">
                        <h3 className="text-2xl lg:text-3xl font-medium text-white group-hover:text-[var(--accent)] transition-colors duration-300">
                          {service.name}
                        </h3>
                        <p className="text-white/70 leading-relaxed text-base lg:text-lg max-w-2xl">
                          {details?.description || service.description}
                        </p>
                        {/* Feature pills */}
                        {details?.features && (
                          <div className="pt-3 flex flex-wrap gap-3">
                            {details.features.map((feature) => (
                              <span
                                key={feature}
                                className="text-xs text-white/50 border border-white/15 px-4 py-2 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{
                          opacity: hoveredService === service.id ? 1 : 0,
                          x: hoveredService === service.id ? 0 : -10,
                        }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0 mt-2"
                      >
                        <svg
                          className="w-6 h-6 text-[var(--accent)]"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17 8l4 4m0 0l-4 4m4-4H3"
                          />
                        </svg>
                      </motion.div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <motion.div
            variants={fadeInUp}
            className="mt-14 pt-8 border-t border-white/15"
          >
            <p className="text-white/60 text-base">
              Need something specific?{" "}
              <Link
                href="/contact"
                className="text-[var(--accent)] hover:underline"
              >
                Get in touch
              </Link>
            </p>
          </motion.div>
        </motion.div>

        {/* Hover image preview */}
        <div className="hidden lg:block lg:col-span-5 relative">
          <div className="sticky top-32">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden bg-gray-800">
              {/* Default state - show roofing inspection */}
              <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: hoveredService ? 0 : 1 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0"
              >
                <Image
                  src="/images/roofing-inspection.png"
                  alt="Professional roof inspection"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-sm text-white/70">
                    Hover over a service to see more
                  </p>
                </div>
              </motion.div>

              {/* Service-specific images */}
              {SERVICES.map((service) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{
                    opacity: hoveredService === service.id ? 1 : 0,
                    scale: hoveredService === service.id ? 1 : 1.1,
                  }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={SERVICE_IMAGES[service.id] || "/images/roofing-inspection.png"}
                    alt={SERVICE_ALT_TEXT[service.id] || `${service.name} - professional roofing service`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <p className="text-lg font-medium text-white">
                      {service.name}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

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
  {
    quote: "From consultation to completion, the experience was seamless. I'd recommend Rollcog Roofs to anyone in need of top-tier roofing services.",
    name: "Alicia D.",
    location: "Georgia",
  },
];

function TestimonialSection(): ReactElement {
  return (
    <Section variant="cream" padding="xl">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        {/* Section header */}
        <motion.div variants={fadeInUp} className="text-center mb-16">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Testimonials
          </p>
          <h2 className="heading-section text-[var(--foreground)]">
            Hear From Our Corporate Clients
          </h2>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid gap-8 md:grid-cols-3">
          {TESTIMONIALS.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              variants={fadeInUp}
              custom={index}
              className="bg-white rounded-2xl p-8 shadow-lg border border-[var(--border)]"
            >
              {/* 5 stars */}
              <div className="flex gap-1 mb-6">
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

              {/* Quote */}
              <blockquote className="text-[var(--text-body)] leading-relaxed mb-6">
                &ldquo;{testimonial.quote}&rdquo;
              </blockquote>

              {/* Author */}
              <div className="pt-6 border-t border-[var(--border)]">
                <p className="font-medium text-[var(--foreground)]">
                  {testimonial.name}
                </p>
                <p className="text-sm text-[var(--text-muted)]">
                  {testimonial.location}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div variants={fadeInUp} className="mt-16 text-center">
          <Link href="/contact">
            <Button variant="primary" size="xl" showArrow trackingLabel="Testimonials">
              Start Your Project
            </Button>
          </Link>
        </motion.div>
      </motion.div>
    </Section>
  );
}
