/**
 * @fileoverview About page with editorial design
 * @module app/about/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button, Section } from "@/components/ui";
import { COMPANY, CERTIFICATIONS } from "@/lib/utils/constants";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "About Us",
  description: `${COMPANY.name} - ${COMPANY.experience}+ years of commercial roofing excellence. GAF Certified contractors serving Chicago and the Midwest with quality workmanship.`,
  path: "/about",
});

/**
 * About page component with editorial design.
 */
export default function AboutPage(): ReactElement {
  return (
    <>
      {/* Hero - Asymmetric layout */}
      <Section variant="charcoal" padding="xl">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-5">
            <h1 className="heading-hero">
              {COMPANY.experience} Years of
              <br />
              <span className="text-[var(--accent)]">Getting It Right</span>
            </h1>
            <p className="mt-8 text-xl text-gray-300 leading-relaxed">
              Since {COMPANY.founded}, we&apos;ve built our reputation on a
              simple principle: do quality work at fair prices, and treat every
              building like it&apos;s our own.
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
                poster="/images/hero-roofing-team.png"
              >
                <source src="/videos/commercial-building.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      </Section>

      {/* Our Story */}
      <Section variant="cream" padding="xl">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Our Story
          </p>
          <div className="space-y-6 text-lg text-[var(--text-body)] leading-relaxed">
            <p>
              Rollcog was founded in {COMPANY.founded} with a simple mission: to
              provide commercial building owners with reliable, high-quality
              roofing solutions they can trust.
            </p>
            <p>
              What started as a small team has grown into one of the
              Midwest&apos;s most respected commercial roofing contractors.
              Over the years, we&apos;ve had the privilege of working on
              hundreds of commercial and industrial projects, from small retail
              buildings to large warehouse complexes.
            </p>
            <p>
              Our dedication to quality workmanship and customer service has
              earned us certifications from GAF, one of North America&apos;s
              largest roofing manufacturers. Today, we continue to uphold the
              values that built our reputation: honest communication, fair
              pricing, and exceptional craftsmanship.
            </p>
          </div>
        </div>
      </Section>

      {/* Values - With video background */}
      <Section variant="charcoal" padding="lg">
        <div className="grid gap-12 lg:grid-cols-12 items-center">
          {/* Video Side */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <div className="relative aspect-[4/3] rounded-[var(--radius-large)] overflow-hidden">
              <video
                autoPlay
                muted
                loop
                playsInline
                className="absolute inset-0 w-full h-full object-cover"
                poster="/images/hero-roofing-team.png"
              >
                <source src="/videos/aerial-drone.mp4" type="video/mp4" />
              </video>
            </div>
          </div>

          {/* Values Content Side */}
          <div className="lg:col-span-7 order-1 lg:order-2">
            <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              What We Believe
            </p>
            <h2 className="heading-section mb-10">Our Values</h2>

            <div className="space-y-8">
              {[
                {
                  title: "Quality Craftsmanship",
                  description:
                    "We never cut corners. Every project receives the same attention to detail, ensuring long-lasting results.",
                },
                {
                  title: "Honest Communication",
                  description:
                    "We believe in transparency. You'll always know exactly what's happening with your project.",
                },
                {
                  title: "Customer First",
                  description:
                    "Your satisfaction is our priority. We work around your schedule and minimize disruption to your business.",
                },
              ].map((value) => (
                <div key={value.title} className="flex gap-4">
                  <div className="w-1 h-full bg-[var(--accent)] rounded-full flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {value.title}
                    </h3>
                    <p className="text-gray-400 leading-relaxed text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Certifications - Simple text list */}
      <Section variant="cream" padding="lg">
        <div className="max-w-4xl">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
                Credentials
              </p>
              <h2 className="heading-section text-[var(--foreground)]">
                Certifications
              </h2>
            </div>
            <div className="space-y-4">
              {CERTIFICATIONS.map((cert) => (
                <div
                  key={cert.name}
                  className="py-4 border-b border-[var(--border)] last:border-b-0"
                >
                  <p className="font-medium text-[var(--foreground)]">
                    {cert.name}
                  </p>
                  <p className="mt-1 text-sm text-[var(--text-muted)]">
                    {cert.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Ready to work together?</h2>
          <p className="mt-4 text-lg text-gray-300">
            Contact our team to discuss your commercial roofing needs.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow>
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
