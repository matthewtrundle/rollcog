/**
 * @fileoverview SEO utilities barrel export
 * @module lib/seo
 */

export { generatePageMetadata, generateServiceMetadata } from "./metadata";
export {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
} from "./json-ld";
