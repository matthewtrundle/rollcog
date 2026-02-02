/**
 * Generate user insights from analytics data
 */

import pg from 'pg';
const { Pool } = pg;

async function getInsights() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    console.log('\n========================================');
    console.log('       ROLLCOG USER INSIGHTS REPORT');
    console.log('========================================\n');

    // 1. Overview Stats
    console.log('📊 OVERVIEW');
    console.log('─'.repeat(40));
    const overview = await client.query(`
      SELECT
        (SELECT COUNT(DISTINCT session_id) FROM analytics_sessions) as total_sessions,
        (SELECT COUNT(*) FROM analytics_user_journeys) as total_events,
        (SELECT COUNT(*) FROM analytics_pageviews) as total_pageviews
    `);
    const stats = overview.rows[0];
    console.log(`Total Sessions: ${stats.total_sessions}`);
    console.log(`Total Events: ${stats.total_events}`);
    console.log(`Total Pageviews: ${stats.total_pageviews}`);

    // 2. Device Breakdown
    console.log('\n📱 DEVICE BREAKDOWN');
    console.log('─'.repeat(40));
    const devices = await client.query(`
      SELECT device_type, COUNT(*) as count
      FROM analytics_sessions
      WHERE device_type IS NOT NULL
      GROUP BY device_type
      ORDER BY count DESC
    `);
    devices.rows.forEach(row => {
      console.log(`${row.device_type}: ${row.count} sessions`);
    });

    // 3. Top Pages Visited
    console.log('\n📄 TOP PAGES');
    console.log('─'.repeat(40));
    const pages = await client.query(`
      SELECT page_path, COUNT(*) as views
      FROM analytics_user_journeys
      WHERE event_name = 'page_view'
      GROUP BY page_path
      ORDER BY views DESC
      LIMIT 10
    `);
    pages.rows.forEach(row => {
      console.log(`${row.page_path}: ${row.views} views`);
    });

    // 4. Most Common Events
    console.log('\n🎯 TOP EVENTS');
    console.log('─'.repeat(40));
    const events = await client.query(`
      SELECT event_name, COUNT(*) as count
      FROM analytics_user_journeys
      GROUP BY event_name
      ORDER BY count DESC
      LIMIT 10
    `);
    events.rows.forEach(row => {
      console.log(`${row.event_name}: ${row.count}`);
    });

    // 5. User Journey Patterns
    console.log('\n🚶 USER JOURNEY PATTERNS');
    console.log('─'.repeat(40));
    const journeys = await client.query(`
      SELECT
        session_id,
        COUNT(*) as steps,
        MAX(step_number) as max_step
      FROM analytics_user_journeys
      GROUP BY session_id
      ORDER BY steps DESC
      LIMIT 5
    `);
    console.log('Most engaged sessions:');
    journeys.rows.forEach(row => {
      console.log(`  Session ${row.session_id.slice(0,8)}...: ${row.steps} events`);
    });

    // 6. Average Session Depth
    const avgDepth = await client.query(`
      SELECT ROUND(AVG(steps), 1) as avg_steps
      FROM (
        SELECT session_id, COUNT(*) as steps
        FROM analytics_user_journeys
        GROUP BY session_id
      ) sub
    `);
    console.log(`\nAverage events per session: ${avgDepth.rows[0].avg_steps}`);

    // 7. Scroll Engagement
    console.log('\n📜 SCROLL ENGAGEMENT');
    console.log('─'.repeat(40));
    const scrolls = await client.query(`
      SELECT
        event_data->>'label' as depth,
        COUNT(*) as count
      FROM analytics_user_journeys
      WHERE event_name = 'scroll_depth'
      GROUP BY event_data->>'label'
      ORDER BY depth
    `);
    if (scrolls.rows.length > 0) {
      scrolls.rows.forEach(row => {
        console.log(`${row.depth || 'unknown'}: ${row.count} times`);
      });
    } else {
      console.log('No scroll data yet');
    }

    // 8. Entry Pages (First page visited)
    console.log('\n🚪 ENTRY PAGES');
    console.log('─'.repeat(40));
    const entryPages = await client.query(`
      SELECT first_page, COUNT(*) as count
      FROM analytics_sessions
      WHERE first_page IS NOT NULL
      GROUP BY first_page
      ORDER BY count DESC
      LIMIT 5
    `);
    entryPages.rows.forEach(row => {
      console.log(`${row.first_page}: ${row.count} sessions`);
    });

    // 9. Returning vs New
    console.log('\n👥 VISITOR TYPE');
    console.log('─'.repeat(40));
    const returning = await client.query(`
      SELECT
        CASE WHEN event_name = 'returning_visitor' THEN 'Returning' ELSE 'New' END as type,
        COUNT(DISTINCT session_id) as count
      FROM analytics_user_journeys
      WHERE event_name IN ('returning_visitor', 'new_visitor')
      GROUP BY event_name
    `);
    returning.rows.forEach(row => {
      console.log(`${row.type}: ${row.count} visitors`);
    });

    // 10. Conversions
    console.log('\n💰 CONVERSIONS');
    console.log('─'.repeat(40));
    const conversions = await client.query(`
      SELECT event_name, COUNT(*) as count
      FROM analytics_user_journeys
      WHERE event_name IN ('form_submit', 'phone_click', 'cta_click', 'form_start')
      GROUP BY event_name
      ORDER BY count DESC
    `);
    if (conversions.rows.length > 0) {
      conversions.rows.forEach(row => {
        console.log(`${row.event_name}: ${row.count}`);
      });
    } else {
      console.log('No conversion events yet');
    }

    // 11. Traffic Sources
    console.log('\n🔗 TRAFFIC SOURCES');
    console.log('─'.repeat(40));
    const sources = await client.query(`
      SELECT
        COALESCE(utm_source, 'direct') as source,
        COUNT(*) as count
      FROM analytics_sessions
      GROUP BY utm_source
      ORDER BY count DESC
    `);
    sources.rows.forEach(row => {
      console.log(`${row.source}: ${row.count} sessions`);
    });

    console.log('\n========================================\n');

    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

getInsights();
