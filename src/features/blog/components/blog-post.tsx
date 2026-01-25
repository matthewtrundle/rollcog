/**
 * @fileoverview Blog post content renderer component
 * @module features/blog/components/blog-post
 */

import { type ReactElement } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type {
  BlogContentSection,
  BlogCategory,
  BlogAuthor,
} from "../types/blog.types";

interface BlogPostProps {
  title: string;
  content: BlogContentSection[];
  publishedAt: string;
  author: BlogAuthor;
  category: BlogCategory;
  readingTime: number;
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
 * Renders a single content section based on its type.
 */
function ContentSection({
  section,
  index,
}: {
  section: BlogContentSection;
  index: number;
}): ReactElement {
  switch (section.type) {
    case "paragraph":
      return (
        <p
          key={index}
          className="text-lg text-[var(--text-body)] leading-relaxed"
        >
          {section.content}
        </p>
      );

    case "heading":
      return (
        <h2
          key={index}
          className="text-2xl sm:text-3xl font-bold text-[var(--foreground)] mt-10 mb-4"
        >
          {section.content}
        </h2>
      );

    case "subheading":
      return (
        <h3
          key={index}
          className="text-xl sm:text-2xl font-semibold text-[var(--foreground)] mt-8 mb-3"
        >
          {section.content}
        </h3>
      );

    case "list":
      const ListTag = section.ordered ? "ol" : "ul";
      return (
        <ListTag
          key={index}
          className={cn(
            "space-y-2 text-lg text-[var(--text-body)] leading-relaxed ml-6",
            section.ordered ? "list-decimal" : "list-disc"
          )}
        >
          {section.items.map((item, itemIndex) => (
            <li key={itemIndex}>{item}</li>
          ))}
        </ListTag>
      );

    case "quote":
      return (
        <blockquote
          key={index}
          className="border-l-4 border-[var(--accent)] pl-6 py-2 my-6"
        >
          <p className="text-lg text-[var(--text-body)] italic leading-relaxed">
            {section.content}
          </p>
          {section.attribution && (
            <cite className="block text-sm text-[var(--text-muted)] mt-2 not-italic">
              — {section.attribution}
            </cite>
          )}
        </blockquote>
      );

    case "callout":
      const variantStyles = {
        info: "bg-blue-50 border-blue-200 text-blue-900",
        tip: "bg-green-50 border-green-200 text-green-900",
        warning: "bg-amber-50 border-amber-200 text-amber-900",
      };
      const variant = section.variant || "info";
      return (
        <div
          key={index}
          className={cn(
            "rounded-xl border p-6 my-6",
            variantStyles[variant]
          )}
        >
          {section.title && (
            <p className="font-semibold mb-2">{section.title}</p>
          )}
          <p className="leading-relaxed">{section.content}</p>
        </div>
      );

    case "image":
      return (
        <figure key={index} className="my-8">
          <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
            <Image
              src={section.src}
              alt={section.alt}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 800px"
            />
          </div>
          {section.caption && (
            <figcaption className="text-center text-sm text-[var(--text-muted)] mt-3">
              {section.caption}
            </figcaption>
          )}
        </figure>
      );

    default:
      return <></>;
  }
}

/**
 * Blog post content renderer component.
 *
 * Renders the full blog post with header, content sections, and metadata.
 *
 * @component
 * @example
 * ```tsx
 * <BlogPostContent
 *   title="TPO vs EPDM"
 *   content={contentSections}
 *   publishedAt="2024-01-15"
 *   author={{ name: "John Doe", role: "Roofing Expert" }}
 *   category="roofing-systems"
 *   readingTime={8}
 * />
 * ```
 */
export function BlogPostContent({
  title,
  content,
  publishedAt,
  author,
  category,
  readingTime,
  className,
}: BlogPostProps): ReactElement {
  return (
    <article className={cn("max-w-3xl mx-auto", className)}>
      {/* Post Header */}
      <header className="mb-10">
        {/* Category Badge */}
        <div className="flex items-center gap-3 mb-4">
          <span
            className={cn(
              "text-sm font-medium px-3 py-1 rounded-full",
              categoryColors[category]
            )}
          >
            {categoryLabels[category]}
          </span>
          <span className="text-sm text-[var(--text-muted)]">
            {readingTime} min read
          </span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--foreground)] leading-tight mb-6">
          {title}
        </h1>

        {/* Author and Date */}
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <div>
            <span className="text-[var(--foreground)] font-medium">
              {author.name}
            </span>
            <span className="mx-1">&middot;</span>
            <span>{author.role}</span>
          </div>
          <span>&middot;</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </div>
      </header>

      {/* Post Content */}
      <div className="space-y-6">
        {content.map((section, index) => (
          <ContentSection key={index} section={section} index={index} />
        ))}
      </div>
    </article>
  );
}
