import { Router, type IRouter } from "express";
import { pool } from "@workspace/db";
import healthRouter from "./health";
import mockRouter from "./mock";
import usersRouter from "./users";
import dealsRouter from "./deals";
import contractsRouter from "./contracts";
import disputesRouter from "./disputes";
import dashboardRouter from "./dashboard";
import templatesRouter from "./templates";
import transfersRouter from "./transfers";

const router: IRouter = Router();

let useMock = false;
let checkPromise: Promise<void> | null = null;

async function doCheck(): Promise<void> {
  if (!process.env.DATABASE_URL) {
    useMock = true;
    return;
  }
  try {
    await pool.query("SELECT 1");
  } catch {
    useMock = true;
  }
}

function ensureChecked(): Promise<void> {
  checkPromise ??= doCheck();
  return checkPromise;
}

router.use(healthRouter);

router.use(async (_req, _res, next) => {
  await ensureChecked();
  next();
});

router.use((req, res, next): void => {
  if (useMock) { mockRouter(req, res, next); return; }
  next();
});

router.use(usersRouter);
router.use(dealsRouter);
router.use(contractsRouter);
router.use(disputesRouter);
router.use(dashboardRouter);
router.use(templatesRouter);
router.use(transfersRouter);

export default router;
