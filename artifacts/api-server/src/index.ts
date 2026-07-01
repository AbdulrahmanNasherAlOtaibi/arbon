import app from "./app";
import { logger } from "./lib/logger";
import { db, ensureSchema, seedDemoData } from "@workspace/db";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

/**
 * Prepare the database on boot so a fresh deployment serves data with zero
 * manual steps:
 *  1. ensureSchema() idempotently creates any missing tables/enums (works even
 *     on a database created by an older push that predates the escrow tables).
 *  2. Unless DEMO_SEED=false, load the demo dataset when the database is empty.
 *     It never overwrites an already-populated database.
 * Failures are logged but never block the server from starting.
 */
async function prepareDatabase(): Promise<void> {
  try {
    await ensureSchema(db);
    logger.info("Database schema ensured");
  } catch (err) {
    logger.error({ err }, "ensureSchema failed (continuing)");
  }

  if (process.env["DEMO_SEED"] === "false") return;
  try {
    const { seeded } = await seedDemoData(db, { reset: false });
    logger.info({ seeded }, seeded ? "Demo data seeded on boot" : "Demo data already present — skipped");
  } catch (err) {
    logger.error({ err }, "Demo seed on boot failed (continuing without it)");
  }
}

async function bootstrap(): Promise<void> {
  await prepareDatabase();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

void bootstrap();
