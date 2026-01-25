/**
 * @fileoverview FAQ page with European premium design
 * @module app/faq/page
 */

import { type ReactElement } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { Button, Section, Accordion } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";
import { generatePageMetadata, generateFAQSchema } from "@/lib/seo";

const FAQ_ITEMS = [
  {
    question: "What types of commercial roofing do you install?",
    answer:
      "We specialize in TPO (Thermoplastic Polyolefin) single-ply roofing systems, modified bitumen (mod-bit) roofing, and EPDM rubber roofing. We also handle flat roof repairs and replacements for all commercial building types including warehouses, office buildings, retail spaces, and industrial facilities.",
  },
  {
    question: "How long does a commercial roof installation take?",
    answer:
      "Project duration depends on the size and complexity of your roof. A typical commercial roof installation can take anywhere from 1-3 weeks. We work efficiently to minimize disruption to your business operations and can often work around your schedule.",
  },
  {
    question: "What is the lifespan of a commercial roof?",
    answer:
      "With proper installation and maintenance, TPO roofs can last 20-30 years, modified bitumen systems 15-20 years, and EPDM roofs 20-25 years. The actual lifespan depends on factors like climate, maintenance, and quality of installation - which is why choosing GAF Certified contractors like Rollcog is important.",
  },
  {
    question: "Do you offer free estimates?",
    answer:
      "Yes! We provide free, no-obligation estimates for all commercial roofing projects. Our team will conduct an on-site assessment of your roof and deliver a detailed quote within 24 hours.",
  },
  {
    question: "What areas do you serve?",
    answer:
      "We're based in Oak Brook, IL and serve the entire Chicagoland metropolitan area. We also work with clients across multiple states including Indiana, Ohio, West Virginia, Kentucky, Tennessee, North Carolina, South Carolina, and Georgia.",
  },
  {
    question: "Are you licensed and insured?",
    answer:
      "Absolutely. Rollcog is fully licensed and carries comprehensive liability insurance and workers' compensation coverage. We're also GAF Master Certified and GAF Authorized Commercial contractors, which are credentials earned through rigorous training and quality standards.",
  },
  {
    question: "Do you handle emergency roof repairs?",
    answer:
      "Yes, we offer emergency roof repair services. We understand that roof leaks can cause significant damage to your building and inventory. We prioritize emergency calls and typically complete emergency repairs within 5 days of your initial contact.",
  },
  {
    question: "What warranties do you offer?",
    answer:
      "As GAF Certified contractors, we can offer GAF's comprehensive warranty programs, including manufacturer's material warranties and workmanship guarantees. The specific warranty coverage depends on the roofing system selected - we'll explain all warranty options during your estimate.",
  },
  {
    question: "Can you work around my business hours?",
    answer:
      "Yes, we're flexible with scheduling and can work around your business operations. Many of our commercial clients prefer we work during off-hours or weekends to minimize disruption. We'll coordinate with you to find the best schedule for your needs.",
  },
  {
    question: "How do I know if my roof needs repair or replacement?",
    answer:
      "Common signs include visible damage, ponding water, interior leaks, increased energy bills, or age (roofs over 15-20 years should be inspected regularly). We offer free inspections to assess your roof's condition and recommend the most cost-effective solution - whether that's repair, maintenance, or replacement.",
  },
];

export const metadata: Metadata = generatePageMetadata({
  title: "Frequently Asked Questions",
  description: `Common questions about commercial roofing services answered by ${COMPANY.name}. Learn about TPO roofing, flat roof repair, warranties, and more.`,
  path: "/faq",
});

/**
 * FAQ page component with structured data.
 */
export default function FAQPage(): ReactElement {
  const faqSchema = generateFAQSchema(FAQ_ITEMS);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-3xl">
          <h1 className="heading-hero">
            Frequently Asked Questions
          </h1>
          <p className="mt-6 text-xl text-white/70">
            Find answers to common questions about our commercial roofing
            services. Can&apos;t find what you&apos;re looking for? Contact us directly.
          </p>
        </div>
      </Section>

      {/* FAQ List */}
      <Section variant="cream" padding="xl">
        <div className="max-w-3xl mx-auto">
          <Accordion items={FAQ_ITEMS} />
        </div>
      </Section>

      {/* Still Have Questions */}
      <Section variant="cream" padding="lg">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="heading-section text-[var(--foreground)]">
            Still Have Questions?
          </h2>
          <p className="mt-6 text-lg text-[var(--text-body)]">
            Our team is here to help. Send us a message and we&apos;ll get
            back to you within 24 hours.
          </p>
          <div className="mt-8">
            <Link href="/contact">
              <Button variant="primary" size="lg" showArrow trackingLabel="FAQ Questions">
                Contact Us
              </Button>
            </Link>
          </div>
        </div>
      </Section>

      {/* CTA */}
      <Section variant="accent" padding="xl">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="heading-section">
            Ready to Get Started?
          </h2>
          <p className="mt-6 text-xl text-white/90">
            Request a free estimate today and let us help protect your
            commercial building.
          </p>
          <div className="mt-10">
            <Link href="/contact">
              <Button variant="secondary" size="xl" showArrow trackingLabel="FAQ CTA">
                Get Free Estimate
              </Button>
            </Link>
          </div>
        </div>
      </Section>
    </>
  );
}
