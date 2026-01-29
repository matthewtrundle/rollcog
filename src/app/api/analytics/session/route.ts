/**
 * @fileoverview Session initialization API endpoint
 * @module app/api/analytics/session/route
 *
 * Creates new sessions in PostgreSQL with UTM and referrer data.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface SessionPayload {
  session_id: string;
  first_page: string;
  entry_referrer?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  device_type?: string | null;
}

/**
 * POST /api/analytics/session - Initialize a new session
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as SessionPayload;
    const {
      session_id,
      first_page,
      entry_referrer,
      utm_source,
      utm_medium,
      utm_campaign,
      device_type,
    } = body;

    // Validate required fields
    if (!session_id) {
      return NextResponse.json(
        { error: "Missing required field: session_id" },
        { status: 400 }
      );
    }

    // Check if session already exists
    const existingSession = await query<{ session_id: string }>(
      "SELECT session_id FROM analytics_sessions WHERE session_id = $1",
      [session_id]
    );

    if (existingSession.rows.length > 0) {
      // Session already exists, just update last activity
      await query(
        `UPDATE analytics_sessions
         SET last_activity_at = NOW()
         WHERE session_id = $1`,
        [session_id]
      );
      return NextResponse.json({ success: true, existing: true });
    }

    // Insert new session
    await query(
      `INSERT INTO analytics_sessions
       (session_id, first_page, entry_referrer, utm_source, utm_medium, utm_campaign, device_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        session_id,
        first_page || "/",
        entry_referrer || null,
        utm_source || null,
        utm_medium || null,
        utm_campaign || null,
        device_type || "desktop",
      ]
    );

    return NextResponse.json({ success: true, created: true });
  } catch (error) {
    console.error("Session init error:", error);
    // Return success anyway - don't break client experience for analytics failures
    return NextResponse.json({ success: true });
  }
}
