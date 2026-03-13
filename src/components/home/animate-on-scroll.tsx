"use client";

import { type ReactElement, type ReactNode } from "react";
import { motion, type Variants } from "framer-motion";

interface AnimateOnScrollProps {
  children: ReactNode;
  variants: Variants;
  className?: string;
  /** HTML tag to render. Defaults to div. */
  as?: "div" | "section" | "p" | "h2";
}

/**
 * Thin client wrapper that triggers framer-motion whileInView animations.
 * Keeps the actual content as server-rendered HTML passed via children.
 */
export function AnimateOnScroll({
  children,
  variants,
  className,
  as = "div",
}: AnimateOnScrollProps): ReactElement {
  const Component = motion.create(as);
  return (
    <Component
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={variants}
      className={className}
    >
      {children}
    </Component>
  );
}
