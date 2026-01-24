/**
 * @fileoverview Card component with European premium styling
 * @module components/ui/card
 */

import { type ReactElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card padding size */
  padding?: "sm" | "md" | "lg" | "xl";
  /** Whether to show hover effects */
  hoverable?: boolean;
  /** Card background variant */
  variant?: "white" | "cream" | "charcoal";
}

const paddingClasses = {
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
  xl: "p-10",
};

const variantClasses = {
  white: "bg-[var(--off-white)] text-[var(--foreground)]",
  cream: "bg-[var(--cream)] text-[var(--foreground)]",
  charcoal: "bg-[var(--charcoal)] text-white",
};

/**
 * Card component with European premium styling.
 *
 * Features rounded corners with subtle hover effects (shadow only, no lift).
 * Uses warm off-white instead of pure white for backgrounds.
 *
 * @component
 * @example
 * ```tsx
 * <Card padding="lg" hoverable variant="white">
 *   <h3>Service Title</h3>
 *   <p>Description...</p>
 * </Card>
 * ```
 */
export function Card({
  className,
  padding = "md",
  hoverable = false,
  variant = "white",
  children,
  ...props
}: CardProps): ReactElement {
  return (
    <div
      className={cn(
        "relative rounded-[20px] shadow-sm",
        variantClasses[variant],
        paddingClasses[padding],
        hoverable && "transition-shadow duration-300 hover:shadow-md cursor-pointer group",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * Card header for title sections.
 */
export function CardHeader({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div className={cn("mb-4", className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card title component.
 */
export function CardTitle({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLHeadingElement>): ReactElement {
  return (
    <h3
      className={cn("text-xl font-bold", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

/**
 * Card description/body content.
 */
export function CardContent({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>): ReactElement {
  return (
    <div className={cn("", className)} {...props}>
      {children}
    </div>
  );
}
