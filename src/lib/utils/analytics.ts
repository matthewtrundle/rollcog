/**
 * @fileoverview Vercel Analytics tracking utilities
 * @module lib/utils/analytics
 *
 * Provides comprehensive event tracking using Vercel Analytics.
 * All events comply with Vercel Pro's 2-property limit per event.
 *
 * Events flow to:
 * 1. Vercel Analytics dashboard (real-time)
 * 2. Analytics drain → PostgreSQL (for historical analysis)
 */

import { track } from "@vercel/analytics";

// ============================================
// CONVERSION EVENTS (High Priority)
// ============================================

/**
 * Track form submission - PRIMARY CONVERSION
 * @param formType - Type of form: 'contact' | 'estimate' | 'lead-magnet'
 * @param service - Service type: 'tpo' | 'general' | etc.
 */
export function trackFormSubmission(formType: string, service?: string): void {
  track("form_submitted", {
    type: formType,
    service: service || "general",
  });
}

/**
 * Track phone number click - PRIMARY CONVERSION
 * @param location - Location on page: 'header' | 'footer' | 'hero' | 'contact-page'
 */
export function trackPhoneClick(location: string): void {
  track("phone_clicked", { location });
}

/**
 * Track estimate request
 * @param service - Service being requested
 * @param source - Traffic source
 */
export function trackEstimateRequest(service?: string, source?: string): void {
  track("estimate_requested", {
    service: service || "general",
    source: source || "direct",
  });
}

// ============================================
// CTA & NAVIGATION EVENTS
// ============================================

/**
 * Track CTA button click
 * @param label - Button label/text
 * @param location - Location on page: 'header' | 'hero' | 'footer' | etc.
 */
export function trackCTAClick(label: string, location: string): void {
  track("cta_clicked", {
    label: `${label}:${location}`,
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track link click
 * @param destination - Link destination URL or path
 * @param source - Where the link is: 'header' | 'footer' | 'inline'
 */
export function trackLinkClick(destination: string, source: string): void {
  track("link_clicked", { destination, source });
}

// ============================================
// CONTENT ENGAGEMENT EVENTS
// ============================================

/**
 * Track service page view
 * @param name - Service name
 * @param source - How user got there
 */
export function trackServiceView(name: string, source?: string): void {
  track("service_viewed", {
    name,
    source: source || "direct",
  });
}

/**
 * Track FAQ accordion expand
 * @param question - FAQ question (truncated to 100 chars)
 */
export function trackFAQExpand(question: string): void {
  track("faq_expanded", {
    q: question.substring(0, 100),
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track testimonial view in carousel
 * @param index - Current testimonial index
 * @param total - Total testimonials
 */
export function trackTestimonialView(index: number, total: number): void {
  track("testimonial_viewed", { index, total });
}

/**
 * Track blog article read
 * @param slug - Article slug
 * @param category - Article category
 */
export function trackBlogRead(slug: string, category?: string): void {
  track("blog_read", { slug, category: category || "general" });
}

/**
 * Track scroll depth milestones
 * @param percent - Scroll percentage: 25 | 50 | 75 | 100
 */
export function trackScrollDepth(percent: number): void {
  track("scroll_depth", {
    percent,
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

// ============================================
// LEAD MAGNET EVENTS
// ============================================

/**
 * Track lead magnet form view
 * @param variant - Lead magnet variant: 'quiz' | 'inspection-guide' | 'maintenance-guide'
 */
export function trackLeadMagnetView(variant: string): void {
  track("lead_magnet_viewed", {
    variant,
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track lead magnet download/submission
 * @param variant - Lead magnet variant
 * @param source - Traffic source
 */
export function trackLeadMagnetDownload(variant: string, source?: string): void {
  track("lead_magnet_downloaded", {
    variant,
    source: source || "direct",
  });
}

/**
 * Track quiz start
 * @param source - Traffic source
 */
export function trackQuizStarted(source?: string): void {
  track("quiz_started", {
    source: source || "direct",
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track quiz completion
 * @param score - Quiz score (0-100)
 * @param urgency - Urgency level: 'low' | 'medium' | 'high'
 * @param source - Traffic source
 */
export function trackQuizCompleted(score: number, urgency: string, source?: string): void {
  track("quiz_completed", {
    result: `${score}:${urgency}`,
    source: source || "direct",
  });
}

// ============================================
// ENGAGEMENT QUALITY EVENTS
// ============================================

/**
 * Track meaningful time on page
 * @param seconds - Time spent in seconds (only tracked if >= 10)
 */
export function trackTimeOnPage(seconds: number): void {
  if (seconds >= 10) {
    track("time_on_page", {
      seconds,
      page: typeof window !== "undefined" ? window.location.pathname : "/",
    });
  }
}

/**
 * Track return visitor
 * @param entryPage - Page where they returned
 */
export function trackReturnVisit(entryPage?: string): void {
  track("return_visit", {
    page: entryPage || "/",
  });
}

/**
 * Track exit intent detection
 * @param scrollPercent - How far they scrolled before exit intent
 */
export function trackExitIntent(scrollPercent?: number): void {
  track("exit_intent", {
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    scroll: scrollPercent || 0,
  });
}

// ============================================
// ERROR & FRICTION EVENTS
// ============================================

/**
 * Track form validation error
 * @param formType - Type of form
 * @param field - Field that had error
 * @param error - Error message
 */
export function trackFormError(formType: string, field: string, error: string): void {
  track("form_error", {
    field: `${formType}:${field}`,
    error: error.substring(0, 100),
  });
}

/**
 * Track 404 page not found
 * @param path - Requested path
 * @param referrer - Where they came from
 */
export function trackPageNotFound(path: string, referrer?: string): void {
  track("page_not_found", {
    path,
    from: referrer || "direct",
  });
}

// ============================================
// CAMPAIGN & SOURCE TRACKING
// ============================================

/**
 * Track landing page view with UTM parameters
 * @param source - UTM source
 * @param medium - UTM medium
 * @param campaign - UTM campaign
 */
export function trackLandingPageView(source?: string, medium?: string, campaign?: string): void {
  track("landing_view", {
    source: `${source || "direct"}/${medium || "none"}`,
    campaign: campaign || "none",
  });
}

// ============================================
// CHATBOT EVENTS
// ============================================

/**
 * Track chat widget opened
 */
export function trackChatOpened(): void {
  track("chat_opened", {
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track chat message sent/received
 * @param isUser - True if user message, false if assistant
 */
export function trackChatMessage(isUser: boolean): void {
  track("chat_message", {
    role: isUser ? "user" : "assistant",
    page: typeof window !== "undefined" ? window.location.pathname : "/",
  });
}

/**
 * Track chat conversion (lead captured via chat)
 * @param messageCount - Number of messages in conversation
 */
export function trackChatConversion(messageCount?: number): void {
  track("chat_conversion", {
    page: typeof window !== "undefined" ? window.location.pathname : "/",
    messages: messageCount || 0,
  });
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Get UTM parameters from URL
 */
export function getUTMParams(): Record<string, string | null> {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);
  return {
    utm_source: params.get("utm_source"),
    utm_medium: params.get("utm_medium"),
    utm_campaign: params.get("utm_campaign"),
    utm_term: params.get("utm_term"),
    utm_content: params.get("utm_content"),
  };
}
