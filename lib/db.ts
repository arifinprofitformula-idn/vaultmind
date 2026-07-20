// SERVER-ONLY: Do NOT import from Client Components or browser code.

import { Pool } from "pg";
import type { QueryResult, QueryResultRow } from "pg";
import { getDatabaseUrl } from "./server-env";

const pool = new Pool({
  connectionString: getDatabaseUrl(),
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 5_000,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  try {
    const result = await pool.query<T>(text, params);
    return result;
  } catch (error) {
    console.error("[DB Error]", { text, error });
    throw error;
  }
}

export { pool };
