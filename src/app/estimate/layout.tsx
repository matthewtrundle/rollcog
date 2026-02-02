/**
 * @fileoverview Layout for /estimate landing page
 * @module app/estimate/layout
 *
 * This layout provides SEO metadata for Google Ads landing pages.
 * The Navigation and Footer components automatically hide on /estimate routes.
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Free Commercial Roofing Estimate Chicago | Rollcog Roofs",
  description:
    "Get a free estimate for commercial roofing in Chicago & Chicagoland. TPO, flat roof repair, modified bitumen experts. GAF Certified with 27+ years experience. 24-hour response.",
  keywords: [
    "commercial roofing Chicago",
    "flat roof repair Chicagoland",
    "TPO roofing Chicago",
    "commercial roof estimate",
    "emergency roof repair Chicago",
    "GAF certified roofer",
    "industrial roofing",
    "modified bitumen Chicago",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "Free Commercial Roofing Estimate | Rollcog Roofs Chicago",
    description:
      "Get a free estimate for commercial roofing in Chicago & Chicagoland. TPO, flat roof repair, emergency services. GAF Certified contractors.",
    type: "website",
  },
};

export default function EstimateLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
