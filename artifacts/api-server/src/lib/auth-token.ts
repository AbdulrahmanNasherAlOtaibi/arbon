import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

const SECRET = process.env["SESSION_SECRET"] ?? "arbon-dev-secret";

/** Demo/landing fallback identity so the seeded showcase data stays visible
 *  for visitors who have not signed in. */
export const DEMO_USER_ID = 1;

const sign = (id: number) =>
  createHmac("sha256", SECRET).update(`user:${id}`).digest("hex");

/** Token format: `<id>.<hmac>` — the id is readable so the server can resolve
 *  the account, and the hmac makes it tamper-proof. */
export function makeUserToken(id: number): string {
  return `${id}.${sign(id)}`;
}

/** Returns the user id encoded in a valid token, or null when the token is
 *  missing, malformed, or the signature does not verify. */
export function verifyUserToken(token: string | undefined | null): number | null {
  if (!token) return null;
  const dot = token.lastIndexOf(".");
  if (dot <= 0) return null;
  const id = Number(token.slice(0, dot));
  const mac = token.slice(dot + 1);
  if (!Number.isInteger(id) || id <= 0 || !mac) return null;
  const expected = sign(id);
  if (mac.length !== expected.length) return null;
  try {
    if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  } catch {
    return null;
  }
  return id;
}

/** Resolve the authenticated user id from the request's Authorization bearer
 *  token. Falls back to the demo user when no valid token is present. */
export function resolveUserId(req: Request): number {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  return verifyUserToken(token) ?? DEMO_USER_ID;
}
