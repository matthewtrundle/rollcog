/**
 * @fileoverview Comprehensive analytics and conversion tracking utilities
 * @module lib/utils/analytics
 *
 * Tracks the full lead generation funnel:
 * 1. Awareness - pageviews, scroll depth, video plays
 * 2. Interest - service views, FAQ clicks, time on page
 * 3. Consideration - form starts, lead magnet downloads, quiz completion
 * 4. Conversion - form submits, phone clicks
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ============================================
// CORE TRACKING FUNCTIONS
// ============================================

/**
 * Track a page view in Google Analytics
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

  // Also log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log(`[Analytics] ${action}`, { category, label, value });
  }
}

/**
 * Track a conversion event for Google Ads
 */
export function trackConversion(conversionLabel?: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "conversion", {
      send_to: conversionLabel || process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    });
  }
}

// ============================================
// CONVERSION TRACKING (PRIMARY GOALS)
// ============================================

/**
 * Track contact form submission - PRIMARY CONVERSION
 */
export function trackFormSubmission(service?: string): void {
  trackEvent("form_submit", "Conversion", service);

  // Use specific form conversion label if available
  const formConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_FORM_CONVERSION
    || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  if (formConversionId) {
    trackConversion(formConversionId);
  }
}

/**
 * Track phone number click - PRIMARY CONVERSION
 */
export function trackPhoneClick(location: string = "Header"): void {
  trackEvent("phone_click", "Conversion", location);

  // Use specific phone conversion label if available
  const phoneConversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_PHONE_CONVERSION
    || process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;
  if (phoneConversionId) {
    trackConversion(phoneConversionId);
  }
}

/**
 * Track landing page form submission with source
 */
export function trackLandingPageConversion(source: string): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", "generate_lead", {
      event_category: "Conversion",
      event_label: source,
      value: 100,
      currency: "USD",
    });
  }

  trackEvent("landing_page_conversion", "Conversion", source, 100);

  if (process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID) {
    trackConversion(process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID);
  }
}

// ============================================
// ENGAGEMENT TRACKING (INTEREST SIGNALS)
// ============================================

/**
 * Track service page views - know which services are popular
 */
export function trackServicePageView(serviceName: string): void {
  trackEvent("service_page_view", "Engagement", serviceName);
}

/**
 * Track CTA button clicks
 */
export function trackCTAClick(location: string, ctaText: string): void {
  trackEvent("cta_click", "Engagement", `${location}: ${ctaText}`);
}

/**
 * Track FAQ accordion opens
 */
export function trackFAQClick(question: string): void {
  trackEvent("faq_click", "Engagement", question.substring(0, 100));
}

/**
 * Track testimonial/review views
 */
export function trackTestimonialView(testimonialId: string): void {
  trackEvent("testimonial_view", "Engagement", testimonialId);
}

/**
 * Track outbound link clicks
 */
export function trackOutboundClick(url: string, linkText: string): void {
  trackEvent("outbound_click", "Engagement", `${linkText}: ${url}`);
}

// ============================================
// SCROLL DEPTH TRACKING
// ============================================

const scrollMilestones = new Set<number>();

/**
 * Track scroll depth milestones (25%, 50%, 75%, 100%)
 */
export function trackScrollDepth(percentage: number, pagePath: string): void {
  // Only track each milestone once per page
  const milestone = Math.floor(percentage / 25) * 25;
  if (milestone > 0 && !scrollMilestones.has(milestone)) {
    scrollMilestones.add(milestone);
    trackEvent("scroll_depth", "Engagement", `${milestone}% - ${pagePath}`, milestone);
  }
}

/**
 * Reset scroll tracking (call on page change)
 */
export function resetScrollTracking(): void {
  scrollMilestones.clear();
}

/**
 * Initialize scroll depth tracking for current page
 */
export function initScrollTracking(pagePath: string): () => void {
  resetScrollTracking();

  const handleScroll = (): void => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;
    trackScrollDepth(scrollPercent, pagePath);
  };

  window.addEventListener("scroll", handleScroll, { passive: true });

  return () => {
    window.removeEventListener("scroll", handleScroll);
    resetScrollTracking();
  };
}

// ============================================
// FORM INTERACTION TRACKING
// ============================================

/**
 * Track when user starts filling a form (first field focus)
 */
export function trackFormStart(formName: string): void {
  trackEvent("form_start", "Consideration", formName);
}

/**
 * Track form field interaction (for abandonment analysis)
 */
export function trackFormFieldInteraction(formName: string, fieldName: string): void {
  trackEvent("form_field_focus", "Consideration", `${formName}: ${fieldName}`);
}

/**
 * Track form abandonment (user leaves without submitting)
 */
export function trackFormAbandonment(formName: string, lastField: string): void {
  trackEvent("form_abandonment", "Consideration", `${formName} - last: ${lastField}`);
}

// ============================================
// VIDEO ENGAGEMENT TRACKING
// ============================================

/**
 * Track video play start
 */
export function trackVideoPlay(videoId: string, videoTitle: string): void {
  trackEvent("video_play", "Engagement", `${videoTitle} (${videoId})`);
}

/**
 * Track video watch progress
 */
export function trackVideoProgress(videoId: string, percent: number): void {
  if (percent === 25 || percent === 50 || percent === 75 || percent === 100) {
    trackEvent("video_progress", "Engagement", `${videoId}: ${percent}%`, percent);
  }
}

/**
 * Track video completion
 */
export function trackVideoComplete(videoId: string, videoTitle: string): void {
  trackEvent("video_complete", "Engagement", `${videoTitle} (${videoId})`);
}

// ============================================
// LEAD MAGNET TRACKING
// ============================================

/**
 * Track lead magnet form view
 */
export function trackLeadMagnetView(magnetType: string): void {
  trackEvent("lead_magnet_view", "Consideration", magnetType);
}

/**
 * Track lead magnet download/submission
 */
export function trackLeadMagnetDownload(magnetType: string): void {
  trackEvent("lead_magnet_download", "Consideration", magnetType);
}

/**
 * Track quiz interaction
 */
export function trackQuizStart(source: string): void {
  trackEvent("quiz_start", "Consideration", source);
}

export function trackQuizComplete(source: string, score?: number): void {
  trackEvent("quiz_complete", "Consideration", source, score);
}

// ============================================
// SESSION & USER TRACKING
// ============================================

/**
 * Track returning visitor
 */
export function trackReturningVisitor(): void {
  const visited = localStorage.getItem("rollcog_visited");
  if (visited) {
    trackEvent("returning_visitor", "User", "repeat_visit");
  } else {
    localStorage.setItem("rollcog_visited", new Date().toISOString());
    trackEvent("new_visitor", "User", "first_visit");
  }
}

/**
 * Track time on page (call before user leaves)
 */
export function trackTimeOnPage(pagePath: string, seconds: number): void {
  // Only track meaningful time (> 10 seconds)
  if (seconds > 10) {
    const bucket = seconds < 30 ? "10-30s" :
                   seconds < 60 ? "30-60s" :
                   seconds < 180 ? "1-3min" :
                   seconds < 300 ? "3-5min" : "5min+";
    trackEvent("time_on_page", "Engagement", `${bucket} - ${pagePath}`, Math.round(seconds));
  }
}

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Create a time-on-page tracker
 * Returns cleanup function
 */
export function initTimeOnPageTracking(pagePath: string): () => void {
  const startTime = Date.now();

  const handleBeforeUnload = (): void => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackTimeOnPage(pagePath, timeSpent);
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
    // Also track when component unmounts (SPA navigation)
    const timeSpent = Math.round((Date.now() - startTime) / 1000);
    trackTimeOnPage(pagePath, timeSpent);
  };
}
