/**
 * @fileoverview Container component for consistent page width
 * @module components/ui/container
 */

import { type ReactElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum width variant */
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

const sizeClasses = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "max-w-full",
};

/**
 * Container component for consistent content width.
 *
 * Centers content and applies consistent horizontal padding.
 * Supports multiple max-width variants.
 *
 * @component
 * @example
 * ```tsx
 * <Container size="lg">
 *   <h1>Page Content</h1>
 * </Container>
 * ```
 */
export function Container({
  className,
  size = "xl",
  children,
  ...props
}: ContainerProps): ReactElement {
  return (
    <div
      className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", sizeClasses[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}
