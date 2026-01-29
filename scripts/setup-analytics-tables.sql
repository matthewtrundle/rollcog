-- Vercel Analytics Drain Database Schema
-- Run this in your Neon PostgreSQL console

-- ============================================
-- CORE TABLES (Vercel Drain)
-- ============================================

-- Page Views table
CREATE TABLE IF NOT EXISTS analytics_pageviews (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  href TEXT NOT NULL,
  referrer TEXT,
  user_agent TEXT,
  country VARCHAR(10),
  region VARCHAR(100),
  city VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Web Vitals table (Core Web Vitals metrics)
CREATE TABLE IF NOT EXISTS analytics_web_vitals (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  href TEXT NOT NULL,
  metric_name VARCHAR(10) NOT NULL, -- CLS, FCP, FID, INP, LCP, TTFB
  metric_value DECIMAL(10, 4) NOT NULL,
  metric_rating VARCHAR(20) NOT NULL, -- good, needs-improvement, poor
  speed VARCHAR(10),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Custom Events table (for tracking conversions, clicks, etc.)
CREATE TABLE IF NOT EXISTS analytics_events (
  id SERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ NOT NULL,
  session_id VARCHAR(255) NOT NULL,
  href TEXT NOT NULL,
  event_name VARCHAR(255) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON analytics_pageviews(timestamp);
CREATE INDEX IF NOT EXISTS idx_pageviews_href ON analytics_pageviews(href);
CREATE INDEX IF NOT EXISTS idx_pageviews_session ON analytics_pageviews(session_id);
CREATE INDEX IF NOT EXISTS idx_pageviews_country ON analytics_pageviews(country);

CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON analytics_web_vitals(timestamp);
CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON analytics_web_vitals(metric_name);
CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON analytics_web_vitals(metric_rating);

CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);

-- Useful views for reporting

-- Daily pageviews summary
CREATE OR REPLACE VIEW daily_pageviews AS
SELECT
  DATE(timestamp) as date,
  COUNT(*) as total_views,
  COUNT(DISTINCT session_id) as unique_sessions,
  COUNT(DISTINCT href) as unique_pages
FROM analytics_pageviews
GROUP BY DATE(timestamp)
ORDER BY date DESC;

-- Top pages
CREATE OR REPLACE VIEW top_pages AS
SELECT
  href,
  COUNT(*) as views,
  COUNT(DISTINCT session_id) as unique_visitors
FROM analytics_pageviews
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY href
ORDER BY views DESC
LIMIT 50;

-- Web Vitals summary by page
CREATE OR REPLACE VIEW web_vitals_summary AS
SELECT
  href,
  metric_name,
  ROUND(AVG(metric_value)::numeric, 2) as avg_value,
  COUNT(*) as samples,
  ROUND(100.0 * SUM(CASE WHEN metric_rating = 'good' THEN 1 ELSE 0 END) / COUNT(*)::numeric, 1) as pct_good
FROM analytics_web_vitals
WHERE timestamp > NOW() - INTERVAL '30 days'
GROUP BY href, metric_name
ORDER BY href, metric_name;

-- Traffic by country
CREATE OR REPLACE VIEW traffic_by_country AS
SELECT
  country,
  COUNT(*) as pageviews,
  COUNT(DISTINCT session_id) as unique_sessions
FROM analytics_pageviews
WHERE timestamp > NOW() - INTERVAL '30 days'
  AND country IS NOT NULL
GROUP BY country
ORDER BY pageviews DESC;

-- Conversion events summary
CREATE OR REPLACE VIEW conversion_events AS
SELECT
  event_name,
  DATE(timestamp) as date,
  COUNT(*) as count
FROM analytics_events
WHERE event_name IN ('form_submit', 'phone_click', 'landing_page_conversion')
GROUP BY event_name, DATE(timestamp)
ORDER BY date DESC, event_name;

-- ============================================
-- USER JOURNEY TABLES (Custom Event Tracking)
-- ============================================

-- Session metadata (one row per visitor session)
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  first_page TEXT,
  entry_referrer TEXT,
  utm_source VARCHAR(255),
  utm_medium VARCHAR(255),
  utm_campaign VARCHAR(255),
  utm_term VARCHAR(255),
  utm_content VARCHAR(255),
  device_type VARCHAR(50),
  country VARCHAR(10),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ordered user journey steps
CREATE TABLE IF NOT EXISTS analytics_user_journeys (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  step_number INT NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  page_path TEXT,
  event_name VARCHAR(255),
  event_data JSONB DEFAULT '{}',
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for journey tables
CREATE INDEX IF NOT EXISTS idx_sessions_session_id ON analytics_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON analytics_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_source ON analytics_sessions(utm_source);
CREATE INDEX IF NOT EXISTS idx_sessions_utm_campaign ON analytics_sessions(utm_campaign);

CREATE INDEX IF NOT EXISTS idx_journeys_session_id ON analytics_user_journeys(session_id);
CREATE INDEX IF NOT EXISTS idx_journeys_timestamp ON analytics_user_journeys(timestamp);
CREATE INDEX IF NOT EXISTS idx_journeys_event_type ON analytics_user_journeys(event_type);
CREATE INDEX IF NOT EXISTS idx_journeys_event_name ON analytics_user_journeys(event_name);

-- ============================================
-- JOURNEY ANALYSIS VIEWS
-- ============================================

-- Session conversions view - shows which sessions had conversion events
CREATE OR REPLACE VIEW session_conversions AS
SELECT
  s.session_id,
  s.utm_source,
  s.utm_medium,
  s.utm_campaign,
  s.device_type,
  s.first_page,
  s.entry_referrer,
  s.started_at,
  MAX(CASE WHEN j.event_name = 'form_submit' THEN 1 ELSE 0 END) as has_form_submit,
  MAX(CASE WHEN j.event_name = 'phone_click' THEN 1 ELSE 0 END) as has_phone_click,
  MAX(CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN 1 ELSE 0 END) as is_conversion,
  COUNT(DISTINCT j.id) as total_events,
  MAX(j.timestamp) as last_event_at
FROM analytics_sessions s
LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
GROUP BY s.session_id, s.utm_source, s.utm_medium, s.utm_campaign,
         s.device_type, s.first_page, s.entry_referrer, s.started_at;

-- Conversion paths view - shows common paths to conversion
CREATE OR REPLACE VIEW conversion_paths AS
WITH conversion_sessions AS (
  SELECT DISTINCT session_id
  FROM analytics_user_journeys
  WHERE event_name IN ('form_submit', 'phone_click')
),
session_paths AS (
  SELECT
    j.session_id,
    STRING_AGG(
      CASE
        WHEN j.event_type = 'session' THEN 'START'
        WHEN j.event_type = 'engagement' THEN j.event_name
        WHEN j.event_type = 'conversion' THEN 'CONVERT'
        ELSE j.event_name
      END,
      ' -> ' ORDER BY j.step_number
    ) as path
  FROM analytics_user_journeys j
  INNER JOIN conversion_sessions cs ON j.session_id = cs.session_id
  GROUP BY j.session_id
)
SELECT
  path,
  COUNT(*) as occurrences
FROM session_paths
GROUP BY path
ORDER BY occurrences DESC
LIMIT 20;

-- UTM attribution summary
CREATE OR REPLACE VIEW utm_attribution AS
SELECT
  COALESCE(utm_source, 'direct') as source,
  COALESCE(utm_medium, 'none') as medium,
  COALESCE(utm_campaign, 'none') as campaign,
  COUNT(DISTINCT s.session_id) as sessions,
  SUM(CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN 1 ELSE 0 END) as conversions,
  ROUND(
    100.0 * SUM(CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN 1 ELSE 0 END) /
    NULLIF(COUNT(DISTINCT s.session_id), 0), 2
  ) as conversion_rate
FROM analytics_sessions s
LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
WHERE s.started_at > NOW() - INTERVAL '30 days'
GROUP BY s.utm_source, s.utm_medium, s.utm_campaign
ORDER BY sessions DESC;

-- Daily journey summary
CREATE OR REPLACE VIEW daily_journey_summary AS
SELECT
  DATE(s.started_at) as date,
  COUNT(DISTINCT s.session_id) as total_sessions,
  COUNT(DISTINCT CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN s.session_id END) as converting_sessions,
  COUNT(j.id) as total_events,
  ROUND(AVG(step_counts.steps), 1) as avg_steps_per_session
FROM analytics_sessions s
LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
LEFT JOIN (
  SELECT session_id, MAX(step_number) as steps
  FROM analytics_user_journeys
  GROUP BY session_id
) step_counts ON s.session_id = step_counts.session_id
WHERE s.started_at > NOW() - INTERVAL '30 days'
GROUP BY DATE(s.started_at)
ORDER BY date DESC;
