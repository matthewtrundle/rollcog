/**
 * @fileoverview Modified Bitumen service page
 * @module app/services/mod-bit/page
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

const SERVICE_NAME = "Modified Bitumen Roofing";
const SERVICE_DESCRIPTION =
  "Durable modified bitumen roofing systems for commercial and industrial buildings. Multi-layer protection with proven performance.";

export const metadata: Metadata = generateServiceMetadata(
  SERVICE_NAME,
  SERVICE_DESCRIPTION,
  "/services/mod-bit"
);

/**
 * Modified Bitumen Roofing service page - editorial design.
 */
export default function ModBitPage(): ReactElement {
  const serviceSchema = generateServiceSchema({
    name: SERVICE_NAME,
    description: SERVICE_DESCRIPTION,
    url: "https://rollcogroofing.com/services/mod-bit",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://rollcogroofing.com" },
    { name: "Services", url: "https://rollcogroofing.com/services" },
    { name: SERVICE_NAME, url: "https://rollcogroofing.com/services/mod-bit" },
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
                <li className="text-white">Mod-Bit</li>
              </ol>
            </nav>
            <h1 className="heading-hero">{SERVICE_NAME}</h1>
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              Multi-layer protection with proven performance. Ideal for
              buildings that need to withstand heavy foot traffic and extreme
              weather.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <Image
                src="/images/mod-bit-torch-applied.webp"
                alt="Commercial roofer applying modified bitumen with propane torch"
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
            About Modified Bitumen
          </p>
          <div className="space-y-6 text-lg text-[var(--text-body)] leading-relaxed">
            <p>
              Modified bitumen combines the proven performance of built-up
              roofing with advanced polymer technology. It consists of multiple
              reinforced layers that create a robust waterproof membrane ideal
              for flat and low-slope commercial roofs.
            </p>
            <p>
              The two main types—APP (Atactic Polypropylene) and SBS
              (Styrene-Butadiene-Styrene)—offer different advantages. APP
              provides superior UV resistance and high-temperature performance,
              while SBS offers excellent flexibility in cold weather and
              superior elongation properties.
            </p>
            <p>
              We select the optimal installation method based on your
              building&apos;s requirements: torch-applied for maximum adhesion,
              cold-applied for occupied buildings where open flames are
              restricted, or self-adhered for fastest installation.
            </p>
          </div>

          {/* Key benefits - Simple text list */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-6">
              Why Choose Modified Bitumen
            </h2>
            <ul className="space-y-3 text-[var(--text-body)]">
              <li>
                Multi-layer protection—redundant waterproofing even if one layer
                is damaged
              </li>
              <li>
                Extreme weather resistance—handles Midwest temperature swings
              </li>
              <li>
                Heavy foot traffic tolerance—ideal for roofs with HVAC equipment
              </li>
              <li>Proven track record—based on 100+ years of BUR technology</li>
              <li>
                Easy repairs—damage can be patched without full replacement
              </li>
              <li>15-20 year lifespan with proper maintenance</li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Is mod-bit right for your building?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Get a free assessment from our GAF Certified team. We&apos;ll
            evaluate your roof and recommend the best solution.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="Mod-Bit Service CTA">
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
