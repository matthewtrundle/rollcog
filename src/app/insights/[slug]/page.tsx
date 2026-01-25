/**
 * @fileoverview Individual insights post page
 * @module app/insights/[slug]/page
 */

import { type ReactElement } from "react";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Section } from "@/components/ui";
import {
  BlogPostContent,
  BlogCTA,
  BlogCard,
  getPostBySlug,
  getAllSlugs,
  getAllPostSummaries,
} from "@/features/blog";
import {
  generateBlogPostMetadata,
  generateBlogPostingSchema,
  generateBreadcrumbSchema,
} from "@/lib/seo";
import { SITE_CONFIG } from "@/lib/utils/constants";

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Generate static paths for all blog posts.
 */
export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  return getAllSlugs().map((slug) => ({ slug }));
}

/**
 * Generate metadata for the blog post.
 */
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return generateBlogPostMetadata({
    metaTitle: post.metaTitle,
    description: post.description,
    slug: post.slug,
    publishedAt: post.publishedAt,
    keywords: post.keywords,
    featuredImage: post.featuredImage,
  });
}

/**
 * Individual blog post page component.
 */
export default async function BlogPostPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  // Generate schema data
  const blogPostingSchema = generateBlogPostingSchema({
    title: post.title,
    description: post.description,
    slug: post.slug,
    publishedAt: post.publishedAt,
    author: post.author,
    featuredImage: post.featuredImage,
    keywords: post.keywords,
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: SITE_CONFIG.url },
    { name: "Insights", url: `${SITE_CONFIG.url}/insights` },
    { name: post.title, url: `${SITE_CONFIG.url}/insights/${post.slug}` },
  ]);

  // Get related posts
  const allSummaries = getAllPostSummaries();
  const relatedPosts = post.relatedPosts
    ? allSummaries.filter((p) => post.relatedPosts?.includes(p.slug))
    : allSummaries.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([blogPostingSchema, breadcrumbSchema]),
        }}
      />

      {/* Featured Image Hero */}
      <div className="relative h-[40vh] sm:h-[50vh] lg:h-[60vh] bg-[var(--charcoal)]">
        <Image
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--charcoal)] via-transparent to-transparent" />
      </div>

      {/* Post Content */}
      <Section variant="cream" padding="xl" className="-mt-24 relative z-10">
        <BlogPostContent
          title={post.title}
          content={post.content}
          publishedAt={post.publishedAt}
          author={post.author}
          category={post.category}
          readingTime={post.readingTime}
        />

        {/* CTA */}
        <div className="max-w-3xl mx-auto">
          <BlogCTA />
        </div>
      </Section>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <Section variant="white" padding="lg">
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider mb-4">
              Keep Reading
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[var(--foreground)]">
              Related Articles
            </h2>
          </div>

          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {relatedPosts.slice(0, 3).map((relatedPost) => (
              <BlogCard key={relatedPost.slug} post={relatedPost} />
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/insights"
              className="text-[var(--accent)] font-medium hover:underline"
            >
              View All Articles
            </Link>
          </div>
        </Section>
      )}
    </>
  );
}
