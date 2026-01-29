/**
 * Run the analytics tables migration
 * Usage: node scripts/run-migration.mjs
 */

import pg from 'pg';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log('Connecting to database...');
    const client = await pool.connect();

    console.log('Reading SQL file...');
    const sql = readFileSync(join(__dirname, 'setup-analytics-tables.sql'), 'utf8');

    console.log('Running migration...');
    await client.query(sql);

    console.log('Migration completed successfully!');

    // Verify tables exist
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name IN ('analytics_sessions', 'analytics_user_journeys', 'analytics_pageviews', 'analytics_events')
      ORDER BY table_name;
    `);

    console.log('\nTables verified:');
    result.rows.forEach(row => console.log(`  ✓ ${row.table_name}`));

    client.release();
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
