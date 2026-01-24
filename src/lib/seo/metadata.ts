/**
 * @fileoverview SEO metadata utilities for Next.js 15
 * @module lib/seo/metadata
 */

import { Metadata } from "next";
import { SITE_CONFIG, COMPANY } from "@/lib/utils/constants";

interface PageMetadataOptions {
  title: string;
  description: string;
  path?: string;
  noIndex?: boolean;
}

/**
 * Generates page metadata with consistent branding and SEO optimization.
 *
 * @param options - Page metadata options
 * @returns Next.js Metadata object
 *
 * @example
 * ```tsx
 * export const metadata = generatePageMetadata({
 *   title: "TPO Roofing",
 *   description: "Energy-efficient TPO roofing systems...",
 *   path: "/services/tpo-roofing"
 * });
 * ```
 */
export function generatePageMetadata({
  title,
  description,
  path = "",
  noIndex = false,
}: PageMetadataOptions): Metadata {
  const fullTitle = title === "Home"
    ? SITE_CONFIG.title
    : `${title} | ${COMPANY.name}`;

  const url = `${SITE_CONFIG.url}${path}`;

  return {
    title: fullTitle,
    description,
    keywords: [...SITE_CONFIG.keywords],
    authors: [{ name: COMPANY.name }],
    creator: COMPANY.name,
    publisher: COMPANY.name,
    robots: noIndex ? "noindex, nofollow" : "index, follow",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: COMPANY.name,
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
    },
    verification: {
      // Add when available
      // google: "verification-code",
    },
  };
}

/**
 * Generates metadata for service pages with local SEO optimization.
 *
 * @param serviceName - Name of the service
 * @param serviceDescription - Description of the service
 * @param path - URL path for the service page
 * @returns Next.js Metadata object
 */
export function generateServiceMetadata(
  serviceName: string,
  serviceDescription: string,
  path: string
): Metadata {
  const localizedTitle = `${serviceName} Chicago | ${COMPANY.name}`;
  const localizedDescription = `${serviceDescription} Serving Chicagoland and surrounding areas. ${COMPANY.experience} years experience. Get a free estimate.`;

  return generatePageMetadata({
    title: localizedTitle,
    description: localizedDescription,
    path,
  });
}
