import { NextResponse } from "next/server";
import { verifySync } from "otplib";
import { z } from "zod";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptMfaSecret } from "@/lib/mfa";
import { readJsonBody } from "@/lib/request-security";

const schema = z.object({ code: z.string().regex(/^\d{6}$/) }).strict();

export async function POST(request: Request) {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ error: "Invalid code" }, { status: 400 });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ error: "Invalid code" }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { id: userId }, select: { mfaSecretCiphertext: true } });
  if (!user?.mfaSecretCiphertext) return NextResponse.json({ error: "MFA setup not started" }, { status: 400 });
  const valid = verifySync({ secret: decryptMfaSecret(user.mfaSecretCiphertext), token: parsed.data.code }).valid;
  if (!valid) return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  await prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } });
  return NextResponse.json({ ok: true });
}
