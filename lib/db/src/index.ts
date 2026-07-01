import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

// Strip any query params (e.g. ?sslmode=require) from the connection string and
// force `rejectUnauthorized: false`. Managed Postgres providers (DigitalOcean,
// Neon, …) present self-signed / private-CA certificates, and node-postgres
// otherwise rejects them when `sslmode=require` is in the URL. This makes the
// connection work reliably against any managed database.
const rawUrl = process.env.DATABASE_URL || "";
export const pool = new Pool({
  connectionString: rawUrl ? rawUrl.split("?")[0] : "",
  ssl: rawUrl ? { rejectUnauthorized: false } : undefined,
});
export const db = drizzle(pool, { schema });

export * from "./schema";
export { seedDemoData } from "./demo-seed";
export { ensureSchema } from "./ensure-schema";
