/**
 * @fileoverview Layout for /estimate landing page
 * @module app/estimate/layout
 *
 * This layout provides SEO metadata for Google Ads landing pages.
 * The Navigation and Footer components automatically hide on /estimate routes.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Your Free Commercial Roofing Estimate | Rollcog Roofs",
  description:
    "Request a free estimate for your commercial roofing project. GAF Certified contractors with 27+ years experience. 24-hour response guaranteed.",
  robots: {
    index: true,
    follow: true,
  },
};

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
