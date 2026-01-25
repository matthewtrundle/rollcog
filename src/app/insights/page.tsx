/**
 * @fileoverview Insights listing page
 * @module app/insights/page
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
 * Insights listing page component.
 *
 * Displays all articles in a responsive grid layout with
 * JSON-LD structured data for SEO.
 */
export default function InsightsPage(): ReactElement {
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
            Insights
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

      {/* Articles Grid */}
      <Section variant="cream" padding="xl">
        <BlogList posts={postSummaries} />
      </Section>
    </>
  );
}
