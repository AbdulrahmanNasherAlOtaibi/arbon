import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, contractsTable, dealsTable } from "@workspace/db";
import {
  GetDealContractParams,
  GetDealContractResponse,
  SignContractParams,
  SignContractResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const MOCK_USER_ID = 1;

function formatContract(contract: typeof contractsTable.$inferSelect) {
  return {
    ...contract,
    buyerSignedAt: contract.buyerSignedAt ? contract.buyerSignedAt.toISOString() : null,
    sellerSignedAt: contract.sellerSignedAt ? contract.sellerSignedAt.toISOString() : null,
    createdAt: contract.createdAt.toISOString(),
  };
}

router.get("/deals/:id/contract", async (req, res): Promise<void> => {
  const params = GetDealContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [contract] = await db
    .select()
    .from(contractsTable)
    .where(eq(contractsTable.dealId, params.data.id));

  if (!contract) {
    res.status(404).json({ error: "العقد غير موجود" });
    return;
  }

  res.json(GetDealContractResponse.parse(formatContract(contract)));
});

router.post("/deals/:id/contract/sign", async (req, res): Promise<void> => {
  const params = SignContractParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deal] = await db.select().from(dealsTable).where(eq(dealsTable.id, params.data.id));
  if (!deal) {
    res.status(404).json({ error: "الصفقة غير موجودة" });
    return;
  }

  const isBuyer = deal.buyerId === MOCK_USER_ID;
  const isSeller = deal.sellerId === MOCK_USER_ID;

  const updateData: Record<string, unknown> = {};
  if (isBuyer) {
    updateData.buyerSigned = true;
    updateData.buyerSignedAt = new Date();
  }
  if (isSeller) {
    updateData.sellerSigned = true;
    updateData.sellerSignedAt = new Date();
  }

  const [contract] = await db
    .update(contractsTable)
    .set(updateData)
    .where(eq(contractsTable.dealId, params.data.id))
    .returning();

  if (!contract) {
    res.status(404).json({ error: "العقد غير موجود" });
    return;
  }

  if (contract.buyerSigned && contract.sellerSigned) {
    await db.update(dealsTable).set({ status: "active", updatedAt: new Date() }).where(eq(dealsTable.id, params.data.id));
    await db.update(dealsTable).set({ buyerSigned: true, sellerSigned: true, updatedAt: new Date() }).where(eq(dealsTable.id, params.data.id));
  }

  res.json(SignContractResponse.parse(formatContract(contract)));
});

export default router;
