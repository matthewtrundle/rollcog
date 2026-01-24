/**
 * @fileoverview Privacy Policy page
 * @module app/privacy/page
 */

import { type ReactElement } from "react";
import { type Metadata } from "next";
import Link from "next/link";
import { Section } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";

export const metadata: Metadata = {
  title: "Privacy Policy | Rollcog Commercial Roofing",
  description: "Privacy policy for Rollcog commercial roofing services. Learn how we collect, use, and protect your information.",
};

export default function PrivacyPage(): ReactElement {
  return (
    <>
      {/* Hero */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-[var(--accent)] uppercase tracking-widest mb-4">
            Legal
          </p>
          <h1 className="heading-hero">Privacy Policy</h1>
          <p className="mt-4 text-white/60">
            Last updated: January 2025
          </p>
        </div>
      </Section>

      {/* Content */}
      <Section variant="cream" padding="xl">
        <div className="max-w-3xl mx-auto prose prose-lg">
          <h2>Introduction</h2>
          <p>
            {COMPANY.name} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) respects your privacy and is
            committed to protecting your personal information. This Privacy Policy explains how we
            collect, use, disclose, and safeguard your information when you visit our website or
            use our services.
          </p>

          <h2>Information We Collect</h2>
          <h3>Information You Provide</h3>
          <p>We collect information you voluntarily provide when you:</p>
          <ul>
            <li>Fill out our contact form</li>
            <li>Request a quote or estimate</li>
            <li>Subscribe to our newsletter</li>
            <li>Communicate with us via email or phone</li>
          </ul>
          <p>This information may include:</p>
          <ul>
            <li>Name and contact information</li>
            <li>Business name and address</li>
            <li>Project details and requirements</li>
            <li>Any other information you choose to provide</li>
          </ul>

          <h3>Automatically Collected Information</h3>
          <p>
            When you visit our website, we may automatically collect certain information about
            your device and usage, including:
          </p>
          <ul>
            <li>IP address and browser type</li>
            <li>Pages visited and time spent on site</li>
            <li>Referring website addresses</li>
            <li>Device and operating system information</li>
          </ul>

          <h2>How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Respond to your inquiries and provide quotes</li>
            <li>Deliver our roofing services</li>
            <li>Send project updates and communications</li>
            <li>Improve our website and services</li>
            <li>Comply with legal obligations</li>
          </ul>

          <h2>Information Sharing</h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may
            share your information with:
          </p>
          <ul>
            <li>Service providers who assist in our operations</li>
            <li>Professional advisors (lawyers, accountants)</li>
            <li>Government authorities when required by law</li>
          </ul>

          <h2>Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to protect your
            personal information against unauthorized access, alteration, disclosure, or
            destruction. However, no method of transmission over the Internet is 100% secure.
          </p>

          <h2>Your Rights</h2>
          <p>You have the right to:</p>
          <ul>
            <li>Access the personal information we hold about you</li>
            <li>Request correction of inaccurate information</li>
            <li>Request deletion of your information</li>
            <li>Opt-out of marketing communications</li>
          </ul>

          <h2>Cookies</h2>
          <p>
            Our website may use cookies and similar tracking technologies to enhance your
            experience. You can control cookies through your browser settings.
          </p>

          <h2>Third-Party Links</h2>
          <p>
            Our website may contain links to third-party websites. We are not responsible for
            the privacy practices of these external sites.
          </p>

          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any
            changes by posting the new policy on this page with an updated revision date.
          </p>

          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please{" "}
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
