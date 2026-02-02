/**
 * Compare user behavior: UTM (paid/campaign) vs Organic/Direct
 */

import pg from 'pg';
const { Pool } = pg;

async function compareTraffic() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    console.log('\n========================================');
    console.log('  UTM vs ORGANIC TRAFFIC COMPARISON');
    console.log('========================================\n');

    // 1. Traffic Source Breakdown
    console.log('📊 TRAFFIC SOURCE BREAKDOWN');
    console.log('─'.repeat(40));
    const sources = await client.query(`
      SELECT
        CASE
          WHEN utm_source IS NOT NULL THEN 'UTM Tagged'
          ELSE 'Direct/Organic'
        END as traffic_type,
        utm_source,
        utm_medium,
        utm_campaign,
        COUNT(*) as sessions
      FROM analytics_sessions
      GROUP BY
        CASE WHEN utm_source IS NOT NULL THEN 'UTM Tagged' ELSE 'Direct/Organic' END,
        utm_source, utm_medium, utm_campaign
      ORDER BY sessions DESC
    `);

    let utmCount = 0;
    let organicCount = 0;

    sources.rows.forEach(row => {
      if (row.traffic_type === 'UTM Tagged') {
        utmCount += parseInt(row.sessions);
        console.log(`UTM: ${row.utm_source}/${row.utm_medium}/${row.utm_campaign || 'none'}: ${row.sessions} sessions`);
      } else {
        organicCount += parseInt(row.sessions);
      }
    });
    console.log(`Direct/Organic: ${organicCount} sessions`);
    console.log(`\nTotal UTM: ${utmCount} | Total Organic: ${organicCount}`);

    // 2. Engagement Comparison
    console.log('\n📈 ENGAGEMENT BY SOURCE');
    console.log('─'.repeat(40));
    const engagement = await client.query(`
      SELECT
        CASE
          WHEN s.utm_source IS NOT NULL THEN 'UTM'
          ELSE 'Organic'
        END as source_type,
        COUNT(DISTINCT s.session_id) as sessions,
        COUNT(j.id) as total_events,
        ROUND(AVG(event_counts.event_count), 1) as avg_events_per_session
      FROM analytics_sessions s
      LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
      LEFT JOIN (
        SELECT session_id, COUNT(*) as event_count
        FROM analytics_user_journeys
        GROUP BY session_id
      ) event_counts ON s.session_id = event_counts.session_id
      GROUP BY CASE WHEN s.utm_source IS NOT NULL THEN 'UTM' ELSE 'Organic' END
    `);
    engagement.rows.forEach(row => {
      console.log(`${row.source_type}:`);
      console.log(`  Sessions: ${row.sessions}`);
      console.log(`  Total Events: ${row.total_events}`);
      console.log(`  Avg Events/Session: ${row.avg_events_per_session || 0}`);
    });

    // 3. Page Depth by Source
    console.log('\n📄 PAGES VISITED BY SOURCE');
    console.log('─'.repeat(40));
    const pageDepth = await client.query(`
      SELECT
        CASE
          WHEN s.utm_source IS NOT NULL THEN 'UTM'
          ELSE 'Organic'
        END as source_type,
        COUNT(DISTINCT j.page_path) as unique_pages,
        COUNT(CASE WHEN j.event_name = 'page_view' THEN 1 END) as page_views
      FROM analytics_sessions s
      LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
      GROUP BY CASE WHEN s.utm_source IS NOT NULL THEN 'UTM' ELSE 'Organic' END
    `);
    pageDepth.rows.forEach(row => {
      console.log(`${row.source_type}: ${row.page_views} page views across ${row.unique_pages} unique pages`);
    });

    // 4. Conversion Comparison
    console.log('\n💰 CONVERSIONS BY SOURCE');
    console.log('─'.repeat(40));
    const conversions = await client.query(`
      SELECT
        CASE
          WHEN s.utm_source IS NOT NULL THEN 'UTM'
          ELSE 'Organic'
        END as source_type,
        COUNT(DISTINCT s.session_id) as total_sessions,
        COUNT(DISTINCT CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN s.session_id END) as converting_sessions,
        COUNT(CASE WHEN j.event_name = 'form_start' THEN 1 END) as form_starts,
        COUNT(CASE WHEN j.event_name = 'form_submit' THEN 1 END) as form_submits,
        COUNT(CASE WHEN j.event_name = 'phone_click' THEN 1 END) as phone_clicks,
        COUNT(CASE WHEN j.event_name = 'cta_click' THEN 1 END) as cta_clicks
      FROM analytics_sessions s
      LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
      GROUP BY CASE WHEN s.utm_source IS NOT NULL THEN 'UTM' ELSE 'Organic' END
    `);
    conversions.rows.forEach(row => {
      const convRate = row.total_sessions > 0
        ? ((row.converting_sessions / row.total_sessions) * 100).toFixed(1)
        : 0;
      console.log(`${row.source_type}:`);
      console.log(`  Sessions: ${row.total_sessions}`);
      console.log(`  CTA Clicks: ${row.cta_clicks}`);
      console.log(`  Form Starts: ${row.form_starts}`);
      console.log(`  Form Submits: ${row.form_submits}`);
      console.log(`  Phone Clicks: ${row.phone_clicks}`);
      console.log(`  Conversion Rate: ${convRate}%`);
    });

    // 5. Scroll Depth by Source
    console.log('\n📜 SCROLL ENGAGEMENT BY SOURCE');
    console.log('─'.repeat(40));
    const scrolls = await client.query(`
      SELECT
        CASE
          WHEN s.utm_source IS NOT NULL THEN 'UTM'
          ELSE 'Organic'
        END as source_type,
        COUNT(CASE WHEN j.event_name = 'scroll_depth' THEN 1 END) as scroll_events
      FROM analytics_sessions s
      LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
      GROUP BY CASE WHEN s.utm_source IS NOT NULL THEN 'UTM' ELSE 'Organic' END
    `);
    scrolls.rows.forEach(row => {
      console.log(`${row.source_type}: ${row.scroll_events} scroll depth events`);
    });

    // 6. Specific UTM Campaigns Performance
    console.log('\n🎯 UTM CAMPAIGN PERFORMANCE');
    console.log('─'.repeat(40));
    const campaigns = await client.query(`
      SELECT
        COALESCE(s.utm_source, 'none') as source,
        COALESCE(s.utm_medium, 'none') as medium,
        COALESCE(s.utm_campaign, 'none') as campaign,
        COUNT(DISTINCT s.session_id) as sessions,
        COUNT(j.id) as events,
        ROUND(COUNT(j.id)::numeric / NULLIF(COUNT(DISTINCT s.session_id), 0), 1) as events_per_session,
        COUNT(CASE WHEN j.event_name IN ('form_submit', 'phone_click') THEN 1 END) as conversions
      FROM analytics_sessions s
      LEFT JOIN analytics_user_journeys j ON s.session_id = j.session_id
      WHERE s.utm_source IS NOT NULL
      GROUP BY s.utm_source, s.utm_medium, s.utm_campaign
      ORDER BY sessions DESC
    `);

    if (campaigns.rows.length === 0) {
      console.log('No UTM-tagged traffic yet.');
      console.log('\nTo track Google Ads, use URLs like:');
      console.log('  rollcogroofing.com/?utm_source=google&utm_medium=cpc&utm_campaign=roofing-chicago');
    } else {
      campaigns.rows.forEach(row => {
        console.log(`${row.source}/${row.medium}/${row.campaign}:`);
        console.log(`  Sessions: ${row.sessions}, Events: ${row.events}, Conversions: ${row.conversions}`);
      });
    }

    console.log('\n========================================\n');

    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

compareTraffic();
