import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@workspace/db/schema";
import { seedDemoData } from "@workspace/db";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

/**
 * Manual demo seed — resets the database and reloads the full demo dataset.
 * Safe to run before every presentation.
 */
async function seed() {
  await seedDemoData(db, { reset: true });
  console.log("✅ Demo seed completed (database reset + reseeded).");
  await pool.end();
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
