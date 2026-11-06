import { NextResponse } from "next/server";
import { generateSecret, generateURI } from "otplib";
import { getSessionUserId } from "@/lib/auth";
import { encryptMfaSecret } from "@/lib/mfa";
import { prisma } from "@/lib/db";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.MFA_ENCRYPTION_KEY) return NextResponse.json({ error: "MFA is not configured" }, { status: 503 });

  const secret = generateSecret();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { email: true } });
  await prisma.user.update({ where: { id: userId }, data: { mfaSecretCiphertext: encryptMfaSecret(secret), mfaEnabled: false } });
  const uri = generateURI({ issuer: "Pocket Ledger", label: user.email, secret });
  return NextResponse.json({ uri });
}
