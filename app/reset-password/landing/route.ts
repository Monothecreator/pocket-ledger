import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { z } from "zod";
import { storeAccountHandoff } from "@/lib/account-handoff";
import { hashAccountToken } from "@/lib/account-tokens";
import { prisma } from "@/lib/db";
import { clientKey, rateLimit } from "@/lib/request-security";

const querySchema = z.object({ token: z.string().length(43) });

export async function GET(request: Request) {
  if (!(await rateLimit(clientKey(request, "reset-token-validation"), 20, 15 * 60 * 1000))) {
    redirect("/reset-password?invalid=1");
  }
  const url = new URL(request.url);
  const parsed = querySchema.safeParse({ token: url.searchParams.get("token") ?? undefined });
  if (!parsed.success) redirect("/reset-password?invalid=1");

  const token = await prisma.accountToken.findFirst({
    where: { tokenHash: hashAccountToken(parsed.data.token), type: "recovery", usedAt: null, expiresAt: { gt: new Date() } },
  });
  if (!token) redirect("/reset-password?invalid=1");

  const handoffId = await storeAccountHandoff(parsed.data.token, "recovery");
  (await cookies()).set("account_reset_handoff", handoffId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 15 * 60,
  });
  redirect("/reset-password");
}
