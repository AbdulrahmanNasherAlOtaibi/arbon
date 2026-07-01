import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import { DomainError } from "./errors";

/**
 * KYC gate. No party may participate in a money-moving action before identity
 * verification (Nafath / OTP) has set `users.verified = true`.
 *
 * The actual identity-provider integration (Nafath) is external; this guard is
 * the enforcement point the provider callback flips.
 */
export async function assertVerified(userId: number): Promise<void> {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
  if (!user) {
    throw new DomainError("المستخدم غير موجود", 404);
  }
  if (!user.verified) {
    throw new DomainError(
      "يجب توثيق الهوية (نفاذ) قبل تنفيذ أي عملية مالية",
      403,
    );
  }
}
