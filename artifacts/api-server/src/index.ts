import app from "./app";
import { logger } from "./lib/logger";
import { db, seedDemoData } from "@workspace/db";

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
 * When DEMO_SEED=true, load the demo dataset on boot if the database is empty.
 * This lets a fresh deployment come up already populated for a live demo,
 * without anyone having to run a seed command manually. It never overwrites an
 * already-populated database.
 */
async function maybeSeedDemo(): Promise<void> {
  if (process.env["DEMO_SEED"] !== "true") return;
  try {
    const { seeded } = await seedDemoData(db, { reset: false });
    logger.info({ seeded }, seeded ? "Demo data seeded on boot" : "Demo data already present — skipped");
  } catch (err) {
    logger.error({ err }, "Demo seed on boot failed (continuing without it)");
  }
}

async function bootstrap(): Promise<void> {
  await maybeSeedDemo();
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

void bootstrap();
