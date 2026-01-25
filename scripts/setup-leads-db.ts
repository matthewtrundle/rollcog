/**
 * Setup leads table in Neon PostgreSQL
 * Run with: npx tsx scripts/setup-leads-db.ts
 */

import { Pool } from "pg";

async function main(): Promise<void> {
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
    console.log("Creating leads table...\n");

    // Create leads table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        company VARCHAR(200),
        service VARCHAR(50),
        message TEXT NOT NULL,
        source VARCHAR(50),
        status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost')),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    console.log("✓ Created leads table");

    // Create indexes
    console.log("\nCreating indexes...");
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source)`);
    console.log("✓ Created indexes");

    // Create trigger for updated_at
    console.log("\nCreating update trigger...");
    await pool.query(`
      CREATE OR REPLACE FUNCTION update_leads_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `);

    await pool.query(`DROP TRIGGER IF EXISTS trigger_leads_updated_at ON leads`);
    await pool.query(`
      CREATE TRIGGER trigger_leads_updated_at
        BEFORE UPDATE ON leads
        FOR EACH ROW
        EXECUTE FUNCTION update_leads_updated_at();
    `);
    console.log("✓ Created update trigger");

    // Verify table
    const result = await pool.query(`
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_name = 'leads'
      ORDER BY ordinal_position
    `);

    console.log("\n✅ Setup complete! Table columns:");
    result.rows.forEach((row) => console.log(`  • ${row.column_name}: ${row.data_type}`));

  } catch (error) {
    console.error("Setup failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
