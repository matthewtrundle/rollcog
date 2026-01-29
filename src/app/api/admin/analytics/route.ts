/**
 * @fileoverview Admin analytics API
 * @module app/api/admin/analytics/route
 *
 * Detailed analytics data for the analytics page.
 */

import { NextResponse } from "next/server";
import { query } from "@/lib/db";

interface WebVital {
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  samples: number;
}

interface PageStats {
  path: string;
  pageviews: number;
  uniqueVisitors: number;
  avgTimeOnPage: number | null;
}

interface TrafficSource {
  referrer: string;
  visits: number;
  percentage: number;
}

interface DailyTraffic {
  date: string;
  pageviews: number;
  sessions: number;
}

interface JourneyStep {
  step_number: number;
  event_type: string;
  event_name: string;
  page_path: string;
}

interface UserJourney {
  session_id: string;
  utm_source: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  started_at: string;
  steps: JourneyStep[];
  converted: boolean;
}

interface ConversionPath {
  path: string;
  occurrences: number;
}

interface UTMAttribution {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  conversions: number;
  conversion_rate: number;
}

interface AnalyticsResponse {
  webVitals: WebVital[];
  pageStats: PageStats[];
  trafficSources: TrafficSource[];
  dailyTraffic: DailyTraffic[];
  countryBreakdown: Array<{ country: string; visits: number; percentage: number }>;
  deviceBreakdown: Array<{ device: string; visits: number; percentage: number }>;
  summary: {
    totalPageviews: number;
    uniqueSessions: number;
    bounceRate: number;
    avgSessionDuration: number | null;
  };
  userJourneys?: UserJourney[];
  conversionPaths?: ConversionPath[];
  utmAttribution?: UTMAttribution[];
}

/**
 * GET /api/admin/analytics - Get detailed analytics data
 */
export async function GET(request: Request): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get("days") || "30", 10);
    const intervalClause = `NOW() - INTERVAL '${days} days'`;

    // Get web vitals with samples count
    const vitalsResult = await query<{
      metric_name: string;
      avg_value: string;
      rating: string;
      samples: string;
    }>(
      `SELECT
         metric_name,
         AVG(metric_value) as avg_value,
         MODE() WITHIN GROUP (ORDER BY metric_rating) as rating,
         COUNT(*) as samples
       FROM analytics_web_vitals
       WHERE timestamp >= ${intervalClause}
       GROUP BY metric_name`
    );
    const webVitals: WebVital[] = vitalsResult.rows.map((row) => ({
      name: row.metric_name,
      value: parseFloat(row.avg_value),
      rating: row.rating as WebVital["rating"],
      samples: parseInt(row.samples, 10),
    }));

    // Get page stats
    const pageStatsResult = await query<{
      href: string;
      pageviews: string;
      unique_visitors: string;
    }>(
      `SELECT
         href,
         COUNT(*) as pageviews,
         COUNT(DISTINCT session_id) as unique_visitors
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}
       GROUP BY href
       ORDER BY pageviews DESC
       LIMIT 20`
    );
    const pageStats: PageStats[] = pageStatsResult.rows.map((row) => {
      let path = "/";
      try {
        const url = new URL(row.href, "https://rollcogroofing.com");
        path = url.pathname;
      } catch {
        path = row.href;
      }
      return {
        path,
        pageviews: parseInt(row.pageviews, 10),
        uniqueVisitors: parseInt(row.unique_visitors, 10),
        avgTimeOnPage: null, // Would need additional tracking
      };
    });

    // Get traffic sources (referrers)
    const referrerResult = await query<{ referrer: string; visits: string }>(
      `SELECT
         COALESCE(referrer, 'Direct') as referrer,
         COUNT(*) as visits
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}
       GROUP BY referrer
       ORDER BY visits DESC
       LIMIT 10`
    );
    const totalReferrerVisits = referrerResult.rows.reduce(
      (sum, row) => sum + parseInt(row.visits, 10),
      0
    );
    const trafficSources: TrafficSource[] = referrerResult.rows.map((row) => {
      let source = row.referrer;
      if (source !== "Direct") {
        try {
          const url = new URL(source);
          source = url.hostname;
        } catch {
          // Keep original
        }
      }
      return {
        referrer: source,
        visits: parseInt(row.visits, 10),
        percentage: Math.round((parseInt(row.visits, 10) / totalReferrerVisits) * 100),
      };
    });

    // Get daily traffic
    const dailyResult = await query<{
      date: string;
      pageviews: string;
      sessions: string;
    }>(
      `SELECT
         DATE(timestamp) as date,
         COUNT(*) as pageviews,
         COUNT(DISTINCT session_id) as sessions
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`
    );
    const dailyTraffic: DailyTraffic[] = dailyResult.rows.map((row) => ({
      date: row.date,
      pageviews: parseInt(row.pageviews, 10),
      sessions: parseInt(row.sessions, 10),
    }));

    // Get country breakdown
    const countryResult = await query<{ country: string; visits: string }>(
      `SELECT
         COALESCE(country, 'Unknown') as country,
         COUNT(*) as visits
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}
       GROUP BY country
       ORDER BY visits DESC
       LIMIT 10`
    );
    const totalCountryVisits = countryResult.rows.reduce(
      (sum, row) => sum + parseInt(row.visits, 10),
      0
    );
    const countryBreakdown = countryResult.rows.map((row) => ({
      country: row.country,
      visits: parseInt(row.visits, 10),
      percentage: Math.round((parseInt(row.visits, 10) / totalCountryVisits) * 100),
    }));

    // Get device breakdown from user agent
    const deviceResult = await query<{ device: string; visits: string }>(
      `SELECT
         CASE
           WHEN user_agent ILIKE '%mobile%' OR user_agent ILIKE '%android%' OR user_agent ILIKE '%iphone%' THEN 'Mobile'
           WHEN user_agent ILIKE '%tablet%' OR user_agent ILIKE '%ipad%' THEN 'Tablet'
           ELSE 'Desktop'
         END as device,
         COUNT(*) as visits
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}
       GROUP BY device
       ORDER BY visits DESC`
    );
    const totalDeviceVisits = deviceResult.rows.reduce(
      (sum, row) => sum + parseInt(row.visits, 10),
      0
    );
    const deviceBreakdown = deviceResult.rows.map((row) => ({
      device: row.device,
      visits: parseInt(row.visits, 10),
      percentage: Math.round((parseInt(row.visits, 10) / totalDeviceVisits) * 100),
    }));

    // Get summary stats
    const summaryResult = await query<{
      total_pageviews: string;
      unique_sessions: string;
    }>(
      `SELECT
         COUNT(*) as total_pageviews,
         COUNT(DISTINCT session_id) as unique_sessions
       FROM analytics_pageviews
       WHERE timestamp >= ${intervalClause}`
    );

    // Calculate bounce rate (sessions with only 1 pageview)
    const bounceResult = await query<{ bounced: string; total: string }>(
      `WITH session_pageviews AS (
         SELECT session_id, COUNT(*) as pageview_count
         FROM analytics_pageviews
         WHERE timestamp >= ${intervalClause}
         GROUP BY session_id
       )
       SELECT
         SUM(CASE WHEN pageview_count = 1 THEN 1 ELSE 0 END) as bounced,
         COUNT(*) as total
       FROM session_pageviews`
    );
    const bounced = parseInt(bounceResult.rows[0]?.bounced || "0", 10);
    const totalSessions = parseInt(bounceResult.rows[0]?.total || "1", 10);
    const bounceRate = Math.round((bounced / totalSessions) * 100);

    // Get recent user journeys (last 10 sessions with activity)
    let userJourneys: UserJourney[] = [];
    let conversionPaths: ConversionPath[] = [];
    let utmAttribution: UTMAttribution[] = [];

    try {
      // Get sessions with their journeys
      const journeySessionsResult = await query<{
        session_id: string;
        utm_source: string | null;
        utm_campaign: string | null;
        device_type: string | null;
        started_at: string;
      }>(
        `SELECT s.session_id, s.utm_source, s.utm_campaign, s.device_type, s.started_at
         FROM analytics_sessions s
         WHERE s.started_at >= ${intervalClause}
         ORDER BY s.started_at DESC
         LIMIT 10`
      );

      // Get journey steps for these sessions
      const sessionIds = journeySessionsResult.rows.map(r => r.session_id);
      if (sessionIds.length > 0) {
        const journeyStepsResult = await query<{
          session_id: string;
          step_number: string;
          event_type: string;
          event_name: string;
          page_path: string;
        }>(
          `SELECT session_id, step_number, event_type, event_name, page_path
           FROM analytics_user_journeys
           WHERE session_id = ANY($1)
           ORDER BY session_id, step_number`,
          [sessionIds]
        );

        // Check for conversions
        const conversionSessionsResult = await query<{ session_id: string }>(
          `SELECT DISTINCT session_id
           FROM analytics_user_journeys
           WHERE session_id = ANY($1)
             AND event_name IN ('form_submit', 'phone_click')`,
          [sessionIds]
        );
        const convertedSessions = new Set(conversionSessionsResult.rows.map(r => r.session_id));

        // Group steps by session
        const stepsBySession = new Map<string, JourneyStep[]>();
        journeyStepsResult.rows.forEach(row => {
          const steps = stepsBySession.get(row.session_id) || [];
          steps.push({
            step_number: parseInt(row.step_number, 10),
            event_type: row.event_type,
            event_name: row.event_name,
            page_path: row.page_path || "/",
          });
          stepsBySession.set(row.session_id, steps);
        });

        userJourneys = journeySessionsResult.rows.map(session => ({
          session_id: session.session_id,
          utm_source: session.utm_source,
          utm_campaign: session.utm_campaign,
          device_type: session.device_type,
          started_at: session.started_at,
          steps: stepsBySession.get(session.session_id) || [],
          converted: convertedSessions.has(session.session_id),
        }));
      }

      // Get common conversion paths
      const conversionPathsResult = await query<{ path: string; occurrences: string }>(
        `WITH conversion_sessions AS (
           SELECT DISTINCT session_id
           FROM analytics_user_journeys
           WHERE event_name IN ('form_submit', 'phone_click')
             AND timestamp >= ${intervalClause}
         ),
         session_paths AS (
           SELECT
             j.session_id,
             STRING_AGG(
               COALESCE(j.event_name, 'unknown'),
               ' -> ' ORDER BY j.step_number
             ) as path
           FROM analytics_user_journeys j
           INNER JOIN conversion_sessions cs ON j.session_id = cs.session_id
           WHERE j.timestamp >= ${intervalClause}
           GROUP BY j.session_id
         )
         SELECT path, COUNT(*) as occurrences
         FROM session_paths
         GROUP BY path
         ORDER BY occurrences DESC
         LIMIT 10`
      );
      conversionPaths = conversionPathsResult.rows.map(row => ({
        path: row.path,
        occurrences: parseInt(row.occurrences, 10),
      }));

      // Get UTM attribution
      const utmResult = await query<{
        source: string;
        medium: string;
        campaign: string;
        sessions: string;
        conversions: string;
      }>(
        `SELECT
           COALESCE(s.utm_source, 'direct') as source,
           COALESCE(s.utm_medium, 'none') as medium,
           COALESCE(s.utm_campaign, 'none') as campaign,
           COUNT(DISTINCT s.session_id) as sessions,
           COUNT(DISTINCT CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN s.session_id END) as conversions
         FROM analytics_sessions s
         LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
         WHERE s.started_at >= ${intervalClause}
         GROUP BY s.utm_source, s.utm_medium, s.utm_campaign
         ORDER BY sessions DESC
         LIMIT 10`
      );
      utmAttribution = utmResult.rows.map(row => ({
        source: row.source,
        medium: row.medium,
        campaign: row.campaign,
        sessions: parseInt(row.sessions, 10),
        conversions: parseInt(row.conversions, 10),
        conversion_rate: Math.round(
          (parseInt(row.conversions, 10) / Math.max(parseInt(row.sessions, 10), 1)) * 100
        ),
      }));
    } catch (journeyError) {
      // Journey tables might not exist yet - silently continue
      console.warn("Journey queries failed (tables may not exist):", journeyError);
    }

    const response: AnalyticsResponse = {
      webVitals,
      pageStats,
      trafficSources,
      dailyTraffic,
      countryBreakdown,
      deviceBreakdown,
      summary: {
        totalPageviews: parseInt(summaryResult.rows[0]?.total_pageviews || "0", 10),
        uniqueSessions: parseInt(summaryResult.rows[0]?.unique_sessions || "0", 10),
        bounceRate,
        avgSessionDuration: null,
      },
      userJourneys,
      conversionPaths,
      utmAttribution,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Analytics API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
