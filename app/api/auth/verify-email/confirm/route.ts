import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { consumeAccountHandoff } from "@/lib/account-handoff";
import { hashAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/db";

export async function POST() {
  const handoffId = (await cookies()).get("account_verification_handoff")?.value;
  if (!handoffId) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  const rawToken = await consumeAccountHandoff(handoffId, "verification");
  if (!rawToken) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });

  const token = await prisma.accountToken.findFirst({
    where: { tokenHash: hashAccountToken(rawToken), type: "verification", usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token) return NextResponse.json({ error: "Invalid or expired link" }, { status: 400 });
  await prisma.$transaction([
    prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
    prisma.accountToken.update({ where: { id: token.id }, data: { usedAt: new Date() } }),
  ]);
  (await cookies()).delete("account_verification_handoff");
  return NextResponse.json({ ok: true });
}
