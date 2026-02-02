/**
 * @fileoverview Commercial & Industrial service page
 * @module app/services/commercial-industrial/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button, Section } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";
import {
  generateServiceMetadata,
  generateServiceSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

const SERVICE_NAME = "Commercial & Industrial Roofing";
const SERVICE_DESCRIPTION =
  "Full-service roofing solutions for commercial and industrial facilities. Warehouses, factories, office buildings, retail, and more.";

export const metadata: Metadata = generateServiceMetadata(
  SERVICE_NAME,
  SERVICE_DESCRIPTION,
  "/services/commercial-industrial"
);

/**
 * Commercial & Industrial Roofing service page - editorial design.
 */
export default function CommercialIndustrialPage(): ReactElement {
  const serviceSchema = generateServiceSchema({
    name: SERVICE_NAME,
    description: SERVICE_DESCRIPTION,
    url: "https://rollcogroofing.com/services/commercial-industrial",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://rollcogroofing.com" },
    { name: "Services", url: "https://rollcogroofing.com/services" },
    {
      name: SERVICE_NAME,
      url: "https://rollcogroofing.com/services/commercial-industrial",
    },
  ]);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero - Asymmetric */}
      <Section variant="charcoal" padding="xl">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <nav className="mb-6" aria-label="Breadcrumb">
              <ol className="flex items-center gap-2 text-sm text-gray-400">
                <li>
                  <Link href="/" className="hover:text-white">
                    Home
                  </Link>
                </li>
                <li>/</li>
                <li>
                  <Link href="/services" className="hover:text-white">
                    Services
                  </Link>
                </li>
                <li>/</li>
                <li className="text-white">Commercial</li>
              </ol>
            </nav>
            <h1 className="heading-hero">{SERVICE_NAME}</h1>
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              From small retail spaces to large industrial complexes.
              Comprehensive roofing for businesses of all sizes, backed by{" "}
              {COMPANY.experience}+ years of experience.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <Image
                src="/images/commercial-warehouse-roofing.webp"
                alt="Large industrial warehouse with newly installed commercial flat roof"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </Section>

      {/* Content - Editorial prose */}
      <Section variant="cream" padding="xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Our Experience
          </p>
          <div className="space-y-6 text-lg text-[var(--text-body)] leading-relaxed">
            <p>
              Our experience spans every type of commercial and industrial
              facility. Warehouses and distribution centers requiring large-scale
              flat roof systems. Manufacturing plants with specialized
              ventilation needs. Office buildings requiring minimal disruption.
              Retail centers balancing function with aesthetics.
            </p>
            <p>
              We understand that your building is more than just a
              structure—it&apos;s where you run your business. That&apos;s why
              we work around your hours to minimize disruption, deliver detailed
              quotes within 24 hours so you can plan accordingly, and prioritize
              emergency repairs to protect your assets.
            </p>
            <p>
              Based in Willowbrook, IL, we serve clients throughout the Midwest
              and Southeast—Illinois, Indiana, Ohio, West Virginia, Kentucky,
              Tennessee, North Carolina, South Carolina, and Georgia. For
              multi-location businesses, we provide consistent quality across
              all your facilities.
            </p>
          </div>

          {/* Buildings we serve - Simple text list */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-6">
              Buildings We Serve
            </h2>
            <div className="grid gap-x-8 gap-y-2 md:grid-cols-2 text-[var(--text-body)]">
              <p>Warehouses & Distribution Centers</p>
              <p>Manufacturing & Industrial Plants</p>
              <p>Office Buildings</p>
              <p>Retail Centers & Strip Malls</p>
              <p>Healthcare Facilities</p>
              <p>Schools & Universities</p>
              <p>Restaurants & Food Service</p>
              <p>Multi-Family Housing</p>
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Let&apos;s discuss your project</h2>
          <p className="mt-4 text-lg text-gray-300">
            Whether you need a new roof, repairs, or just want an expert
            assessment, we&apos;re here to help.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="Commercial-Industrial CTA">
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
