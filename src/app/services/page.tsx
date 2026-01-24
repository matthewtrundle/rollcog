/**
 * @fileoverview Services overview page with editorial design
 * @module app/services/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button, Section } from "@/components/ui";
import { SERVICES, COMPANY } from "@/lib/utils/constants";
import { generatePageMetadata } from "@/lib/seo";

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
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
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
        <div className="max-w-4xl">
          <div className="space-y-0">
            {SERVICES.map((service, index) => (
              <Link
                key={service.id}
                href={service.href}
                className="group block py-12 border-b border-[var(--border)] last:border-b-0 first:pt-0"
              >
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[var(--text-muted)] mb-2">
                      0{index + 1}
                    </p>
                    <h2 className="text-3xl font-medium text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors">
                      {service.name}
                    </h2>
                    <p className="mt-4 text-lg text-[var(--text-body)] max-w-xl leading-relaxed">
                      {service.description}
                    </p>
                  </div>
                  <div className="flex-shrink-0 mt-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg
                      className="w-8 h-8 text-[var(--accent)]"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {/* Simple CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Have questions?</h2>
          <p className="mt-4 text-lg text-gray-300">
            We&apos;re happy to discuss your project and provide a free
            estimate.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow>
                Request Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
