/**
 * @fileoverview TypeScript interfaces for the blog system
 * @module features/blog/types
 */

/**
 * Blog post category types for content organization
 */
export type BlogCategory = "roofing-systems" | "maintenance" | "industry-insights";

/**
 * Author information for blog posts
 */
export interface BlogAuthor {
  name: string;
  role: string;
}

/**
 * Featured image with alt text for accessibility
 */
export interface BlogFeaturedImage {
  src: string;
  alt: string;
}

/**
 * Content section types for structured blog content
 */
export type BlogContentSectionType =
  | "paragraph"
  | "heading"
  | "subheading"
  | "list"
  | "quote"
  | "callout"
  | "image";

/**
 * Base content section interface
 */
interface BaseContentSection {
  type: BlogContentSectionType;
}

/**
 * Paragraph content section
 */
export interface ParagraphSection extends BaseContentSection {
  type: "paragraph";
  content: string;
}

/**
 * Heading content section (H2)
 */
export interface HeadingSection extends BaseContentSection {
  type: "heading";
  content: string;
}

/**
 * Subheading content section (H3)
 */
export interface SubheadingSection extends BaseContentSection {
  type: "subheading";
  content: string;
}

/**
 * List content section (ordered or unordered)
 */
export interface ListSection extends BaseContentSection {
  type: "list";
  ordered?: boolean;
  items: string[];
}

/**
 * Quote/blockquote content section
 */
export interface QuoteSection extends BaseContentSection {
  type: "quote";
  content: string;
  attribution?: string;
}

/**
 * Callout/tip content section
 */
export interface CalloutSection extends BaseContentSection {
  type: "callout";
  title?: string;
  content: string;
  variant?: "info" | "tip" | "warning";
}

/**
 * Image content section within the post
 */
export interface ImageSection extends BaseContentSection {
  type: "image";
  src: string;
  alt: string;
  caption?: string;
}

/**
 * Union type for all content sections
 */
export type BlogContentSection =
  | ParagraphSection
  | HeadingSection
  | SubheadingSection
  | ListSection
  | QuoteSection
  | CalloutSection
  | ImageSection;

/**
 * Complete blog post interface
 */
export interface BlogPost {
  /** URL-friendly identifier */
  slug: string;
  /** Display title for the post */
  title: string;
  /** SEO-optimized meta title */
  metaTitle: string;
  /** Meta description for search results */
  description: string;
  /** Short preview text for cards */
  excerpt: string;
  /** Structured content sections */
  content: BlogContentSection[];
  /** ISO date string for publication date */
  publishedAt: string;
  /** Author information */
  author: BlogAuthor;
  /** SEO keywords */
  keywords: string[];
  /** Content category */
  category: BlogCategory;
  /** Featured/hero image */
  featuredImage: BlogFeaturedImage;
  /** Estimated reading time in minutes */
  readingTime: number;
  /** Related post slugs for cross-linking */
  relatedPosts?: string[];
}

/**
 * Blog post summary for listing pages (optimized payload)
 */
export interface BlogPostSummary {
  slug: string;
  title: string;
  excerpt: string;
  publishedAt: string;
  category: BlogCategory;
  featuredImage: BlogFeaturedImage;
  readingTime: number;
}
