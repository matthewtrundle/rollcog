/**
 * @fileoverview Vercel Analytics Drain Endpoint
 * @module app/api/analytics-drain/route
 *
 * Receives Vercel Web Analytics data and stores it in PostgreSQL.
 * Configure this URL in Vercel Dashboard → Project → Settings → Drains
 *
 * NOTE: Vercel Analytics Drains only send pageview and custom events.
 * Web Vitals are NOT sent via drains - they stay in Vercel's own storage.
 */

import { NextResponse } from "next/server";

/**
 * Vercel Analytics Drain Event - actual format from Vercel
 * Reference: https://vercel.com/docs/drains/reference/analytics
 */
interface VercelAnalyticsEvent {
  schema?: string;              // "vercel.analytics.v1"
  eventType: "pageview" | "event";
  eventName?: string;           // For custom events
  eventData?: string;           // JSON string for custom events
  timestamp: number;
  projectId?: string;
  ownerId?: string;
  dataSourceName?: string;
  sessionId: number | string;
  deviceId?: number;
  origin?: string;              // "https://example.com"
  path?: string;                // "/dashboard"
  referrer?: string;
  queryParams?: string;
  route?: string;
  country?: string;
  region?: string;
  city?: string;
  osName?: string;
  osVersion?: string;
  clientName?: string;          // Browser name
  clientType?: string;
  clientVersion?: string;
  deviceType?: string;          // "desktop", "mobile", "tablet"
  deviceBrand?: string;
  deviceModel?: string;
  browserEngine?: string;
  browserEngineVersion?: string;
  sdkVersion?: string;
  sdkName?: string;
  vercelEnvironment?: string;
  vercelUrl?: string;
  flags?: string;
  deployment?: string;
}

/**
 * Legacy event format (for backwards compatibility with test data)
 */
interface LegacyPageViewEvent {
  type: "pageview";
  timestamp: number;
  sessionId: string;
  href: string;
  referrer?: string;
  ua?: string;
  geo?: {
    country?: string;
    region?: string;
    city?: string;
  };
}

interface LegacyWebVitalsEvent {
  type: "web-vitals";
  timestamp: number;
  sessionId: string;
  href: string;
  speed: string;
  metric: {
    id: string;
    name: "CLS" | "FCP" | "FID" | "INP" | "LCP" | "TTFB";
    value: number;
    rating: "good" | "needs-improvement" | "poor";
  };
}

interface LegacyCustomEvent {
  type: "event";
  timestamp: number;
  sessionId: string;
  href: string;
  eventName: string;
  data?: Record<string, unknown>;
}

type LegacyEvent = LegacyPageViewEvent | LegacyWebVitalsEvent | LegacyCustomEvent;

/**
 * Normalize event to a standard format for database insertion
 */
function normalizeEvent(rawEvent: VercelAnalyticsEvent | LegacyEvent): {
  eventType: "pageview" | "event" | "web-vitals";
  timestamp: Date;
  sessionId: string;
  href: string;
  referrer: string | null;
  userAgent: string | null;
  country: string | null;
  region: string | null;
  city: string | null;
  deviceType: string | null;
  eventName?: string;
  eventData?: string;
  // Web vitals specific
  metricName?: string;
  metricValue?: number;
  metricRating?: string;
  speed?: string;
} {
  // Check if it's the new Vercel format (has eventType) or legacy format (has type)
  const isVercelFormat = "eventType" in rawEvent;

  if (isVercelFormat) {
    const event = rawEvent as VercelAnalyticsEvent;
    const href = event.origin && event.path
      ? `${event.origin}${event.path}`
      : event.origin || "";

    return {
      eventType: event.eventType,
      timestamp: new Date(event.timestamp),
      sessionId: String(event.sessionId),
      href,
      referrer: event.referrer || null,
      userAgent: event.clientName ? `${event.clientName} ${event.clientVersion || ""}`.trim() : null,
      country: event.country || null,
      region: event.region || null,
      city: event.city || null,
      deviceType: event.deviceType || null,
      eventName: event.eventName,
      eventData: event.eventData,
    };
  } else {
    const event = rawEvent as LegacyEvent;

    if (event.type === "web-vitals") {
      return {
        eventType: "web-vitals",
        timestamp: new Date(event.timestamp),
        sessionId: String(event.sessionId),
        href: event.href,
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        deviceType: null,
        metricName: event.metric.name,
        metricValue: event.metric.value,
        metricRating: event.metric.rating,
        speed: event.speed,
      };
    } else if (event.type === "event") {
      return {
        eventType: "event",
        timestamp: new Date(event.timestamp),
        sessionId: String(event.sessionId),
        href: event.href,
        referrer: null,
        userAgent: null,
        country: null,
        region: null,
        city: null,
        deviceType: null,
        eventName: event.eventName,
        eventData: event.data ? JSON.stringify(event.data) : undefined,
      };
    } else {
      // pageview
      const pvEvent = event as LegacyPageViewEvent;
      return {
        eventType: "pageview",
        timestamp: new Date(pvEvent.timestamp),
        sessionId: String(pvEvent.sessionId),
        href: pvEvent.href,
        referrer: pvEvent.referrer || null,
        userAgent: pvEvent.ua || null,
        country: pvEvent.geo?.country || null,
        region: pvEvent.geo?.region || null,
        city: pvEvent.geo?.city || null,
        deviceType: null,
      };
    }
  }
}

/**
 * Extract UTM parameters and path from URL
 */
function parseUrl(href: string): {
  path: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  utmContent: string | null;
  source: string | null;
  gclid: string | null;
} {
  try {
    const url = new URL(href);
    return {
      path: url.pathname,
      utmSource: url.searchParams.get("utm_source"),
      utmMedium: url.searchParams.get("utm_medium"),
      utmCampaign: url.searchParams.get("utm_campaign"),
      utmTerm: url.searchParams.get("utm_term"),
      utmContent: url.searchParams.get("utm_content"),
      source: url.searchParams.get("source"), // Custom source param
      gclid: url.searchParams.get("gclid"), // Google Ads click ID
    };
  } catch {
    return {
      path: href,
      utmSource: null,
      utmMedium: null,
      utmCampaign: null,
      utmTerm: null,
      utmContent: null,
      source: null,
      gclid: null,
    };
  }
}

/**
 * Ensure session exists in analytics_sessions table
 */
async function ensureSession(
  pool: import("pg").Pool,
  sessionId: string,
  firstPage: string,
  referrer: string | null,
  country: string | null,
  deviceType: string | null,
  timestamp: Date
): Promise<void> {
  const parsed = parseUrl(firstPage);

  // Determine UTM source - check for gclid (Google Ads)
  let utmSource = parsed.utmSource || parsed.source;
  let utmMedium = parsed.utmMedium;

  if (parsed.gclid && !utmSource) {
    utmSource = "google";
    utmMedium = utmMedium || "cpc";
  }

  // Try to insert new session (ignore if exists)
  await pool.query(
    `INSERT INTO analytics_sessions
     (session_id, first_page, entry_referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, device_type, country, started_at, last_activity_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11)
     ON CONFLICT (session_id) DO UPDATE SET last_activity_at = $11`,
    [
      sessionId,
      parsed.path,
      referrer,
      utmSource,
      utmMedium,
      parsed.utmCampaign,
      parsed.utmTerm,
      parsed.utmContent,
      deviceType,
      country,
      timestamp,
    ]
  );
}

/**
 * Add journey event for session
 */
async function addJourneyEvent(
  pool: import("pg").Pool,
  sessionId: string,
  eventType: string,
  pagePath: string | null,
  eventName: string,
  eventData: Record<string, unknown> | null,
  timestamp: Date
): Promise<void> {
  // Get next step number for this session
  const stepResult = await pool.query(
    `SELECT COALESCE(MAX(step_number), 0) + 1 as next_step
     FROM analytics_user_journeys WHERE session_id = $1`,
    [sessionId]
  );
  const stepNumber = stepResult.rows[0]?.next_step || 1;

  await pool.query(
    `INSERT INTO analytics_user_journeys
     (session_id, step_number, event_type, page_path, event_name, event_data, timestamp)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [sessionId, stepNumber, eventType, pagePath, eventName, eventData ? JSON.stringify(eventData) : "{}", timestamp]
  );
}

/**
 * Insert normalized event into PostgreSQL
 */
async function insertEvent(normalized: ReturnType<typeof normalizeEvent>): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not configured!");
    throw new Error("DATABASE_URL not configured");
  }

  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    // Ensure session exists (for all event types)
    if (normalized.sessionId && normalized.sessionId !== "0") {
      await ensureSession(
        pool,
        normalized.sessionId,
        normalized.href,
        normalized.referrer,
        normalized.country,
        normalized.deviceType,
        normalized.timestamp
      );
    }

    if (normalized.eventType === "pageview") {
      console.log("Inserting pageview:", {
        timestamp: normalized.timestamp.toISOString(),
        sessionId: normalized.sessionId,
        href: normalized.href,
        country: normalized.country,
      });

      const result = await pool.query(
        `INSERT INTO analytics_pageviews
         (timestamp, session_id, href, referrer, user_agent, country, region, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          normalized.timestamp,
          normalized.sessionId,
          normalized.href,
          normalized.referrer,
          normalized.userAgent,
          normalized.country,
          normalized.region,
          normalized.city,
        ]
      );
      console.log("Pageview inserted, id=", result.rows[0]?.id);

      // Add journey event for pageview
      if (normalized.sessionId && normalized.sessionId !== "0") {
        const parsed = parseUrl(normalized.href);
        await addJourneyEvent(pool, normalized.sessionId, "pageview", parsed.path, "page_view", null, normalized.timestamp);
      }

    } else if (normalized.eventType === "web-vitals") {
      console.log("Inserting web-vitals:", {
        metric: normalized.metricName,
        value: normalized.metricValue,
      });

      const result = await pool.query(
        `INSERT INTO analytics_web_vitals
         (timestamp, session_id, href, metric_name, metric_value, metric_rating, speed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
        [
          normalized.timestamp,
          normalized.sessionId,
          normalized.href,
          normalized.metricName,
          normalized.metricValue,
          normalized.metricRating,
          normalized.speed,
        ]
      );
      console.log("Web-vitals inserted, id=", result.rows[0]?.id);

    } else if (normalized.eventType === "event") {
      console.log("Inserting custom event:", {
        eventName: normalized.eventName,
      });

      const result = await pool.query(
        `INSERT INTO analytics_events
         (timestamp, session_id, href, event_name, event_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          normalized.timestamp,
          normalized.sessionId,
          normalized.href,
          normalized.eventName,
          normalized.eventData || "{}",
        ]
      );
      console.log("Custom event inserted, id=", result.rows[0]?.id);

      // Add journey event for custom events (conversions, engagement, etc.)
      if (normalized.sessionId && normalized.sessionId !== "0" && normalized.eventName) {
        const parsed = parseUrl(normalized.href);
        const eventType = ["form_submit", "phone_click", "landing_page_conversion"].includes(normalized.eventName)
          ? "conversion"
          : "engagement";
        let eventData: Record<string, unknown> | null = null;
        try {
          eventData = normalized.eventData ? JSON.parse(normalized.eventData) : null;
        } catch {}
        await addJourneyEvent(pool, normalized.sessionId, eventType, parsed.path, normalized.eventName, eventData, normalized.timestamp);
      }
    }
  } catch (dbError) {
    console.error("Database error:", dbError);
    throw dbError;
  } finally {
    await pool.end();
  }
}

/**
 * Handle POST requests from Vercel Analytics Drain
 */
export async function POST(request: Request): Promise<NextResponse> {
  console.log("=== ANALYTICS DRAIN REQUEST ===");
  console.log("Time:", new Date().toISOString());

  try {
    const payload = await request.text();
    console.log("Payload length:", payload.length);
    console.log("Payload preview:", payload.substring(0, 500));

    // Parse the events (Vercel sends an array)
    let rawEvents: (VercelAnalyticsEvent | LegacyEvent)[];
    try {
      rawEvents = JSON.parse(payload);
      if (!Array.isArray(rawEvents)) {
        rawEvents = [rawEvents];
      }
      console.log("Events count:", rawEvents.length);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Log event types for debugging
    const eventTypes: Record<string, number> = {};
    rawEvents.forEach((e) => {
      const type = "eventType" in e ? e.eventType : (e as LegacyEvent).type;
      eventTypes[type] = (eventTypes[type] || 0) + 1;
    });
    console.log("Event types:", eventTypes);

    // Process each event
    const results = await Promise.allSettled(
      rawEvents.map(async (rawEvent, index) => {
        try {
          const normalized = normalizeEvent(rawEvent);
          console.log(`Event ${index + 1}: ${normalized.eventType} - ${normalized.href}`);
          await insertEvent(normalized);
        } catch (err) {
          console.error(`Event ${index + 1} failed:`, err);
          throw err;
        }
      })
    );

    const succeeded = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(`Results: ${succeeded} success, ${failed} failed`);
    console.log("=== REQUEST COMPLETE ===");

    return NextResponse.json({
      success: true,
      processed: rawEvents.length,
      succeeded,
      failed,
    });
  } catch (error) {
    console.error("Analytics drain error:", error);
    return NextResponse.json(
      { error: "Failed to process analytics" },
      { status: 500 }
    );
  }
}

/**
 * Health check endpoint
 */
export async function GET(): Promise<NextResponse> {
  return NextResponse.json({ status: "ok", endpoint: "analytics-drain" });
}
