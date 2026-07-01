import { Router, type IRouter } from "express";
import { createHmac, createHash } from "node:crypto";
import { eq, or } from "drizzle-orm";
import { z } from "zod/v4";
import { db, usersTable } from "@workspace/db";

const router: IRouter = Router();
const SECRET = process.env["SESSION_SECRET"] ?? "arbon-dev-secret";

const hashPassword = (p: string) => createHash("sha256").update(`${SECRET}:${p}`).digest("hex");
const userToken = (id: number) => createHmac("sha256", SECRET).update(`user:${id}`).digest("hex");

function publicUser(u: typeof usersTable.$inferSelect) {
  const { password: _pw, ...rest } = u;
  return rest;
}

const registerSchema = z.object({
  name: z.string().min(2, "الاسم مطلوب"),
  email: z.string().email("بريد إلكتروني غير صحيح"),
  password: z.string().min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل"),
  phone: z.string().optional(),
});

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = registerSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" });
    return;
  }
  const { name, email, password } = parsed.data;
  const phone = parsed.data.phone?.trim() || `EMAIL_${Date.now()}`;

  const existing = await db
    .select()
    .from(usersTable)
    .where(or(eq(usersTable.email, email), eq(usersTable.phone, phone)));
  if (existing.length > 0) {
    res.status(409).json({ error: "يوجد حساب مسجّل بهذا البريد أو الجوال" });
    return;
  }

  const [user] = await db
    .insert(usersTable)
    .values({
      name,
      email,
      phone,
      nationalId: `EMAIL_${Date.now()}`,
      password: hashPassword(password),
      verified: true,
    })
    .returning();

  res.status(201).json({ token: userToken(user!.id), user: publicUser(user!) });
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = z
    .object({ email: z.string().email("بريد إلكتروني غير صحيح"), password: z.string().min(1, "كلمة المرور مطلوبة") })
    .safeParse(req.body ?? {});
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues[0]?.message ?? "بيانات غير صحيحة" });
    return;
  }
  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, parsed.data.email));
  if (!user || !user.password || user.password !== hashPassword(parsed.data.password)) {
    res.status(401).json({ error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" });
    return;
  }
  res.json({ token: userToken(user.id), user: publicUser(user) });
});

export default router;
