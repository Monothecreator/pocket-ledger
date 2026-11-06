import { NextResponse } from "next/server";
import { createAccountToken } from "@/lib/account-tokens";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";

export async function POST() {
  const userId = await getSessionUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { email: true, emailVerifiedAt: true } });
  if (!user || user.emailVerifiedAt) return NextResponse.json({ ok: true });
  if (!process.env.SMTP_HOST || !process.env.PUBLIC_BASE_URL) return NextResponse.json({ error: "Email verification is not configured" }, { status: 503 });

  const { token, tokenHash } = createAccountToken();
  await prisma.accountToken.create({
    data: { tokenHash, type: "verification", userId, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
  });
  await sendMail(user.email, "Verify your Pocket Ledger email", `${process.env.PUBLIC_BASE_URL}/verify-email/landing?token=${encodeURIComponent(token)}`);
  return NextResponse.json({ ok: true });
}
