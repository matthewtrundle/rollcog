"use client";

/**
 * @fileoverview Button component with European premium styling
 * @module components/ui/button
 */

import { type ReactElement, type ButtonHTMLAttributes, forwardRef } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { trackCTAClick } from "@/lib/utils/analytics";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-[var(--accent)] text-white hover:bg-[var(--accent-dark)] focus-visible:ring-[var(--accent)] rounded-2xl",
        secondary:
          "bg-[var(--charcoal)] text-white hover:bg-[var(--primary-dark)] focus-visible:ring-[var(--charcoal)] rounded-2xl",
        outline:
          "border-2 border-[var(--charcoal)] text-[var(--charcoal)] hover:bg-[var(--charcoal)] hover:text-white focus-visible:ring-[var(--charcoal)] rounded-2xl",
        "outline-light":
          "border-2 border-white text-white hover:bg-white hover:text-[var(--charcoal)] focus-visible:ring-white rounded-2xl",
        ghost:
          "text-[var(--charcoal)] hover:bg-[var(--background-muted)] focus-visible:ring-[var(--charcoal)] rounded-2xl",
        link:
          "text-[var(--accent)] underline-offset-4 hover:underline focus-visible:ring-[var(--accent)] rounded-lg",
      },
      size: {
        sm: "h-9 px-5 text-sm",
        md: "h-11 px-7 text-base",
        lg: "h-14 px-9 text-lg",
        xl: "h-16 px-11 text-xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Whether the button shows a loading state */
  isLoading?: boolean;
  /** Whether to show an arrow icon after the text */
  showArrow?: boolean;
  /** Analytics tracking label - tracks CTA click when provided */
  trackingLabel?: string;
}

/**
 * Arrow icon component for buttons - subtle opacity shift on hover
 */
function ArrowIcon({ className }: { className?: string }): ReactElement {
  return (
    <svg
      className={cn("h-4 w-4 opacity-70 transition-opacity group-hover:opacity-100", className)}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  );
}

/**
 * Button component with European premium styling.
 *
 * Features soft-rounded buttons (not pill-shaped) with understated
 * hover transitions and optional arrow icons for CTAs.
 *
 * @component
 * @example
 * ```tsx
 * <Button variant="primary" size="lg" showArrow>
 *   Get Free Estimate
 * </Button>
 * ```
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, showArrow, trackingLabel, children, disabled, onClick, ...props }, ref): ReactElement => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>): void => {
      // Track CTA click if tracking label provided
      if (trackingLabel) {
        const buttonText = typeof children === "string" ? children : trackingLabel;
        trackCTAClick(buttonText, trackingLabel);
      }

      // Call original onClick handler
      onClick?.(e);
    };

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }), "group")}
        ref={ref}
        disabled={disabled || isLoading}
        onClick={handleClick}
        {...props}
      >
        {isLoading ? (
          <span className="opacity-70">Loading...</span>
        ) : (
          <>
            {children}
            {showArrow && <ArrowIcon />}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants };
