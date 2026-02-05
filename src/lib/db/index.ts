/**
 * @fileoverview PostgreSQL database connection utility
 * @module lib/db
 *
 * Provides a reusable database connection pool for all API routes.
 * Uses Neon PostgreSQL with connection pooling.
 */

import { Pool, PoolClient, QueryResult, QueryResultRow } from "pg";

let pool: Pool | null = null;

/**
 * Get or create the database connection pool
 */
function getPool(): Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
      throw new Error("DATABASE_URL environment variable is not set");
    }

    pool = new Pool({
      connectionString,
      ssl: { rejectUnauthorized: false },
      max: 10, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 10000, // Timeout after 10 seconds when connecting
    });

    // Log pool errors
    pool.on("error", (err) => {
      console.error("Unexpected database pool error:", err);
    });
  }

  return pool;
}

/**
 * Execute a query against the database
 */
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[]
): Promise<QueryResult<T>> {
  const pool = getPool();
  const start = Date.now();

  try {
    const result = await pool.query<T>(text, params);
    const duration = Date.now() - start;

    // Log slow queries (> 1 second)
    if (duration > 1000) {
      console.warn("Slow query detected:", { text, duration: `${duration}ms`, rows: result.rowCount });
    }

    return result;
  } catch (error) {
    console.error("Database query error:", { text, error });
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 */
export async function getClient(): Promise<PoolClient> {
  const pool = getPool();
  return pool.connect();
}

/**
 * Execute multiple queries in a transaction
 */
export async function transaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await getClient();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Close the database pool (for cleanup)
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

// Lead types
export interface Lead {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  source: string | null;
  status: "new" | "contacted" | "qualified" | "closed" | "lost";
  created_at: Date;
  updated_at: Date;
}

export interface CreateLeadData {
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  message: string;
  source?: string | null;
}

/**
 * Create a new lead in the database
 */
export async function createLead(data: CreateLeadData): Promise<Lead> {
  const result = await query<Lead>(
    `INSERT INTO leads (name, email, phone, company, service, message, source)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [
      data.name,
      data.email,
      data.phone || null,
      data.company || null,
      data.service || null,
      data.message,
      data.source || null,
    ]
  );

  return result.rows[0];
}

/**
 * Get all leads with optional filtering
 */
export async function getLeads(options?: {
  status?: string;
  limit?: number;
  offset?: number;
  orderBy?: "created_at" | "updated_at" | "name";
  order?: "ASC" | "DESC";
}): Promise<{ leads: Lead[]; total: number }> {
  const {
    status,
    limit = 50,
    offset = 0,
    orderBy = "created_at",
    order = "DESC",
  } = options || {};

  // Build the WHERE clause
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  // Get total count
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM leads ${whereClause}`,
    params
  );
  const total = parseInt(countResult.rows[0].count, 10);

  // Get leads with pagination
  const queryParams = [...params, limit, offset];
  const result = await query<Lead>(
    `SELECT * FROM leads ${whereClause}
     ORDER BY ${orderBy} ${order}
     LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    queryParams
  );

  return { leads: result.rows, total };
}

/**
 * Get a single lead by ID
 */
export async function getLeadById(id: number): Promise<Lead | null> {
  const result = await query<Lead>(
    "SELECT * FROM leads WHERE id = $1",
    [id]
  );

  return result.rows[0] || null;
}

/**
 * Update a lead's status
 */
export async function updateLeadStatus(
  id: number,
  status: Lead["status"]
): Promise<Lead | null> {
  const result = await query<Lead>(
    `UPDATE leads
     SET status = $1, updated_at = NOW()
     WHERE id = $2
     RETURNING *`,
    [status, id]
  );

  return result.rows[0] || null;
}

/**
 * Get lead statistics for dashboard
 */
export async function getLeadStats(): Promise<{
  total: number;
  thisWeek: number;
  byStatus: Record<string, number>;
  bySource: Record<string, number>;
}> {
  // Get total count
  const totalResult = await query<{ count: string }>(
    "SELECT COUNT(*) as count FROM leads"
  );
  const total = parseInt(totalResult.rows[0].count, 10);

  // Get this week's count
  const weekResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM leads
     WHERE created_at >= NOW() - INTERVAL '7 days'`
  );
  const thisWeek = parseInt(weekResult.rows[0].count, 10);

  // Get counts by status
  const statusResult = await query<{ status: string; count: string }>(
    `SELECT status, COUNT(*) as count FROM leads GROUP BY status`
  );
  const byStatus: Record<string, number> = {};
  statusResult.rows.forEach((row) => {
    byStatus[row.status] = parseInt(row.count, 10);
  });

  // Get counts by source
  const sourceResult = await query<{ source: string | null; count: string }>(
    `SELECT COALESCE(source, 'direct') as source, COUNT(*) as count
     FROM leads GROUP BY source`
  );
  const bySource: Record<string, number> = {};
  sourceResult.rows.forEach((row) => {
    bySource[row.source || "direct"] = parseInt(row.count, 10);
  });

  return { total, thisWeek, byStatus, bySource };
}

// Re-export scheduling functions
export {
  getAvailabilitySlotsForDay,
  getBookedAppointmentsForDate,
  getAvailableSlots,
  getWeeklyAvailability,
  createAppointment,
  getAppointmentById,
  getAppointmentWithLead,
  updateAppointment,
  getAppointmentsNeedingReminders,
  cancelAppointment,
} from "./scheduling";
