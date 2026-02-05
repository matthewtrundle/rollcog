/**
 * Backfill analytics_sessions from analytics_pageviews data
 *
 * This script creates session records from existing pageview data
 * so the intelligence report has historical data to analyze.
 *
 * Run with: npx ts-node scripts/backfill-sessions.ts
 */

import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL ||
    "postgresql://neondb_owner:npg_Z0imEJMuwa6K@ep-summer-cell-ahy5cyze-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false },
});

async function backfillSessions(): Promise<void> {
  console.log("Starting session backfill from pageviews...\n");

  // Step 1: Find all unique sessions in pageviews that don't exist in analytics_sessions
  const missingSessions = await pool.query<{
    session_id: string;
    first_page: string;
    referrer: string | null;
    country: string | null;
    started_at: Date;
    last_activity: Date;
    page_count: number;
  }>(`
    SELECT
      p.session_id,
      FIRST_VALUE(p.href) OVER (PARTITION BY p.session_id ORDER BY p.timestamp) as first_page,
      FIRST_VALUE(p.referrer) OVER (PARTITION BY p.session_id ORDER BY p.timestamp) as referrer,
      FIRST_VALUE(p.country) OVER (PARTITION BY p.session_id ORDER BY p.timestamp) as country,
      MIN(p.timestamp) as started_at,
      MAX(p.timestamp) as last_activity,
      COUNT(*)::int as page_count
    FROM analytics_pageviews p
    LEFT JOIN analytics_sessions s ON p.session_id = s.session_id
    WHERE s.session_id IS NULL
    GROUP BY p.session_id, p.href, p.referrer, p.country, p.timestamp
  `);

  // Deduplicate by session_id
  const sessionMap = new Map<string, {
    session_id: string;
    first_page: string;
    referrer: string | null;
    country: string | null;
    started_at: Date;
    last_activity: Date;
    page_count: number;
  }>();

  for (const row of missingSessions.rows) {
    if (!sessionMap.has(row.session_id)) {
      sessionMap.set(row.session_id, row);
    }
  }

  const uniqueSessions = Array.from(sessionMap.values());
  console.log(`Found ${uniqueSessions.length} sessions to backfill\n`);

  if (uniqueSessions.length === 0) {
    console.log("No sessions to backfill. All pageview sessions already exist.");
    await pool.end();
    return;
  }

  // Step 2: Insert sessions
  let sessionsCreated = 0;
  let journeysCreated = 0;

  for (const session of uniqueSessions) {
    try {
      // Extract UTM params from first page URL
      let utmSource: string | null = null;
      let utmMedium: string | null = null;
      let utmCampaign: string | null = null;

      try {
        const url = new URL(session.first_page);
        utmSource = url.searchParams.get("utm_source");
        utmMedium = url.searchParams.get("utm_medium");
        utmCampaign = url.searchParams.get("utm_campaign");

        // Try to detect source from gclid (Google Ads)
        if (url.searchParams.get("gclid")) {
          utmSource = utmSource || "google";
          utmMedium = utmMedium || "cpc";
        }
      } catch {
        // URL parsing failed, continue without UTM
      }

      // Detect device type from user agent (we don't have this in pageviews, default to desktop)
      const deviceType = "desktop";

      // Extract path from first_page
      let firstPagePath = session.first_page;
      try {
        firstPagePath = new URL(session.first_page).pathname;
      } catch {
        // Keep original
      }

      // Insert session
      await pool.query(`
        INSERT INTO analytics_sessions (
          session_id, first_page, entry_referrer, utm_source, utm_medium,
          utm_campaign, device_type, country, started_at, last_activity_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (session_id) DO NOTHING
      `, [
        session.session_id,
        firstPagePath,
        session.referrer,
        utmSource,
        utmMedium,
        utmCampaign,
        deviceType,
        session.country,
        session.started_at,
        session.last_activity,
      ]);
      sessionsCreated++;

      // Step 3: Create journey events from pageviews for this session
      const pageviews = await pool.query<{
        href: string;
        timestamp: Date;
      }>(`
        SELECT href, timestamp
        FROM analytics_pageviews
        WHERE session_id = $1
        ORDER BY timestamp ASC
      `, [session.session_id]);

      let stepNumber = 1;

      // First event: session start
      await pool.query(`
        INSERT INTO analytics_user_journeys (
          session_id, step_number, event_type, page_path, event_name, timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT DO NOTHING
      `, [
        session.session_id,
        stepNumber++,
        "session",
        firstPagePath,
        "session_start",
        session.started_at,
      ]);
      journeysCreated++;

      // Page view events
      for (const pv of pageviews.rows) {
        let pagePath = pv.href;
        try {
          pagePath = new URL(pv.href).pathname;
        } catch {
          // Keep original
        }

        await pool.query(`
          INSERT INTO analytics_user_journeys (
            session_id, step_number, event_type, page_path, event_name, timestamp
          ) VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT DO NOTHING
        `, [
          session.session_id,
          stepNumber++,
          "pageview",
          pagePath,
          "page_view",
          pv.timestamp,
        ]);
        journeysCreated++;
      }

      if (sessionsCreated % 10 === 0) {
        console.log(`  Processed ${sessionsCreated} sessions...`);
      }
    } catch (error) {
      console.error(`Error processing session ${session.session_id}:`, error);
    }
  }

  console.log(`\nBackfill complete!`);
  console.log(`  Sessions created: ${sessionsCreated}`);
  console.log(`  Journey events created: ${journeysCreated}`);

  // Show summary of data
  const summary = await pool.query(`
    SELECT
      COUNT(DISTINCT s.session_id) as total_sessions,
      MIN(s.started_at) as earliest,
      MAX(s.started_at) as latest,
      COUNT(*) FILTER (WHERE s.started_at >= NOW() - INTERVAL '24 hours') as last_24h,
      COUNT(*) FILTER (WHERE s.started_at >= NOW() - INTERVAL '7 days') as last_7d
    FROM analytics_sessions s
  `);
  console.log("\nCurrent session data:");
  console.log(summary.rows[0]);

  await pool.end();
}

backfillSessions().catch(console.error);
