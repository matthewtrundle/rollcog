/**
 * @fileoverview Section component with European premium styling
 * @module components/ui/section
 */

import { type ReactElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Container } from "./container";

interface SectionProps extends HTMLAttributes<HTMLElement> {
  /** Background color variant */
  variant?: "cream" | "charcoal" | "white" | "accent";
  /** Vertical padding size - Somerville uses generous spacing */
  padding?: "sm" | "md" | "lg" | "xl" | "2xl";
  /** Container size for content */
  containerSize?: "sm" | "md" | "lg" | "xl" | "full";
  /** Whether to use full width without container */
  fullWidth?: boolean;
  /** Whether the section has rounded corners (for overlay effects) */
  rounded?: boolean;
}

const variantClasses = {
  cream: "bg-[var(--cream)] text-[var(--foreground)]",
  charcoal: "bg-[var(--charcoal)] text-white",
  white: "bg-[var(--off-white)] text-[var(--foreground)]",
  accent: "bg-[var(--accent)] text-white",
};

// Editorial-style generous padding with more breathing room
const paddingClasses = {
  sm: "py-12 sm:py-16",
  md: "py-16 sm:py-24",
  lg: "py-24 sm:py-32",
  xl: "py-32 sm:py-40",
  "2xl": "py-40 sm:py-52",
};

/**
 * Section component with European premium styling.
 *
 * Features warm cream/charcoal backgrounds with generous padding (80-120px).
 * Uses warm off-white instead of pure white for the white variant.
 *
 * @component
 * @example
 * ```tsx
 * <Section variant="charcoal" padding="xl">
 *   <h2>Our Services</h2>
 *   <p>Content here...</p>
 * </Section>
 * ```
 */
export function Section({
  className,
  variant = "cream",
  padding = "lg",
  containerSize = "xl",
  fullWidth = false,
  rounded = false,
  children,
  ...props
}: SectionProps): ReactElement {
  return (
    <section
      className={cn(
        variantClasses[variant],
        paddingClasses[padding],
        rounded && "rounded-[var(--radius-xl)] mx-4 my-4 sm:mx-6 sm:my-6 lg:mx-8 lg:my-8",
        className
      )}
      {...props}
    >
      {fullWidth ? (
        children
      ) : (
        <Container size={containerSize}>{children}</Container>
      )}
    </section>
  );
}
