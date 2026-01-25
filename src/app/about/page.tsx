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

// Certification badge colors
const CERT_COLORS: Record<string, string> = {
  "GAF Master Commercial": "bg-blue-900",
  "GAF Authorized": "bg-blue-800",
  "Goldman Sachs 10,000 Small Businesses": "bg-slate-800",
  "OSHA Training Institute": "bg-green-800",
};

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
            <p className="mt-8 text-xl text-white/70 leading-relaxed">
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
            <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
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
                    <p className="text-white/60 leading-relaxed text-sm">
                      {value.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* Certifications - With badge images */}
      <Section variant="cream" padding="xl">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
            Credentials
          </p>
          <h2 className="heading-section text-[var(--foreground)]">
            Our Certifications
          </h2>
        </div>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {CERTIFICATIONS.map((cert) => (
              <div
                key={cert.name}
                className="bg-white rounded-2xl p-6 shadow-lg border border-[var(--border)] text-center hover:shadow-xl transition-shadow"
              >
                {/* Badge placeholder */}
                <div className={`w-24 h-24 mx-auto rounded-full ${CERT_COLORS[cert.name] || 'bg-gray-800'} flex items-center justify-center mb-6 shadow-md`}>
                  {cert.name.includes("GAF") ? (
                    <div className="text-white text-center">
                      <p className="text-xs font-bold">GAF</p>
                      <p className="text-[10px]">CERTIFIED</p>
                    </div>
                  ) : cert.name.includes("Goldman") ? (
                    <div className="text-white text-center">
                      <p className="text-[10px] font-bold">GOLDMAN</p>
                      <p className="text-[10px]">SACHS</p>
                      <p className="text-[8px]">10K</p>
                    </div>
                  ) : cert.name.includes("OSHA") ? (
                    <div className="text-white text-center">
                      <p className="text-sm font-bold">OSHA</p>
                      <p className="text-[8px]">CERTIFIED</p>
                    </div>
                  ) : (
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                  )}
                </div>
                <h3 className="font-semibold text-[var(--foreground)] mb-2">
                  {cert.name}
                </h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">
                  {cert.description}
                </p>
              </div>
          ))}
        </div>
      </Section>

      {/* CTA */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-2xl">
          <h2 className="heading-section">Ready to work together?</h2>
          <p className="mt-4 text-lg text-white/70">
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
