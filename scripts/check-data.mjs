/**
 * Check data was inserted into analytics tables
 */

import pg from 'pg';
const { Pool } = pg;

async function checkData() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    console.log('\n=== Sessions ===');
    const sessions = await client.query(`
      SELECT session_id, first_page, utm_source, device_type, started_at
      FROM analytics_sessions
      ORDER BY started_at DESC
      LIMIT 5
    `);
    sessions.rows.forEach(row => {
      console.log(`  ${row.session_id.slice(0, 20)}... | ${row.first_page} | utm: ${row.utm_source} | ${row.device_type}`);
    });

    console.log('\n=== User Journeys ===');
    const journeys = await client.query(`
      SELECT session_id, step_number, event_type, event_name, page_path
      FROM analytics_user_journeys
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    journeys.rows.forEach(row => {
      console.log(`  ${row.session_id.slice(0, 15)}... | step ${row.step_number} | ${row.event_type}:${row.event_name} | ${row.page_path}`);
    });

    console.log('\n=== Events Table ===');
    const events = await client.query(`
      SELECT session_id, event_name, href, timestamp
      FROM analytics_events
      ORDER BY timestamp DESC
      LIMIT 10
    `);
    events.rows.forEach(row => {
      console.log(`  ${row.session_id.slice(0, 15)}... | ${row.event_name} | ${row.href}`);
    });

    console.log('\n=== Summary ===');
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM analytics_sessions');
    const journeyCount = await client.query('SELECT COUNT(*) as count FROM analytics_user_journeys');
    const eventsCount = await client.query('SELECT COUNT(*) as count FROM analytics_events');
    console.log(`Sessions: ${sessionCount.rows[0].count}`);
    console.log(`Journey Steps: ${journeyCount.rows[0].count}`);
    console.log(`Events: ${eventsCount.rows[0].count}`);

    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkData();
