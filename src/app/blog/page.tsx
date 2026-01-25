/**
 * @fileoverview Blog listing page
 * @module app/blog/page
 */

import { type ReactElement } from "react";
import type { Metadata } from "next";
import { Section } from "@/components/ui";
import { BlogList, getAllPostSummaries, blogPosts } from "@/features/blog";
import {
  generateBlogListMetadata,
  generateBlogListSchema,
} from "@/lib/seo";

export const metadata: Metadata = generateBlogListMetadata();

/**
 * Blog listing page component.
 *
 * Displays all blog posts in a responsive grid layout with
 * JSON-LD structured data for SEO.
 */
export default function BlogPage(): ReactElement {
  const postSummaries = getAllPostSummaries();
  const schemaData = generateBlogListSchema({
    posts: blogPosts.map((post) => ({
      title: post.title,
      slug: post.slug,
      publishedAt: post.publishedAt,
      excerpt: post.excerpt,
    })),
  });

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      {/* Hero Section */}
      <Section variant="charcoal" padding="lg">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">
            Our Blog
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
            Commercial Roofing
            <br />
            <span className="text-[var(--accent)]">Insights & Tips</span>
          </h1>
          <p className="mt-6 text-xl text-white/70 leading-relaxed max-w-2xl">
            Expert knowledge on commercial roofing systems, maintenance best
            practices, and industry insights from our team with 27+ years of
            experience.
          </p>
        </div>
      </Section>

      {/* Blog Posts Grid */}
      <Section variant="cream" padding="xl">
        <BlogList posts={postSummaries} />
      </Section>
    </>
  );
}
