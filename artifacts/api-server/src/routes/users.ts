import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { GetMeResponse, UpdateMeBody, UpdateMeResponse } from "@workspace/api-zod";
import { resolveUserId } from "../lib/auth-token";

const router: IRouter = Router();

router.get("/users/me", async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, resolveUserId(req)));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(GetMeResponse.parse({ ...user, createdAt: user.createdAt.toISOString() }));
});

router.patch("/users/me", async (req, res): Promise<void> => {
  const parsed = UpdateMeBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [user] = await db
    .update(usersTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(usersTable.id, resolveUserId(req)))
    .returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(UpdateMeResponse.parse({ ...user, createdAt: user.createdAt.toISOString() }));
});

export default router;
