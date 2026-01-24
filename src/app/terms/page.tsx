/**
 * @fileoverview Terms of Service page
 * @module app/terms/page
 */

import { type ReactElement } from "react";
import { type Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Terms of Service | Rollcog Commercial Roofing",
  description: "Terms of service for Rollcog commercial roofing. Read our terms and conditions for using our website and services.",
};

export default function TermsPage(): ReactElement {
  return (
    <>
      {/* Hero */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4">
            Legal
          </p>
          <h1 className="heading-hero">Terms of Service</h1>
          <p className="mt-4 text-white/60">
            Last updated: January 2025
          </p>
        </div>
      </Section>

      {/* Content */}
      <Section variant="cream" padding="xl">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h2>Agreement to Terms</h2>
          <p>
            By accessing or using the {COMPANY.name} website and services, you agree to be bound
            by these Terms of Service. If you do not agree to these terms, please do not use
            our website or services.
          </p>

          <h2>Services</h2>
          <p>
            {COMPANY.name} provides commercial roofing services including but not limited to:
          </p>
          <ul>
            <li>TPO roofing installation and repair</li>
            <li>Modified bitumen (Mod-Bit) roofing systems</li>
            <li>Commercial flat roof repair and replacement</li>
            <li>Industrial roofing contracting</li>
          </ul>
          <p>
            All services are subject to separate written agreements, including proposals,
            contracts, and warranties specific to each project.
          </p>

          <h2>Estimates and Quotes</h2>
          <p>
            Estimates and quotes provided through our website or other communications are
            for informational purposes only and are subject to:
          </p>
          <ul>
            <li>On-site inspection and assessment</li>
            <li>Final written proposal and contract</li>
            <li>Changes based on actual conditions discovered</li>
            <li>Expiration dates as specified in the quote</li>
          </ul>

          <h2>Website Use</h2>
          <p>When using our website, you agree not to:</p>
          <ul>
            <li>Use the site for any unlawful purpose</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Interfere with the proper functioning of the website</li>
            <li>Transmit viruses or malicious code</li>
            <li>Collect user information without consent</li>
          </ul>

          <h2>Intellectual Property</h2>
          <p>
            All content on this website, including text, graphics, logos, images, and software,
            is the property of {COMPANY.name} or its content suppliers and is protected by
            copyright and trademark laws. You may not reproduce, distribute, or create
            derivative works without our written permission.
          </p>

          <h2>Limitation of Liability</h2>
          <p>
            To the fullest extent permitted by law, {COMPANY.name} shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising
            from your use of our website or services.
          </p>
          <p>
            Our liability for any claim arising from our services shall be limited to the
            amount paid for those specific services.
          </p>

          <h2>Warranties and Guarantees</h2>
          <p>
            Warranties for roofing work are provided in writing as part of individual project
            contracts. The website does not constitute a warranty or guarantee of any kind.
            All services are provided in accordance with the specific terms of your project
            agreement.
          </p>

          <h2>Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless {COMPANY.name}, its officers, directors,
            employees, and agents from any claims, damages, or expenses arising from your
            violation of these terms or your use of our website.
          </p>

          <h2>Governing Law</h2>
          <p>
            These Terms of Service shall be governed by and construed in accordance with the
            laws of the State of Illinois, without regard to its conflict of law provisions.
            Any disputes shall be resolved in the courts of DuPage County, Illinois.
          </p>

          <h2>Changes to Terms</h2>
          <p>
            We reserve the right to modify these terms at any time. Changes will be effective
            immediately upon posting to the website. Your continued use of the website
            constitutes acceptance of the modified terms.
          </p>

          <h2>Severability</h2>
          <p>
            If any provision of these terms is found to be unenforceable, the remaining
            provisions will continue in full force and effect.
          </p>

          <h2>Contact</h2>
          <p>
            For questions about these Terms of Service, please{" "}
            <Link href="/contact" className="text-[var(--accent)] hover:underline">
              contact us
            </Link>.
          </p>
          <p>
            {COMPANY.name}<br />
            {COMPANY.address.street}<br />
            {COMPANY.address.city}, {COMPANY.address.state} {COMPANY.address.zip}
          </p>
        </div>
      </Section>
    </>
  );
}
