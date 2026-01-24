/**
 * @fileoverview JSON-LD structured data generators for SEO
 * @module lib/seo/json-ld
 */

import { COMPANY, SITE_CONFIG, SERVICE_AREAS, CERTIFICATIONS } from "@/lib/utils/constants";

/**
 * Generates LocalBusiness JSON-LD structured data.
 *
 * @returns LocalBusiness schema object
 */
export function generateLocalBusinessSchema(): object {
  return {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: COMPANY.name,
    legalName: COMPANY.legalName,
    url: SITE_CONFIG.url,
    telephone: COMPANY.phone,
    email: COMPANY.email,
    foundingDate: COMPANY.founded.toString(),
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY.address.street,
      addressLocality: COMPANY.address.city,
      addressRegion: COMPANY.address.state,
      postalCode: COMPANY.address.zip,
      addressCountry: COMPANY.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 41.8337,
      longitude: -87.9554,
    },
    areaServed: [
      ...SERVICE_AREAS.primary.map((area) => ({
        "@type": "City",
        name: area,
      })),
      ...SERVICE_AREAS.extended.map((area) => ({
        "@type": "State",
        name: area,
      })),
    ],
    priceRange: "$$",
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "17:00",
    },
    hasCredential: CERTIFICATIONS.map((cert) => ({
      "@type": "EducationalOccupationalCredential",
      name: cert.name,
      description: cert.description,
    })),
    sameAs: [
      "https://facebook.com/rollcogroofs",
      "https://linkedin.com/company/rollcog",
    ],
  };
}

interface ServiceSchemaOptions {
  name: string;
  description: string;
  url: string;
}

/**
 * Generates Service JSON-LD structured data.
 *
 * @param options - Service options
 * @returns Service schema object
 */
export function generateServiceSchema({
  name,
  description,
  url
}: ServiceSchemaOptions): object {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    url,
    provider: {
      "@type": "RoofingContractor",
      name: COMPANY.name,
      telephone: COMPANY.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: COMPANY.address.city,
        addressRegion: COMPANY.address.state,
      },
    },
    areaServed: {
      "@type": "GeoCircle",
      geoMidpoint: {
        "@type": "GeoCoordinates",
        latitude: 41.8337,
        longitude: -87.9554,
      },
      geoRadius: "150 mi",
    },
    serviceType: "Commercial Roofing",
  };
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * Generates FAQ JSON-LD structured data.
 *
 * @param faqs - Array of FAQ items
 * @returns FAQPage schema object
 */
export function generateFAQSchema(faqs: FAQItem[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

/**
 * Generates BreadcrumbList JSON-LD structured data.
 *
 * @param items - Breadcrumb items with name and url
 * @returns BreadcrumbList schema object
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
