/**
 * Run scheduling database migration
 *
 * Usage: node scripts/run-scheduling-migration.js
 *
 * Requires DATABASE_URL environment variable to be set.
 */

const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

async function runMigration() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("ERROR: DATABASE_URL environment variable is not set");
    console.log("\nSet it with:");
    console.log("  export DATABASE_URL='your-neon-connection-string'");
    process.exit(1);
  }

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("Connecting to database...");

    // Read the migration SQL file
    const migrationPath = path.join(__dirname, "migrate-scheduling.sql");
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("Running scheduling migration...\n");

    // Execute the migration
    await pool.query(migrationSQL);

    console.log("\n✓ Migration completed successfully!\n");

    // Verify the tables were created
    const tablesResult = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name IN ('availability_slots', 'appointments')
      ORDER BY table_name
    `);

    console.log("Tables created:");
    tablesResult.rows.forEach((row) => {
      console.log(`  - ${row.table_name}`);
    });

    // Show availability slots
    const slotsResult = await pool.query(`
      SELECT day_of_week, start_time, end_time, slot_duration_minutes
      FROM availability_slots
      WHERE is_active = true
      ORDER BY day_of_week
    `);

    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    console.log("\nDefault availability configured:");
    slotsResult.rows.forEach((row) => {
      console.log(
        `  - ${dayNames[row.day_of_week]}: ${row.start_time} - ${row.end_time} (${row.slot_duration_minutes} min slots)`
      );
    });

    console.log("\n✓ Scheduling system is ready to use!");
  } catch (error) {
    console.error("Migration error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runMigration();
