/**
 * Clean up test data
 */

import pg from 'pg';
const { Pool } = pg;

async function cleanup() {
  const connectionString = process.env.DATABASE_URL;

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const client = await pool.connect();

    // Delete test data
    await client.query(`DELETE FROM analytics_events WHERE session_id LIKE 'test-%'`);
    await client.query(`DELETE FROM analytics_user_journeys WHERE session_id LIKE 'test-%'`);
    await client.query(`DELETE FROM analytics_sessions WHERE session_id LIKE 'test-%'`);

    console.log('Test data cleaned up');

    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

cleanup();
