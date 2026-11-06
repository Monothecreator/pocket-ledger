import { NextResponse } from "next/server";
import { z } from "zod";
import { createAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { rateLimit, readJsonBody } from "@/lib/request-security";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) }).strict();

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body.ok) return NextResponse.json({ ok: true });
  const parsed = schema.safeParse(body.value);
  if (!parsed.success) return NextResponse.json({ ok: true });
  if (!(await rateLimit(`recover:${parsed.data.email}`, 3, 60 * 60 * 1000))) {
    return NextResponse.json({ ok: true });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
  if (user && process.env.SMTP_HOST && process.env.PUBLIC_BASE_URL) {
    const { token, tokenHash } = createAccountToken();
    await prisma.accountToken.create({
      data: { tokenHash, type: "recovery", userId: user.id, expiresAt: new Date(Date.now() + 15 * 60 * 1000) },
    });
    await sendMail(parsed.data.email, "Reset your Pocket Ledger password", `${process.env.PUBLIC_BASE_URL}/reset-password/landing?token=${encodeURIComponent(token)}`);
  }
  return NextResponse.json({ ok: true });
}
