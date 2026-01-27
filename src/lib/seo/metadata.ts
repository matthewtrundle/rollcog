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
      // Add your Google Search Console verification code here
      // google: "YOUR_GSC_VERIFICATION_CODE",
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

interface BlogPostMetadataOptions {
  metaTitle: string;
  description: string;
  slug: string;
  publishedAt: string;
  keywords: string[];
  featuredImage?: { src: string; alt: string };
}

/**
 * Generates metadata for blog posts with article-specific OpenGraph tags.
 *
 * @param options - Blog post metadata options
 * @returns Next.js Metadata object optimized for articles
 *
 * @example
 * ```tsx
 * export const metadata = generateBlogPostMetadata({
 *   metaTitle: "TPO vs EPDM: Which Roofing System is Right?",
 *   description: "Compare TPO and EPDM roofing systems...",
 *   slug: "tpo-vs-epdm-commercial-roofing",
 *   publishedAt: "2024-01-15",
 *   keywords: ["TPO roofing", "EPDM roofing"]
 * });
 * ```
 */
export function generateBlogPostMetadata({
  metaTitle,
  description,
  slug,
  publishedAt,
  keywords,
  featuredImage,
}: BlogPostMetadataOptions): Metadata {
  const url = `${SITE_CONFIG.url}/insights/${slug}`;
  const fullTitle = `${metaTitle} | ${COMPANY.name}`;

  return {
    title: fullTitle,
    description,
    keywords: [...keywords, ...SITE_CONFIG.keywords],
    authors: [{ name: COMPANY.name }],
    creator: COMPANY.name,
    publisher: COMPANY.name,
    robots: "index, follow",
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: fullTitle,
      description,
      url,
      siteName: COMPANY.name,
      locale: "en_US",
      type: "article",
      publishedTime: publishedAt,
      authors: [COMPANY.name],
      ...(featuredImage && {
        images: [
          {
            url: featuredImage.src.startsWith("http")
              ? featuredImage.src
              : `${SITE_CONFIG.url}${featuredImage.src}`,
            alt: featuredImage.alt,
            width: 1200,
            height: 630,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      ...(featuredImage && {
        images: [featuredImage.src],
      }),
    },
  };
}

/**
 * Generates metadata for the insights listing page.
 *
 * @returns Next.js Metadata object for the insights index
 */
export function generateBlogListMetadata(): Metadata {
  return generatePageMetadata({
    title: "Commercial Roofing Insights",
    description:
      "Expert insights on commercial roofing systems, maintenance tips, and industry news. Learn about TPO, EPDM, modified bitumen, and flat roof care from Chicago's trusted roofing professionals.",
    path: "/insights",
  });
}
