/**
 * @fileoverview Custom event tracking API endpoint
 * @module app/api/analytics/track/route
 *
 * Receives custom events from the client and stores them in PostgreSQL
 * for user journey analysis.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface TrackEventPayload {
  session_id: string;
  event_type: string;
  event_name: string;
  page_path: string;
  event_data?: Record<string, unknown>;
}

/**
 * POST /api/analytics/track - Store a custom event
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json() as TrackEventPayload;
    const { session_id, event_type, event_name, page_path, event_data } = body;

    // Validate required fields
    if (!session_id || !event_type || !event_name) {
      return NextResponse.json(
        { error: "Missing required fields: session_id, event_type, event_name" },
        { status: 400 }
      );
    }

    // Get the next step number for this session
    const stepResult = await query<{ next_step: string }>(
      `SELECT COALESCE(MAX(step_number), 0) + 1 as next_step
       FROM analytics_user_journeys
       WHERE session_id = $1`,
      [session_id]
    );
    const stepNumber = parseInt(stepResult.rows[0]?.next_step || "1", 10);

    // Insert into user journeys table
    await query(
      `INSERT INTO analytics_user_journeys
       (session_id, step_number, event_type, page_path, event_name, event_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        session_id,
        stepNumber,
        event_type,
        page_path || "/",
        event_name,
        JSON.stringify(event_data || {}),
      ]
    );

    // Also insert into analytics_events for backward compatibility
    await query(
      `INSERT INTO analytics_events
       (timestamp, session_id, href, event_name, event_data)
       VALUES (NOW(), $1, $2, $3, $4)`,
      [
        session_id,
        page_path || "/",
        event_name,
        JSON.stringify(event_data || {}),
      ]
    );

    // Update session last activity
    await query(
      `UPDATE analytics_sessions
       SET last_activity_at = NOW()
       WHERE session_id = $1`,
      [session_id]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Track event error:", error);
    // Return success anyway - don't break client experience for analytics failures
    return NextResponse.json({ success: true });
  }
}
