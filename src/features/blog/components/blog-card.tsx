/**
 * @fileoverview Blog card component for listing pages
 * @module features/blog/components/blog-card
 */

import { type ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { BlogPostSummary, BlogCategory } from "../types/blog.types";

interface BlogCardProps {
  post: BlogPostSummary;
  className?: string;
}

const categoryLabels: Record<BlogCategory, string> = {
  "roofing-systems": "Roofing Systems",
  maintenance: "Maintenance",
  "industry-insights": "Industry Insights",
};

const categoryColors: Record<BlogCategory, string> = {
  "roofing-systems": "bg-blue-100 text-blue-800",
  maintenance: "bg-green-100 text-green-800",
  "industry-insights": "bg-purple-100 text-purple-800",
};

/**
 * Formats a date string to a readable format.
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * Blog card component for displaying post previews.
 *
 * @component
 * @example
 * ```tsx
 * <BlogCard post={postSummary} />
 * ```
 */
export function BlogCard({ post, className }: BlogCardProps): ReactElement {
  return (
    <Link
      href={`/insights/${post.slug}`}
      className={cn(
        "group block bg-white rounded-[20px] shadow-sm overflow-hidden",
        "transition-shadow duration-300 hover:shadow-md",
        className
      )}
    >
      {/* Featured Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-gray-100">
        <Image
          src={post.featuredImage.src}
          alt={post.featuredImage.alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Category and Reading Time */}
        <div className="flex items-center gap-3 mb-3">
          <span
            className={cn(
              "text-xs font-medium px-2.5 py-1 rounded-full",
              categoryColors[post.category]
            )}
          >
            {categoryLabels[post.category]}
          </span>
          <span className="text-xs text-[var(--text-muted)]">
            {post.readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2 group-hover:text-[var(--accent)] transition-colors line-clamp-2">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-sm text-[var(--text-body)] leading-relaxed line-clamp-3 mb-4">
          {post.excerpt}
        </p>

        {/* Date */}
        <time
          dateTime={post.publishedAt}
          className="text-xs text-[var(--text-muted)]"
        >
          {formatDate(post.publishedAt)}
        </time>
      </div>
    </Link>
  );
}
