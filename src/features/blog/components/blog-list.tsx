/**
 * @fileoverview Blog list component with responsive grid layout
 * @module features/blog/components/blog-list
 */

import { type ReactElement } from "react";
import { cn } from "@/lib/utils";
import { BlogCard } from "./blog-card";
import type { BlogPostSummary } from "../types/blog.types";

interface BlogListProps {
  posts: BlogPostSummary[];
  className?: string;
}

/**
 * Blog list component displaying a responsive grid of blog cards.
 *
 * @component
 * @example
 * ```tsx
 * <BlogList posts={postSummaries} />
 * ```
 */
export function BlogList({ posts, className }: BlogListProps): ReactElement {
  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--text-muted)]">No blog posts found.</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "grid gap-8",
        "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className
      )}
    >
      {posts.map((post) => (
        <BlogCard key={post.slug} post={post} />
      ))}
    </div>
  );
}
