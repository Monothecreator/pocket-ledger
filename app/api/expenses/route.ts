import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit, readJsonBody } from "@/lib/request-security";

const expenseSchema = z.object({
  amountCents: z.number().int().positive().max(1000000000),
  category: z.string().trim().min(1).max(50),
  description: z.string().trim().max(500),
  spentAt: z.string().datetime({ offset: true }),
}).strict();

export async function GET() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const expenses = await prisma.expense.findMany({
    where: { userId }, orderBy: [{ spentAt: "desc" }, { createdAt: "desc" }],
  });
  return NextResponse.json({ expenses });
}

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await rateLimit(clientKey(request, `expense:${userId}`), 120, 15 * 60 * 1000))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Invalid expense" }, { status: 400 });
  const parsed = expenseSchema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Invalid expense" }, { status: 400 });
  const expense = await prisma.expense.create({
    data: { ...parsed.data, spentAt: new Date(parsed.data.spentAt), userId },
  });
  return NextResponse.json({ expense }, { status: 201 });
}
