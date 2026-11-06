import { NextResponse } from "next/server";
import { verifySync } from "otplib";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { decryptMfaSecret } from "@/lib/mfa";
import { dummyPasswordHash, verifyPassword } from "@/lib/password";
import { clientKey, rateLimit, readJsonBody } from "@/lib/request-security";

const loginSchema = z
  .object({
    email: z.string().trim().toLowerCase().email().max(254),
    password: z.string().min(1).max(128),
    mfaCode: z.string().regex(/^\d{6}$/).optional(),
  })
  .strict();

export async function POST(request: Request) {
  try {
    if (!(await rateLimit(clientKey(request, "login"), 20, 15 * 60 * 1000))) {
      return NextResponse.json({ error: "Too many attempts" }, { status: 429 });
    }
    const body = await readJsonBody(request);
    if (!body.ok) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    const parsed = loginSchema.safeParse(body.value);
    if (!parsed.success) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const hash = user?.passwordHash ?? (await dummyPasswordHash());
    const valid = await verifyPassword(hash, parsed.data.password);

    if (!user || !valid) return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    if (user.mfaEnabled) {
      if (!parsed.data.mfaCode || !user.mfaSecretCiphertext) return NextResponse.json({ error: "MFA code required" }, { status: 401 });
      const mfaValid = verifySync({ secret: decryptMfaSecret(user.mfaSecretCiphertext), token: parsed.data.mfaCode }).valid;
      if (!mfaValid) return NextResponse.json({ error: "Invalid MFA code" }, { status: 401 });
    }
    await createSession(user.id);
    return NextResponse.json({ userId: user.id });
  } catch {
    return NextResponse.json({ error: "Unable to log in" }, { status: 500 });
  }
}
