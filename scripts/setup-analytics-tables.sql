-- Vercel Analytics Drain Database Schema
-- Run this in your Neon PostgreSQL console

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
