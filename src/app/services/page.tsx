/**
 * @fileoverview Services overview page with editorial design
 * @module app/services/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button, Section } from "@/components/ui";
import { SERVICES, COMPANY } from "@/lib/utils/constants";
import { generatePageMetadata } from "@/lib/seo";

// Service images mapping
const SERVICE_IMAGES: Record<string, string> = {
  "tpo-roofing": "/images/tpo-roofing-installation.png",
  "mod-bit": "/images/mod-bit-torch-applied.png",
  "flat-roof-repair": "/images/flat-roof-repair.png",
  "commercial-industrial": "/images/commercial-warehouse-roofing.png",
};

export const metadata: Metadata = generatePageMetadata({
  title: "Commercial Roofing Services",
  description: `Professional commercial roofing services in Chicago and the Midwest. TPO, modified bitumen, flat roof repair, and industrial roofing by ${COMPANY.name}.`,
  path: "/services",
});

/**
 * Services overview page component with editorial vertical list.
 */
export default function ServicesPage(): ReactElement {
  return (
    <>
      {/* Hero */}
      <Section variant="charcoal" padding="xl">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <h1 className="heading-hero">Our Services</h1>
            <p className="mt-8 text-xl text-white/70 leading-relaxed">
              Comprehensive roofing solutions for businesses of all sizes. From
              new installations to repairs and maintenance—backed by GAF
              Certification and {COMPANY.experience}+ years of experience.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster="/images/roofing-inspection.png"
              >
                <source src="/videos/commercial-building.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </Section>

      {/* Services List */}
      <Section variant="cream" padding="xl">
        <div className="space-y-0">
          {SERVICES.map((service, index) => (
            <Link
              key={service.id}
              href={service.href}
              className="group block py-12 border-b border-[var(--border)] last:border-b-0 first:pt-0"
            >
              <div className="grid gap-8 lg:grid-cols-12 items-center">
                {/* Image - alternating sides */}
                <div className={`lg:col-span-5 ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden shadow-lg group-hover:shadow-xl transition-shadow">
                    <Image
                      src={SERVICE_IMAGES[service.id] || "/images/roofing-inspection.png"}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>

                {/* Content */}
                <div className={`lg:col-span-7 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <p className="text-sm font-medium text-[var(--text-muted)] mb-2">
                    0{index + 1}
                  </p>
                  <h2 className="text-3xl lg:text-4xl font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                    {service.name}
                  </h2>
                  <p className="mt-4 text-lg text-[var(--text-body)] leading-relaxed">
                    {service.description}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 text-[var(--accent)] font-medium">
                    <span>Learn more</span>
                    <svg
                      className="w-5 h-5 group-hover:translate-x-1 transition-transform"
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
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Section>

      {/* Simple CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Have questions?</h2>
          <p className="mt-4 text-lg text-white/70">
            We&apos;re happy to discuss your project and provide a free
            estimate.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="Services CTA">
                Request Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
