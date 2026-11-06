import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { ownedExpenseFilter } from "@/lib/ownership";
import { clientKey, rateLimit } from "@/lib/request-security";

const paramsSchema = z.object({ id: z.string().cuid() });

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await rateLimit(clientKey(request, `expense-delete:${userId}`), 120, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const parsed = paramsSchema.safeParse(await context.params);
  if (!parsed.success) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const deleted = await prisma.expense.deleteMany({ where: ownedExpenseFilter(userId, parsed.data.id) });
  if (deleted.count === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return new NextResponse(null, { status: 204 });
}
