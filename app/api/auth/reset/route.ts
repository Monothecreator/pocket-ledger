import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { consumeAccountHandoff } from "@/lib/account-handoff";
import { hashAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/password";
import { readJsonBody } from "@/lib/request-security";

const schema = z.object({ password: z.string().min(12).max(128) }).strict();

function validOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const expected = process.env.PUBLIC_BASE_URL ? new URL(process.env.PUBLIC_BASE_URL).origin : null;
    return expected !== null && new URL(origin).origin === expected;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  if (!validOrigin(request)) return NextResponse.json({ error: "Invalid request origin" }, { status: 403 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const handoffId = (await cookies()).get("account_reset_handoff")?.value;
  if (!handoffId) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  const rawToken = await consumeAccountHandoff(handoffId, "recovery");
  if (!rawToken) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const tokenHash = hashAccountToken(rawToken);
  const token = await prisma.accountToken.findFirst({
    where: { tokenHash, type: "recovery", usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const passwordHash = await hashPassword(parsed.data.password);
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { passwordHash } }),
    prisma.accountToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
  (await cookies()).delete("account_reset_handoff");
  return NextResponse.json({ ok: true });
}
