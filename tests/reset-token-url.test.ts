import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("account token URL handling", () => {
  it("does not read recovery or verification secrets from browser query parameters", () => {
    const resetPage = readFileSync("app/reset-password/page.tsx", "utf8");
    const verificationPage = readFileSync("app/verify-email/page.tsx", "utf8");
    expect(resetPage).not.toContain("useSearchParams");
    expect(resetPage).not.toContain("searchParams.get(\"token\")");
    expect(verificationPage).not.toContain("useSearchParams");
    expect(verificationPage).not.toContain("searchParams.get(\"token\")");
  });

  it("uses clean landing paths for query entry at server-only routes", () => {
    const recover = readFileSync("app/api/auth/recover/route.ts", "utf8");
    const signup = readFileSync("app/api/auth/signup/route.ts", "utf8");
    expect(recover).toContain("/reset-password/landing?token=");
    expect(signup).toContain("/verify-email/landing?token=");
  });
});
