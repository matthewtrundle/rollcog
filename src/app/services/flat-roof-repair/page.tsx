/**
 * @fileoverview Flat Roof Repair service page
 * @module app/services/flat-roof-repair/page
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

const SERVICE_NAME = "Flat Roof Repair & Replacement";
const SERVICE_DESCRIPTION =
  "Expert repair and replacement services for commercial flat roofs. Emergency repairs within 5 days. Free inspections available.";

export const metadata: Metadata = generateServiceMetadata(
  SERVICE_NAME,
  SERVICE_DESCRIPTION,
  "/services/flat-roof-repair"
);

/**
 * Flat Roof Repair & Replacement service page - editorial design.
 */
export default function FlatRoofRepairPage(): ReactElement {
  const serviceSchema = generateServiceSchema({
    name: SERVICE_NAME,
    description: SERVICE_DESCRIPTION,
    url: "https://rollcog.com/services/flat-roof-repair",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: "https://rollcog.com" },
    { name: "Services", url: "https://rollcog.com/services" },
    {
      name: SERVICE_NAME,
      url: "https://rollcog.com/services/flat-roof-repair",
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
                <li className="text-white">Repair</li>
              </ol>
            </nav>
            <h1 className="heading-hero">{SERVICE_NAME}</h1>
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              From minor repairs to complete replacements. Emergency repairs
              within 5 days to protect your building and inventory.
            </p>
          </div>

          <div className="lg:col-span-7">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <Image
                src="/images/flat-roof-repair.png"
                alt="Commercial roofing workers inspecting and repairing flat roof"
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
            Our Approach
          </p>
          <div className="space-y-6 text-lg text-[var(--text-body)] leading-relaxed">
            <p>
              Catching roof problems early can save thousands in repair costs.
              Whether you&apos;re dealing with ponding water, visible cracks,
              flashing separation, or interior leaks, our GAF Certified team
              handles all flat roof issues with expertise and efficiency.
            </p>
            <p>
              We&apos;ll give you an honest assessment of whether repair or
              replacement makes more sense for your situation. If your roof is
              less than 15 years old with localized damage, repair is often the
              right choice. For roofs over 20 years old with widespread
              deterioration, replacement typically provides better long-term
              value.
            </p>
            <p>
              Active leaks threaten your building, inventory, and operations. We
              prioritize emergency calls and complete repairs within 5 days of
              your initial contact—because we understand that every day of delay
              costs you money.
            </p>
          </div>

          {/* Warning signs - Simple text list */}
          <div className="mt-12 pt-8 border-t border-[var(--border)]">
            <h2 className="text-xl font-medium text-[var(--foreground)] mb-6">
              Signs Your Roof Needs Attention
            </h2>
            <ul className="space-y-3 text-[var(--text-body)]">
              <li>
                Ponding water—water remaining 48+ hours after rain causes damage
              </li>
              <li>
                Interior leaks—water stains indicate membrane failure
              </li>
              <li>
                Bubbles or blisters—trapped moisture that can rupture
              </li>
              <li>
                Visible cracks—allows water infiltration
              </li>
              <li>
                Flashing separation—gaps at walls, vents, or equipment
              </li>
              <li>
                Higher energy bills—sign of compromised insulation
              </li>
            </ul>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Don&apos;t wait until it gets worse</h2>
          <p className="mt-4 text-lg text-gray-300">
            Small roof problems become expensive disasters. Get a free
            inspection and know exactly what your roof needs.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="Flat Roof Repair CTA">
                Schedule Free Inspection
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
