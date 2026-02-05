/**
 * @fileoverview Data extraction layer for analytics intelligence
 * @module lib/analytics/data-extraction
 *
 * Pulls comprehensive raw data from existing PostgreSQL tables for analysis.
 * Queries analytics_sessions, analytics_user_journeys, analytics_pageviews, and analytics_events.
 */

import { query } from "@/lib/db";

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface JourneyStep {
  step: number;
  type: string;
  name: string | null;
  page: string | null;
  data: Record<string, unknown>;
  ts: Date;
}

export interface SessionWithJourney {
  id: number;
  session_id: string;
  first_page: string | null;
  entry_referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  device_type: string | null;
  country: string | null;
  started_at: Date;
  last_activity_at: Date;
  journey: JourneyStep[];
  has_conversion: boolean;
  conversion_type: string | null;
  page_count: number;
  event_count: number;
}

export interface JourneyEvent {
  id: number;
  session_id: string;
  step_number: number;
  event_type: string;
  page_path: string | null;
  event_name: string | null;
  event_data: Record<string, unknown>;
  timestamp: Date;
}

export interface ConversionEvent {
  session_id: string;
  event_name: string;
  event_data: Record<string, unknown>;
  timestamp: Date;
  utm_source: string | null;
  utm_campaign: string | null;
  device_type: string | null;
  first_page: string | null;
}

export interface BaselineMetrics {
  avg_daily_sessions: number;
  avg_daily_conversions: number;
  avg_conversion_rate: number;
  avg_pages_per_session: number;
  total_sessions: number;
  total_conversions: number;
  daily_data: Array<{
    date: string;
    sessions: number;
    conversions: number;
    conversion_rate: number;
  }>;
}

export interface PageViewData {
  href: string;
  views: number;
  unique_sessions: number;
  countries: string[];
}

export interface TrafficSourceData {
  source: string;
  medium: string;
  campaign: string;
  sessions: number;
  conversions: number;
  conversion_rate: number;
}

export interface DailyRawData {
  // All sessions from last 24h with full context
  sessions: SessionWithJourney[];

  // Comparison data
  yesterdayData: SessionWithJourney[];
  weekAgoData: SessionWithJourney[];
  monthBaseline: BaselineMetrics;

  // Event streams
  allEvents: JourneyEvent[];
  conversions: ConversionEvent[];

  // Page and traffic data
  topPages: PageViewData[];
  trafficSources: TrafficSourceData[];

  // Metadata
  extractedAt: Date;
  periodStart: Date;
  periodEnd: Date;
}

// =============================================================================
// DATA EXTRACTION FUNCTIONS
// =============================================================================

/**
 * Extract sessions with full journey data for a given time period
 */
export async function extractSessionsWithJourneys(
  startTime: Date,
  endTime: Date
): Promise<SessionWithJourney[]> {
  const result = await query<{
    id: number;
    session_id: string;
    first_page: string | null;
    entry_referrer: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    utm_term: string | null;
    utm_content: string | null;
    device_type: string | null;
    country: string | null;
    started_at: Date;
    last_activity_at: Date;
    journey: JourneyStep[] | null;
    has_conversion: boolean;
    conversion_type: string | null;
    page_count: number;
    event_count: number;
  }>(
    `
    SELECT
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'step', j.step_number,
            'type', j.event_type,
            'name', j.event_name,
            'page', j.page_path,
            'data', j.event_data,
            'ts', j.timestamp
          ) ORDER BY j.step_number
        ) FILTER (WHERE j.id IS NOT NULL),
        '[]'::json
      ) as journey,
      EXISTS(
        SELECT 1 FROM analytics_user_journeys j2
        WHERE j2.session_id = s.session_id
        AND j2.event_name IN ('form_submit', 'phone_click')
      ) as has_conversion,
      (
        SELECT j3.event_name FROM analytics_user_journeys j3
        WHERE j3.session_id = s.session_id
        AND j3.event_name IN ('form_submit', 'phone_click')
        ORDER BY j3.timestamp DESC
        LIMIT 1
      ) as conversion_type,
      (
        SELECT COUNT(DISTINCT j4.page_path) FROM analytics_user_journeys j4
        WHERE j4.session_id = s.session_id AND j4.page_path IS NOT NULL
      )::int as page_count,
      (
        SELECT COUNT(*) FROM analytics_user_journeys j5
        WHERE j5.session_id = s.session_id
      )::int as event_count
    FROM analytics_sessions s
    LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
    WHERE s.started_at >= $1 AND s.started_at < $2
    GROUP BY s.id
    ORDER BY s.started_at DESC
    `,
    [startTime, endTime]
  );

  return result.rows.map((row) => ({
    ...row,
    journey: row.journey || [],
  }));
}

/**
 * Extract all journey events for a time period
 */
export async function extractJourneyEvents(
  startTime: Date,
  endTime: Date
): Promise<JourneyEvent[]> {
  const result = await query<JourneyEvent>(
    `
    SELECT *
    FROM analytics_user_journeys
    WHERE timestamp >= $1 AND timestamp < $2
    ORDER BY timestamp DESC
    `,
    [startTime, endTime]
  );

  return result.rows;
}

/**
 * Extract conversion events with session context
 */
export async function extractConversions(
  startTime: Date,
  endTime: Date
): Promise<ConversionEvent[]> {
  const result = await query<ConversionEvent>(
    `
    SELECT
      j.session_id,
      j.event_name,
      j.event_data,
      j.timestamp,
      s.utm_source,
      s.utm_campaign,
      s.device_type,
      s.first_page
    FROM analytics_user_journeys j
    INNER JOIN analytics_sessions s ON j.session_id = s.session_id
    WHERE j.timestamp >= $1 AND j.timestamp < $2
    AND j.event_name IN ('form_submit', 'phone_click')
    ORDER BY j.timestamp DESC
    `,
    [startTime, endTime]
  );

  return result.rows;
}

/**
 * Extract baseline metrics for comparison (last 30 days)
 */
export async function extractBaselineMetrics(
  beforeDate: Date
): Promise<BaselineMetrics> {
  const thirtyDaysAgo = new Date(beforeDate);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const result = await query<{
    date: Date;
    sessions: string;
    conversions: string;
  }>(
    `
    SELECT
      DATE(s.started_at) as date,
      COUNT(DISTINCT s.session_id)::text as sessions,
      COUNT(DISTINCT CASE
        WHEN j.event_name IN ('form_submit', 'phone_click')
        THEN s.session_id
      END)::text as conversions
    FROM analytics_sessions s
    LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
    WHERE s.started_at >= $1 AND s.started_at < $2
    GROUP BY DATE(s.started_at)
    ORDER BY date ASC
    `,
    [thirtyDaysAgo, beforeDate]
  );

  const dailyData = result.rows.map((row) => {
    const sessions = parseInt(row.sessions, 10);
    const conversions = parseInt(row.conversions, 10);
    return {
      date: row.date.toISOString().split("T")[0],
      sessions,
      conversions,
      conversion_rate: sessions > 0 ? (conversions / sessions) * 100 : 0,
    };
  });

  const totalSessions = dailyData.reduce((sum, day) => sum + day.sessions, 0);
  const totalConversions = dailyData.reduce(
    (sum, day) => sum + day.conversions,
    0
  );
  const daysWithData = dailyData.length || 1;

  return {
    avg_daily_sessions: totalSessions / daysWithData,
    avg_daily_conversions: totalConversions / daysWithData,
    avg_conversion_rate:
      totalSessions > 0 ? (totalConversions / totalSessions) * 100 : 0,
    avg_pages_per_session: 0, // Will be calculated separately if needed
    total_sessions: totalSessions,
    total_conversions: totalConversions,
    daily_data: dailyData,
  };
}

/**
 * Extract top pages by views for a time period
 */
export async function extractTopPages(
  startTime: Date,
  endTime: Date,
  limit: number = 20
): Promise<PageViewData[]> {
  const result = await query<{
    href: string;
    views: string;
    unique_sessions: string;
    countries: string[];
  }>(
    `
    SELECT
      href,
      COUNT(*)::text as views,
      COUNT(DISTINCT session_id)::text as unique_sessions,
      ARRAY_AGG(DISTINCT country) FILTER (WHERE country IS NOT NULL) as countries
    FROM analytics_pageviews
    WHERE timestamp >= $1 AND timestamp < $2
    GROUP BY href
    ORDER BY COUNT(*) DESC
    LIMIT $3
    `,
    [startTime, endTime, limit]
  );

  return result.rows.map((row) => ({
    href: row.href,
    views: parseInt(row.views, 10),
    unique_sessions: parseInt(row.unique_sessions, 10),
    countries: row.countries || [],
  }));
}

/**
 * Extract traffic source performance data
 */
export async function extractTrafficSources(
  startTime: Date,
  endTime: Date
): Promise<TrafficSourceData[]> {
  const result = await query<{
    source: string;
    medium: string;
    campaign: string;
    sessions: string;
    conversions: string;
    conversion_rate: string;
  }>(
    `
    SELECT
      COALESCE(s.utm_source, 'direct') as source,
      COALESCE(s.utm_medium, 'none') as medium,
      COALESCE(s.utm_campaign, 'none') as campaign,
      COUNT(DISTINCT s.session_id)::text as sessions,
      COUNT(DISTINCT CASE
        WHEN j.event_name IN ('form_submit', 'phone_click')
        THEN s.session_id
      END)::text as conversions,
      ROUND(
        100.0 * COUNT(DISTINCT CASE
          WHEN j.event_name IN ('form_submit', 'phone_click')
          THEN s.session_id
        END) /
        NULLIF(COUNT(DISTINCT s.session_id), 0), 2
      )::text as conversion_rate
    FROM analytics_sessions s
    LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
    WHERE s.started_at >= $1 AND s.started_at < $2
    GROUP BY s.utm_source, s.utm_medium, s.utm_campaign
    ORDER BY COUNT(DISTINCT s.session_id) DESC
    `,
    [startTime, endTime]
  );

  return result.rows.map((row) => ({
    source: row.source,
    medium: row.medium,
    campaign: row.campaign,
    sessions: parseInt(row.sessions, 10),
    conversions: parseInt(row.conversions, 10),
    conversion_rate: parseFloat(row.conversion_rate) || 0,
  }));
}

/**
 * Get date ranges for today, yesterday, and a week ago
 */
export function getAnalysisPeriods(referenceDate: Date = new Date()): {
  today: { start: Date; end: Date };
  yesterday: { start: Date; end: Date };
  weekAgo: { start: Date; end: Date };
} {
  // Today: from midnight to now
  const todayStart = new Date(referenceDate);
  todayStart.setHours(0, 0, 0, 0);

  const todayEnd = new Date(referenceDate);

  // Yesterday: full 24 hours
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);

  const yesterdayEnd = new Date(todayStart);

  // Week ago: same time period as today but 7 days earlier
  const weekAgoStart = new Date(todayStart);
  weekAgoStart.setDate(weekAgoStart.getDate() - 7);

  const weekAgoEnd = new Date(todayEnd);
  weekAgoEnd.setDate(weekAgoEnd.getDate() - 7);

  return {
    today: { start: todayStart, end: todayEnd },
    yesterday: { start: yesterdayStart, end: yesterdayEnd },
    weekAgo: { start: weekAgoStart, end: weekAgoEnd },
  };
}

/**
 * Main function to extract all raw data for daily intelligence report
 */
export async function extractDailyRawData(
  referenceDate: Date = new Date()
): Promise<DailyRawData> {
  const periods = getAnalysisPeriods(referenceDate);

  // Execute all queries in parallel for performance
  const [
    todaySessions,
    yesterdaySessions,
    weekAgoSessions,
    monthBaseline,
    todayEvents,
    todayConversions,
    topPages,
    trafficSources,
  ] = await Promise.all([
    extractSessionsWithJourneys(periods.today.start, periods.today.end),
    extractSessionsWithJourneys(periods.yesterday.start, periods.yesterday.end),
    extractSessionsWithJourneys(periods.weekAgo.start, periods.weekAgo.end),
    extractBaselineMetrics(periods.today.start),
    extractJourneyEvents(periods.today.start, periods.today.end),
    extractConversions(periods.today.start, periods.today.end),
    extractTopPages(periods.today.start, periods.today.end),
    extractTrafficSources(periods.today.start, periods.today.end),
  ]);

  return {
    sessions: todaySessions,
    yesterdayData: yesterdaySessions,
    weekAgoData: weekAgoSessions,
    monthBaseline,
    allEvents: todayEvents,
    conversions: todayConversions,
    topPages,
    trafficSources,
    extractedAt: new Date(),
    periodStart: periods.today.start,
    periodEnd: periods.today.end,
  };
}

/**
 * Lightweight extraction for testing/preview
 */
export async function extractPreviewData(): Promise<{
  sessionCount: number;
  conversionCount: number;
  topSources: string[];
}> {
  const periods = getAnalysisPeriods();

  const [sessionResult, conversionResult, sourceResult] = await Promise.all([
    query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM analytics_sessions WHERE started_at >= $1`,
      [periods.today.start]
    ),
    query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM analytics_user_journeys
       WHERE timestamp >= $1 AND event_name IN ('form_submit', 'phone_click')`,
      [periods.today.start]
    ),
    query<{ source: string }>(
      `SELECT COALESCE(utm_source, 'direct') as source FROM analytics_sessions
       WHERE started_at >= $1 GROUP BY utm_source ORDER BY COUNT(*) DESC LIMIT 3`,
      [periods.today.start]
    ),
  ]);

  return {
    sessionCount: parseInt(sessionResult.rows[0]?.count || "0", 10),
    conversionCount: parseInt(conversionResult.rows[0]?.count || "0", 10),
    topSources: sourceResult.rows.map((r) => r.source),
  };
}
