/**
 * @fileoverview SEO utilities barrel export
 * @module lib/seo
 */

export {
  generatePageMetadata,
  generateServiceMetadata,
  generateBlogPostMetadata,
  generateBlogListMetadata,
} from "./metadata";
export {
  generateLocalBusinessSchema,
  generateServiceSchema,
  generateFAQSchema,
  generateBreadcrumbSchema,
  generateBlogPostingSchema,
  generateBlogListSchema,
} from "./json-ld";
