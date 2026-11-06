import { describe, expect, it } from "vitest";
import { createAccountToken, hashAccountToken } from "../lib/account-tokens";
import { decryptMfaSecret, encryptMfaSecret } from "../lib/mfa";

describe("account controls", () => {
  it("stores only a hash representation of account tokens", () => {
    const { token, tokenHash } = createAccountToken();
    expect(token).toHaveLength(43);
    expect(tokenHash).toBe(hashAccountToken(token));
    expect(tokenHash).not.toContain(token);
  });

  it("encrypts and decrypts an MFA secret", () => {
    process.env.MFA_ENCRYPTION_KEY = Buffer.alloc(32, 7).toString("base64url");
    const secret = "JBSWY3DPEHPK3PXP";
    const ciphertext = encryptMfaSecret(secret);
    expect(ciphertext).not.toContain(secret);
    expect(decryptMfaSecret(ciphertext)).toBe(secret);
  });
});
