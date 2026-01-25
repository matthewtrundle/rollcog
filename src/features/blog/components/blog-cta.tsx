/**
 * @fileoverview Blog CTA component for end of posts
 * @module features/blog/components/blog-cta
 */

import { type ReactElement } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { COMPANY } from "@/lib/utils/constants";
import { cn } from "@/lib/utils";

interface BlogCTAProps {
  className?: string;
  variant?: "default" | "compact";
}

/**
 * Blog CTA component displayed at the end of blog posts.
 *
 * Encourages readers to contact for a free estimate after reading.
 *
 * @component
 * @example
 * ```tsx
 * <BlogCTA />
 * <BlogCTA variant="compact" />
 * ```
 */
export function BlogCTA({ className, variant = "default" }: BlogCTAProps): ReactElement {
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "bg-[var(--charcoal)] rounded-2xl p-6 sm:p-8 text-center",
          className
        )}
      >
        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">
          Need Help With Your Commercial Roof?
        </h3>
        <p className="text-white/70 mb-5 text-sm sm:text-base">
          Get a free estimate within 24 hours.
        </p>
        <Link href="/contact">
          <Button variant="primary" size="md" showArrow>
            Get Free Estimate
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "bg-[var(--charcoal)] rounded-[20px] p-8 sm:p-12 mt-12",
        className
      )}
    >
      <div className="max-w-2xl mx-auto text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
          Ready to Discuss Your Roofing Project?
        </h3>
        <p className="text-lg text-white/70 mb-6 leading-relaxed">
          With {COMPANY.experience} years of experience in commercial roofing,
          our team is ready to help with your project. Get a detailed estimate
          within 24 hours.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/contact">
            <Button variant="primary" size="lg" showArrow>
              Get Free Estimate
            </Button>
          </Link>
          <Link href={`tel:${COMPANY.phone.replace(/\D/g, "")}`}>
            <Button variant="outline-light" size="lg">
              Call {COMPANY.phone}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
