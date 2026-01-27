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
