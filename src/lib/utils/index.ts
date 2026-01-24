/**
 * @fileoverview Utility functions for the Rollcog website
 * @module lib/utils
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// Re-export analytics utilities
export {
  trackPageView,
  trackEvent,
  trackConversion,
  trackFormSubmission,
  trackPhoneClick,
  trackCTAClick,
} from "./analytics";

/**
 * Combines class names with Tailwind CSS merge support.
 *
 * This function merges Tailwind CSS classes intelligently,
 * handling conflicts and deduplication automatically.
 *
 * @param inputs - Class values to merge (strings, objects, arrays)
 * @returns Merged class string
 *
 * @example
 * ```tsx
 * cn("px-4 py-2", "px-8") // Returns "py-2 px-8"
 * cn("bg-red-500", condition && "bg-blue-500")
 * ```
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a phone number for display.
 *
 * @param phone - Raw phone number string
 * @returns Formatted phone number
 */
export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, "");
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`;
  }
  return phone;
}

/**
 * Creates a tel: link for phone numbers.
 *
 * @param phone - Phone number string
 * @returns Tel link href
 */
export function createPhoneLink(phone: string): string {
  return `tel:${phone.replace(/\D/g, "")}`;
}

/**
 * Creates a mailto: link for email addresses.
 *
 * @param email - Email address string
 * @returns Mailto link href
 */
export function createEmailLink(email: string): string {
  return `mailto:${email}`;
}
