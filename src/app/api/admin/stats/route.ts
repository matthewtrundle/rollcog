/**
 * @fileoverview Admin dashboard stats API
 * @module app/api/admin/stats/route
 *
 * Aggregates data from leads table and analytics tables for dashboard.
 */

import { NextResponse } from "next/server";
import { query, getLeadStats } from "@/lib/db";

interface TrafficDataPoint {
  date: string;
  pageviews: number;
  sessions: number;
}

interface WebVital {
  name: "LCP" | "FID" | "CLS" | "TTFB" | "INP" | "FCP";
  value: number;
  rating: "good" | "needs-improvement" | "poor";
}

interface TopPage {
  path: string;
  pageviews: number;
  percentage: number;
}

interface CountryTraffic {
  country: string;
  pageviews: number;
  percentage: number;
}

interface RecentLead {
  id: number;
  name: string;
  email: string;
  service: string | null;
  created_at: string;
}

interface DashboardStats {
  leads: {
    total: number;
    thisWeek: number;
    byStatus: Record<string, number>;
    bySource: Record<string, number>;
  };
  traffic: {
    pageviews: number;
    pageviewsChange: number;
    sessions: number;
    sessionsChange: number;
    avgLcp: number;
    lcpRating: "good" | "needs-improvement" | "poor";
  };
  trafficOverTime: TrafficDataPoint[];
  webVitals: WebVital[];
  topPages: TopPage[];
  recentLeads: RecentLead[];
  countriesTraffic: CountryTraffic[];
}

/**
 * Calculate percentage change between two values
 */
function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

/**
 * Determine LCP rating based on value in ms
 */
function getLcpRating(value: number): "good" | "needs-improvement" | "poor" {
  if (value <= 2500) return "good";
  if (value <= 4000) return "needs-improvement";
  return "poor";
}

/**
 * GET /api/admin/stats - Get dashboard statistics
 */
export async function GET(): Promise<NextResponse> {
  try {
    // Get lead statistics
    const leadStats = await getLeadStats();

    // Get pageviews for last 30 days
    const pageviewsResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'`
    );
    const pageviews = parseInt(pageviewsResult.rows[0]?.count || "0", 10);

    // Get pageviews for previous 30 days (for comparison)
    const prevPageviewsResult = await query<{ count: string }>(
      `SELECT COUNT(*) as count FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '60 days'
         AND timestamp < NOW() - INTERVAL '30 days'`
    );
    const prevPageviews = parseInt(prevPageviewsResult.rows[0]?.count || "0", 10);

    // Get unique sessions for last 30 days
    const sessionsResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id) as count FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'`
    );
    const sessions = parseInt(sessionsResult.rows[0]?.count || "0", 10);

    // Get previous sessions for comparison
    const prevSessionsResult = await query<{ count: string }>(
      `SELECT COUNT(DISTINCT session_id) as count FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '60 days'
         AND timestamp < NOW() - INTERVAL '30 days'`
    );
    const prevSessions = parseInt(prevSessionsResult.rows[0]?.count || "0", 10);

    // Get average LCP
    const lcpResult = await query<{ avg: string }>(
      `SELECT AVG(metric_value) as avg FROM analytics_web_vitals
       WHERE metric_name = 'LCP'
         AND timestamp >= NOW() - INTERVAL '30 days'`
    );
    const avgLcp = parseFloat(lcpResult.rows[0]?.avg || "0");

    // Get traffic over time (last 30 days)
    const trafficResult = await query<{ date: string; pageviews: string; sessions: string }>(
      `SELECT
         DATE(timestamp) as date,
         COUNT(*) as pageviews,
         COUNT(DISTINCT session_id) as sessions
       FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(timestamp)
       ORDER BY date ASC`
    );
    const trafficOverTime: TrafficDataPoint[] = trafficResult.rows.map((row) => ({
      date: row.date,
      pageviews: parseInt(row.pageviews, 10),
      sessions: parseInt(row.sessions, 10),
    }));

    // Get web vitals averages
    const vitalsResult = await query<{ metric_name: string; avg_value: string; rating: string }>(
      `SELECT
         metric_name,
         AVG(metric_value) as avg_value,
         MODE() WITHIN GROUP (ORDER BY metric_rating) as rating
       FROM analytics_web_vitals
       WHERE timestamp >= NOW() - INTERVAL '30 days'
       GROUP BY metric_name`
    );
    const webVitals: WebVital[] = vitalsResult.rows.map((row) => ({
      name: row.metric_name as WebVital["name"],
      value: parseFloat(row.avg_value),
      rating: row.rating as WebVital["rating"],
    }));

    // Get top pages
    const topPagesResult = await query<{ href: string; count: string }>(
      `SELECT href, COUNT(*) as count
       FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'
       GROUP BY href
       ORDER BY count DESC
       LIMIT 10`
    );
    const totalTopPageviews = topPagesResult.rows.reduce(
      (sum, row) => sum + parseInt(row.count, 10),
      0
    );
    const topPages: TopPage[] = topPagesResult.rows.map((row) => {
      const url = new URL(row.href, "https://rollcog.com");
      return {
        path: url.pathname,
        pageviews: parseInt(row.count, 10),
        percentage: Math.round((parseInt(row.count, 10) / totalTopPageviews) * 100),
      };
    });

    // Get recent leads
    const recentLeadsResult = await query<{
      id: number;
      name: string;
      email: string;
      service: string | null;
      created_at: Date;
    }>(
      `SELECT id, name, email, service, created_at
       FROM leads
       ORDER BY created_at DESC
       LIMIT 5`
    );
    const recentLeads: RecentLead[] = recentLeadsResult.rows.map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      service: row.service,
      created_at: row.created_at.toISOString(),
    }));

    // Get traffic by country
    const countryResult = await query<{ country: string; count: string }>(
      `SELECT COALESCE(country, 'Unknown') as country, COUNT(*) as count
       FROM analytics_pageviews
       WHERE timestamp >= NOW() - INTERVAL '30 days'
       GROUP BY country
       ORDER BY count DESC
       LIMIT 10`
    );
    const totalCountryPageviews = countryResult.rows.reduce(
      (sum, row) => sum + parseInt(row.count, 10),
      0
    );
    const countriesTraffic: CountryTraffic[] = countryResult.rows.map((row) => ({
      country: row.country,
      pageviews: parseInt(row.count, 10),
      percentage: Math.round((parseInt(row.count, 10) / totalCountryPageviews) * 100),
    }));

    const stats: DashboardStats = {
      leads: leadStats,
      traffic: {
        pageviews,
        pageviewsChange: calculateChange(pageviews, prevPageviews),
        sessions,
        sessionsChange: calculateChange(sessions, prevSessions),
        avgLcp,
        lcpRating: getLcpRating(avgLcp),
      },
      trafficOverTime,
      webVitals,
      topPages,
      recentLeads,
      countriesTraffic,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
