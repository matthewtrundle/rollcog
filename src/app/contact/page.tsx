/**
 * @fileoverview Contact page with premium editorial design
 * @module app/contact/page
 */

"use client";

import { type ReactElement } from "react";
import { motion } from "framer-motion";
import { Section, Card } from "@/components/ui";
import { ContactForm } from "@/features/contact";
import { COMPANY } from "@/lib/utils/constants";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

/**
 * Contact page component with premium editorial design.
 */
export default function ContactPage(): ReactElement {
  return (
    <>
      {/* Hero with gradient background */}
      <Section variant="charcoal" padding="xl">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p
            variants={fadeInUp}
            className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4"
          >
            Let&apos;s Work Together
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            className="heading-hero"
          >
            Get Your Free Estimate
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="mt-6 text-xl text-white/70 max-w-2xl mx-auto"
          >
            Tell us about your project and we&apos;ll get back to you within 24 hours
            with a detailed quote.
          </motion.p>

          {/* Trust indicators */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-wrap items-center justify-center gap-8 text-sm text-white/60"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Free Estimates</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>24-Hour Response</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[var(--accent)]" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>GAF Certified</span>
            </div>
          </motion.div>
        </motion.div>
      </Section>

      {/* Contact Content */}
      <Section variant="cream" padding="xl">
        <div className="grid gap-12 lg:gap-16 lg:grid-cols-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7"
          >
            <Card padding="xl" variant="white" className="shadow-xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-[var(--foreground)]">
                    Request a Quote
                  </h2>
                  <p className="text-sm text-[var(--text-muted)]">
                    Fill out the form below and we&apos;ll be in touch
                  </p>
                </div>
              </div>
              <ContactForm />
            </Card>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <div className="sticky top-28 space-y-8">
              {/* Office Card */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="p-6 rounded-2xl bg-white shadow-lg border border-[var(--border)]"
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-6 h-6 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-1">
                      Office
                    </p>
                    <address className="not-italic text-[var(--foreground)] font-medium leading-relaxed">
                      {COMPANY.address.street}
                      <br />
                      {COMPANY.address.city}, {COMPANY.address.state}{" "}
                      {COMPANY.address.zip}
                    </address>
                  </div>
                </div>
              </motion.div>

              {/* Service Area */}
              <div className="p-6 rounded-2xl bg-[var(--charcoal)] text-white">
                <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-2">
                  Service Area
                </p>
                <p className="text-white/90 leading-relaxed">
                  Chicago, the Midwest, and 9+ states including Indiana, Ohio,
                  Kentucky, Tennessee, North Carolina, South Carolina, and Georgia.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </Section>
    </>
  );
}
