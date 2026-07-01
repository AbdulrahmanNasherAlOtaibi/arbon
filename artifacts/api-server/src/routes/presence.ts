import { Router, type IRouter } from "express";

/**
 * Lightweight in-memory presence tracker. Each client sends a heartbeat with a
 * stable session id; a session counts as "online" if seen in the last 60s.
 * (In-memory: fine for a single-instance MVP; resets on restart.)
 */
const WINDOW_MS = 60_000;
const seen = new Map<string, number>();

function prune(now: number): void {
  for (const [sid, ts] of seen) {
    if (now - ts > WINDOW_MS) seen.delete(sid);
  }
}

export function onlineCount(): number {
  const now = Date.now();
  prune(now);
  return seen.size;
}

const router: IRouter = Router();

router.post("/presence", (req, res): void => {
  const sid = String((req.body ?? {}).sid ?? "").slice(0, 64);
  const now = Date.now();
  if (sid) seen.set(sid, now);
  prune(now);
  res.json({ online: seen.size });
});

router.get("/presence", (_req, res): void => {
  res.json({ online: onlineCount() });
});

export default router;
