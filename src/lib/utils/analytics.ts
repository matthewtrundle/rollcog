/**
 * @fileoverview Google Analytics and conversion tracking utilities
 * @module lib/utils/analytics
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

/**
 * Track a page view in Google Analytics
 * @param url - The URL to track
 */
export function trackPageView(url: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("config", process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
}

/**
 * Track a custom event in Google Analytics
 * @param action - The action name (e.g., 'form_submit', 'phone_click')
 * @param category - The event category (e.g., 'Contact', 'Lead')
 * @param label - Optional label for additional context
 * @param value - Optional numeric value
 */
export function trackEvent(
  action: string,
  category: string,
  label?: string,
  value?: number
): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
}

/**
 * Track a conversion event (e.g., form submission, phone call)
 * Use this for Google Ads conversion tracking
 * @param conversionLabel - The Google Ads conversion label (e.g., 'AW-XXXXX/YYYYY')
 */
export function trackConversion(conversionLabel?: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    // Track as a Google Analytics event
    window.gtag("event", "conversion", {
      send_to: conversionLabel || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    });
  }
}

/**
 * Track contact form submission
 * @param service - The service type selected (if any)
 */
export function trackFormSubmission(service?: string): void {
  trackEvent("form_submit", "Contact", service);

  // Also track as a conversion for Google Ads
  if (process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID) {
    trackConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID);
  }
}

/**
 * Track phone number click
 */
export function trackPhoneClick(): void {
  trackEvent("phone_click", "Contact", "Header CTA");
}

/**
 * Track CTA button click
 * @param location - Where the CTA was clicked (e.g., 'hero', 'footer')
 * @param ctaText - The text of the CTA button
 */
export function trackCTAClick(location: string, ctaText: string): void {
  trackEvent("cta_click", "Engagement", `${location}: ${ctaText}`);
}
