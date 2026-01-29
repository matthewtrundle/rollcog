/**
 * Verify analytics tables are working
 */

import pg from 'pg';
const { Pool } = pg;

async function verify() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    // Check table structures
    console.log('\n=== Table Structures ===\n');

    const sessionsColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'analytics_sessions'
      ORDER BY ordinal_position;
    `);
    console.log('analytics_sessions columns:');
    sessionsColumns.rows.forEach(row =>
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    const journeysColumns = await client.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_name = 'analytics_user_journeys'
      ORDER BY ordinal_position;
    `);
    console.log('\nanalytics_user_journeys columns:');
    journeysColumns.rows.forEach(row =>
      console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`)
    );

    // Check views exist
    console.log('\n=== Views ===\n');
    const views = await client.query(`
      SELECT table_name
      FROM information_schema.views
      WHERE table_schema = 'public'
        AND table_name LIKE '%session%' OR table_name LIKE '%journey%' OR table_name LIKE '%utm%'
      ORDER BY table_name;
    `);
    console.log('Journey-related views:');
    views.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

    // Check indexes
    console.log('\n=== Indexes ===\n');
    const indexes = await client.query(`
      SELECT indexname
      FROM pg_indexes
      WHERE tablename IN ('analytics_sessions', 'analytics_user_journeys')
      ORDER BY indexname;
    `);
    console.log('Journey table indexes:');
    indexes.rows.forEach(row => console.log(`  ✓ ${row.indexname}`));

    // Count existing rows
    console.log('\n=== Current Data ===\n');
    const sessionCount = await client.query('SELECT COUNT(*) as count FROM analytics_sessions');
    const journeyCount = await client.query('SELECT COUNT(*) as count FROM analytics_user_journeys');
    const eventsCount = await client.query('SELECT COUNT(*) as count FROM analytics_events');
    const pageviewsCount = await client.query('SELECT COUNT(*) as count FROM analytics_pageviews');

    console.log(`analytics_sessions: ${sessionCount.rows[0].count} rows`);
    console.log(`analytics_user_journeys: ${journeyCount.rows[0].count} rows`);
    console.log(`analytics_events: ${eventsCount.rows[0].count} rows`);
    console.log(`analytics_pageviews: ${pageviewsCount.rows[0].count} rows`);

    // Test insert into sessions
    console.log('\n=== Test Insert ===\n');
    const testSessionId = 'test-migration-' + Date.now();
    await client.query(`
      INSERT INTO analytics_sessions (session_id, first_page, device_type)
      VALUES ($1, '/test', 'desktop')
    `, [testSessionId]);
    console.log(`✓ Inserted test session: ${testSessionId}`);

    // Test insert into journeys
    await client.query(`
      INSERT INTO analytics_user_journeys (session_id, step_number, event_type, event_name, page_path)
      VALUES ($1, 1, 'session', 'session_start', '/test')
    `, [testSessionId]);
    console.log(`✓ Inserted test journey step`);

    // Clean up test data
    await client.query('DELETE FROM analytics_user_journeys WHERE session_id = $1', [testSessionId]);
    await client.query('DELETE FROM analytics_sessions WHERE session_id = $1', [testSessionId]);
    console.log(`✓ Cleaned up test data`);

    console.log('\n=== Verification Complete ===\n');
    console.log('All tables and views are working correctly!');

    client.release();
  } catch (error) {
    console.error('Verification failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

verify();
