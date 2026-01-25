/**
 * @fileoverview Vercel Analytics Drain Endpoint
 * @module app/api/analytics-drain/route
 *
 * Receives Vercel Web Analytics data and stores it in PostgreSQL.
 * Configure this URL in Vercel Dashboard → Analytics → Drains
 */

import { NextResponse } from "next/server";

// Vercel Analytics Web Vitals event type
interface WebVitalsEvent {
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

// Vercel Analytics Page View event type
interface PageViewEvent {
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

// Vercel Analytics Custom Event type
interface CustomEvent {
  type: "event";
  timestamp: number;
  sessionId: string;
  href: string;
  eventName: string;
  data?: Record<string, unknown>;
}

type AnalyticsEvent = WebVitalsEvent | PageViewEvent | CustomEvent;

/**
 * Insert analytics event into PostgreSQL
 */
async function insertEvent(event: AnalyticsEvent): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL not configured");
  }

  // Dynamic import to avoid issues with edge runtime
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    if (event.type === "pageview") {
      await pool.query(
        `INSERT INTO analytics_pageviews
         (timestamp, session_id, href, referrer, user_agent, country, region, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          new Date(event.timestamp),
          event.sessionId,
          event.href,
          event.referrer || null,
          event.ua || null,
          event.geo?.country || null,
          event.geo?.region || null,
          event.geo?.city || null,
        ]
      );
    } else if (event.type === "web-vitals") {
      await pool.query(
        `INSERT INTO analytics_web_vitals
         (timestamp, session_id, href, metric_name, metric_value, metric_rating, speed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          new Date(event.timestamp),
          event.sessionId,
          event.href,
          event.metric.name,
          event.metric.value,
          event.metric.rating,
          event.speed,
        ]
      );
    } else if (event.type === "event") {
      await pool.query(
        `INSERT INTO analytics_events
         (timestamp, session_id, href, event_name, event_data)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          new Date(event.timestamp),
          event.sessionId,
          event.href,
          event.eventName,
          JSON.stringify(event.data || {}),
        ]
      );
    }
  } finally {
    await pool.end();
  }
}

/**
 * Handle POST requests from Vercel Analytics Drain
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const payload = await request.text();

    // Parse the events (Vercel sends an array)
    const events: AnalyticsEvent[] = JSON.parse(payload);

    // Process each event
    const results = await Promise.allSettled(
      events.map((event) => insertEvent(event))
    );

    // Log any failures
    const failures = results.filter((r) => r.status === "rejected");
    if (failures.length > 0) {
      console.error(`Failed to insert ${failures.length}/${events.length} events`);
    }

    return NextResponse.json({
      success: true,
      processed: events.length,
      failed: failures.length,
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
