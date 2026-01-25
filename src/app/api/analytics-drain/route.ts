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
    console.error("DATABASE_URL not configured!");
    throw new Error("DATABASE_URL not configured");
  }

  console.log(`insertEvent: Starting for type=${event.type}`);

  // Dynamic import to avoid issues with edge runtime
  const { Pool } = await import("pg");
  const pool = new Pool({ connectionString, ssl: { rejectUnauthorized: false } });

  try {
    if (event.type === "pageview") {
      console.log("insertEvent: Inserting pageview", {
        timestamp: new Date(event.timestamp).toISOString(),
        sessionId: event.sessionId,
        href: event.href,
        country: event.geo?.country,
      });
      const result = await pool.query(
        `INSERT INTO analytics_pageviews
         (timestamp, session_id, href, referrer, user_agent, country, region, city)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
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
      console.log("insertEvent: Pageview inserted, id=", result.rows[0]?.id);
    } else if (event.type === "web-vitals") {
      console.log("insertEvent: Inserting web-vitals", {
        timestamp: new Date(event.timestamp).toISOString(),
        sessionId: event.sessionId,
        metric: event.metric.name,
        value: event.metric.value,
        rating: event.metric.rating,
      });
      const result = await pool.query(
        `INSERT INTO analytics_web_vitals
         (timestamp, session_id, href, metric_name, metric_value, metric_rating, speed)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id`,
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
      console.log("insertEvent: Web-vitals inserted, id=", result.rows[0]?.id);
    } else if (event.type === "event") {
      console.log("insertEvent: Inserting custom event", {
        timestamp: new Date(event.timestamp).toISOString(),
        sessionId: event.sessionId,
        eventName: event.eventName,
      });
      const result = await pool.query(
        `INSERT INTO analytics_events
         (timestamp, session_id, href, event_name, event_data)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [
          new Date(event.timestamp),
          event.sessionId,
          event.href,
          event.eventName,
          JSON.stringify(event.data || {}),
        ]
      );
      console.log("insertEvent: Custom event inserted, id=", result.rows[0]?.id);
    } else {
      console.warn("insertEvent: Unknown event type:", (event as { type: string }).type);
    }
  } catch (dbError) {
    console.error("insertEvent: Database error:", dbError);
    throw dbError;
  } finally {
    await pool.end();
  }
}

/**
 * Handle POST requests from Vercel Analytics Drain
 */
export async function POST(request: Request): Promise<NextResponse> {
  console.log("=== ANALYTICS DRAIN REQUEST RECEIVED ===");
  console.log("Timestamp:", new Date().toISOString());

  // Log request headers for debugging
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });
  console.log("Request headers:", JSON.stringify(headers, null, 2));

  try {
    const payload = await request.text();
    console.log("Raw payload:", payload);
    console.log("Payload length:", payload.length);

    // Parse the events (Vercel sends an array)
    let events: AnalyticsEvent[];
    try {
      events = JSON.parse(payload);
      console.log("Parsed events count:", events.length);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      console.error("Failed to parse payload:", payload.substring(0, 500));
      return NextResponse.json(
        { error: "Invalid JSON payload", details: String(parseError) },
        { status: 400 }
      );
    }

    // Log each event type
    const eventTypes = events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log("Event types breakdown:", eventTypes);

    // Process each event
    const results = await Promise.allSettled(
      events.map(async (event, index) => {
        console.log(`Processing event ${index + 1}/${events.length}: type=${event.type}, sessionId=${event.sessionId}`);
        try {
          await insertEvent(event);
          console.log(`Event ${index + 1} inserted successfully`);
        } catch (insertError) {
          console.error(`Event ${index + 1} insert failed:`, insertError);
          throw insertError;
        }
      })
    );

    // Log results summary
    const failures = results.filter((r) => r.status === "rejected");
    const successes = results.filter((r) => r.status === "fulfilled");
    console.log(`Insert results: ${successes.length} success, ${failures.length} failed`);

    if (failures.length > 0) {
      console.error("Failed insertions:", failures.map((f) =>
        f.status === "rejected" ? f.reason : "unknown"
      ));
    }

    console.log("=== ANALYTICS DRAIN REQUEST COMPLETE ===");

    return NextResponse.json({
      success: true,
      processed: events.length,
      succeeded: successes.length,
      failed: failures.length,
    });
  } catch (error) {
    console.error("Analytics drain error:", error);
    console.error("Error stack:", error instanceof Error ? error.stack : "no stack");
    return NextResponse.json(
      { error: "Failed to process analytics", details: String(error) },
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
