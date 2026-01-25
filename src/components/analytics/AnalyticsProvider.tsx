"use client";

/**
 * @fileoverview Analytics Provider Component
 * @module components/analytics/AnalyticsProvider
 *
 * Provides comprehensive analytics tracking across the site:
 * - Scroll depth tracking
 * - Time on page tracking
 * - Returning visitor detection
 * - Form interaction tracking
 */

import { useEffect, useRef, type ReactElement, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import {
  initScrollTracking,
  initTimeOnPageTracking,
  trackReturningVisitor,
  trackFormStart,
} from "@/lib/utils/analytics";

interface AnalyticsProviderProps {
  children: ReactNode;
}

/**
 * Analytics Provider - wrap your app to enable comprehensive tracking
 */
export function AnalyticsProvider({ children }: AnalyticsProviderProps): ReactElement {
  const pathname = usePathname();
  const formStartTracked = useRef<Set<string>>(new Set());

  // Track returning visitors on mount
  useEffect(() => {
    trackReturningVisitor();
  }, []);

  // Initialize scroll and time tracking on route change
  useEffect(() => {
    // Reset form tracking on page change
    formStartTracked.current.clear();

    // Initialize scroll depth tracking
    const cleanupScroll = initScrollTracking(pathname);

    // Initialize time on page tracking
    const cleanupTime = initTimeOnPageTracking(pathname);

    return () => {
      cleanupScroll();
      cleanupTime();
    };
  }, [pathname]);

  // Track form starts globally (first focus on any form input)
  useEffect(() => {
    const handleFocus = (e: FocusEvent): void => {
      const target = e.target as HTMLElement;

      // Check if it's an input inside a form
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        const form = target.closest("form");
        if (form) {
          const formName = form.getAttribute("data-form-name") ||
                          form.getAttribute("name") ||
                          form.getAttribute("id") ||
                          "unknown_form";

          // Only track first focus per form per page view
          if (!formStartTracked.current.has(formName)) {
            formStartTracked.current.add(formName);
            trackFormStart(formName);
          }
        }
      }
    };

    document.addEventListener("focusin", handleFocus);

    return () => {
      document.removeEventListener("focusin", handleFocus);
    };
  }, []);

  return <>{children}</>;
}

export default AnalyticsProvider;
