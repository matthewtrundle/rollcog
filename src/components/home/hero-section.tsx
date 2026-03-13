"use client";

import { type ReactElement, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import { Button, LazyVideo } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";

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

const slideInRight: Variants = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0 },
};

export function HeroSection(): ReactElement {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const videoScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <section
      ref={ref}
      className="relative bg-[var(--charcoal)] text-white overflow-hidden"
    >
      <div className="relative py-10 lg:py-16">
        <motion.div
          className="relative mx-auto max-w-7xl px-6 lg:px-8"
          style={{ opacity: contentOpacity }}
        >
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
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
                Serving Chicago, Chicagoland, and the greater Midwest region.
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

            <motion.div
              initial="hidden"
              animate="visible"
              variants={slideInRight}
              className="relative"
            >
              <motion.p
                variants={fadeInUp}
                className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4 lg:text-right"
              >
                GAF Certified · {COMPANY.experience}+ Years Experience
              </motion.p>

              <motion.div
                className="relative aspect-video rounded-lg overflow-hidden shadow-2xl ring-1 ring-white/10"
                style={{ scale: videoScale }}
              >
                <Image
                  src="/images/hero-roofing-team.webp"
                  alt="Rollcog commercial roofing team"
                  fill
                  priority
                  className="absolute inset-0 w-full h-full object-cover lg:hidden"
                />
                <div className="hidden lg:block absolute inset-0">
                  <LazyVideo
                    src="/videos/aerial-drone.mp4"
                    poster="/images/hero-roofing-team.webp"
                    className="absolute inset-0 w-full h-full object-cover scale-110 origin-top-left"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />
              </motion.div>
              <div className="absolute -bottom-3 right-4 text-[10px] uppercase tracking-widest text-white/30 font-medium">
                Aerial View
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator - limited to 3 iterations (Phase 7) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: 3 }}
          className="w-6 h-10 rounded-full border-2 border-white/30 flex items-start justify-center p-2"
        >
          <motion.div className="w-1 h-2 bg-white/60 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  );
}
