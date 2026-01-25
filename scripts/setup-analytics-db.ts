/**
 * Setup analytics tables in Neon PostgreSQL
 * Run with: npx tsx scripts/setup-analytics-db.ts
 */

import { Pool } from "pg";

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  console.log("Connecting to database...");
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Creating analytics tables...\n");

    // Create pageviews table
    await pool.query(`
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
      )
    `);
    console.log("✓ Created analytics_pageviews table");

    // Create web vitals table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_web_vitals (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        href TEXT NOT NULL,
        metric_name VARCHAR(10) NOT NULL,
        metric_value DECIMAL(10, 4) NOT NULL,
        metric_rating VARCHAR(20) NOT NULL,
        speed VARCHAR(10),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✓ Created analytics_web_vitals table");

    // Create events table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id SERIAL PRIMARY KEY,
        timestamp TIMESTAMPTZ NOT NULL,
        session_id VARCHAR(255) NOT NULL,
        href TEXT NOT NULL,
        event_name VARCHAR(255) NOT NULL,
        event_data JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✓ Created analytics_events table");

    // Create indexes
    console.log("\nCreating indexes...");

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pageviews_timestamp ON analytics_pageviews(timestamp)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pageviews_href ON analytics_pageviews(href)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pageviews_session ON analytics_pageviews(session_id)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_pageviews_country ON analytics_pageviews(country)`);
    console.log("✓ Pageviews indexes");

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_timestamp ON analytics_web_vitals(timestamp)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_metric ON analytics_web_vitals(metric_name)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_web_vitals_rating ON analytics_web_vitals(metric_rating)`);
    console.log("✓ Web vitals indexes");

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_timestamp ON analytics_events(timestamp)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id)`);
    console.log("✓ Events indexes");

    // Verify tables
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name LIKE 'analytics_%'
      ORDER BY table_name
    `);

    console.log("\n✅ Setup complete! Tables created:");
    result.rows.forEach((row) => console.log("  •", row.table_name));

  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
