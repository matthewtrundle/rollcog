/**
 * @fileoverview TPO Commercial Roofing service page
 * @module app/services/tpo-roofing/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Button, Section } from "@/components/ui";
import {
  generateServiceMetadata,
  generateServiceSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";

const SERVICE_NAME = "TPO Commercial Roofing";
const SERVICE_DESCRIPTION =
  "Energy-efficient TPO single-ply roofing systems for commercial buildings. Durable, reflective, and cost-effective flat roof solutions.";

export const metadata: Metadata = generateServiceMetadata(
  SERVICE_NAME,
  SERVICE_DESCRIPTION,
  "/services/tpo-roofing"
);

/**
 * TPO Commercial Roofing service page - editorial design.
 */
export default function TPORoofingPage(): ReactElement {
  const serviceSchema = generateServiceSchema({
    name: SERVICE_NAME,
    description: SERVICE_DESCRIPTION,
    url: "https://rollcogroofing.com/services/tpo-roofing",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://rollcogroofing.com" },
    { name: "Services", url: "https://rollcogroofing.com/services" },
    { name: SERVICE_NAME, url: "https://rollcogroofing.com/services/tpo-roofing" },
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
                <li className="text-white">TPO</li>
              </ol>
            </nav>
            <h1 className="heading-hero">{SERVICE_NAME}</h1>
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              The leading choice for commercial flat roofs. Energy-efficient,
              durable, and backed by GAF Certified installation.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <Image
                src="/images/tpo-roofing-installation.png"
                alt="Professional roofer heat-welding TPO roofing membrane"
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
            About TPO
          </p>
          <div className="space-y-6 text-lg text-[var(--text-body)] leading-relaxed">
            <p>
              TPO (Thermoplastic Polyolefin) has become the fastest-growing
              commercial roofing material for good reason. Its white reflective
              surface reduces cooling costs by up to 30%, meeting ENERGY STAR
              requirements while protecting your building for decades.
            </p>
            <p>
              Our GAF Certified installers deliver TPO systems that are
              resistant to UV rays, ozone, chemicals, and punctures. Heat-welded
              seams create watertight bonds that require minimal maintenance
              compared to other roofing types.
            </p>
            <p>
              TPO can be fully adhered, mechanically attached, or ballasted—we
              select the optimal method based on your building&apos;s specific
              requirements. With proper installation and maintenance, you can
              expect 20-30 years of reliable performance.
            </p>
          </div>

          {/* Key benefits - Simple text list */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-6">
              Why Choose TPO
            </h2>
            <ul className="space-y-3 text-[var(--text-body)]">
              <li>Energy efficient—reduces cooling costs up to 30%</li>
              <li>Durable—resistant to UV, ozone, and punctures</li>
              <li>Low maintenance—heat-welded seams stay watertight</li>
              <li>Cost-effective—lower material and installation costs</li>
              <li>Environmentally friendly—100% recyclable</li>
              <li>Long lifespan—20-30 years with proper maintenance</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Ready for your TPO roof?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Get a free assessment from our GAF Certified team. We&apos;ll
            provide a detailed quote within 24 hours.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="TPO Service CTA">
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
