import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { createAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { hashPassword } from "@/lib/password";
import { clientKey, rateLimit, readJsonBody } from "@/lib/request-security";
import { logServerError, publicError } from "@/lib/safe-errors";

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(12).max(128),
}).strict();

export async function POST(request: Request) {
  try {
    if (!(await rateLimit(clientKey(request, "signup"), 10, 15 * 60 * 1000))) {
      return NextResponse.json(publicError("Too many attempts"), { status: 429 });
    }
    const body = await readJsonBody(request);
    if (!body.ok) return NextResponse.json(publicError("Invalid signup details"), { status: 400 });
    const parsed = signupSchema.safeParse(body.value);
    if (!parsed.success) return NextResponse.json(publicError("Invalid signup details"), { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true } });
    if (existing) return NextResponse.json(publicError("Unable to create account"), { status: 409 });

    const passwordHash = await hashPassword(parsed.data.password);
    const user = await prisma.user.create({ data: { email: parsed.data.email, passwordHash } });
    await createSession(user.id);

    if (process.env.SMTP_HOST && process.env.PUBLIC_BASE_URL) {
      const { token, tokenHash } = createAccountToken();
      await prisma.accountToken.create({
        data: { tokenHash, type: "verification", userId: user.id, expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      try {
        await sendMail(user.email, "Verify your Pocket Ledger email", `${process.env.PUBLIC_BASE_URL}/verify-email/landing?token=${encodeURIComponent(token)}`);
      } catch (error) {
        logServerError("verification-mail", error);
      }
    }
    return NextResponse.json({ userId: user.id }, { status: 201 });
  } catch (error) {
    logServerError("signup", error);
    return NextResponse.json(publicError("Unable to create account"), { status: 500 });
  }
}
