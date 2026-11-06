import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "../lib/password";

describe("password storage", () => {
  it("stores Argon2id instead of plaintext and verifies the correct password", async () => {
    const password = "correct horse battery";
    const hash = await hashPassword(password);

    expect(hash).toMatch(/^\$argon2id\$/);
    expect(hash).not.toContain(password);
    await expect(verifyPassword(hash, password)).resolves.toBe(true);
    await expect(verifyPassword(hash, "wrong password")).resolves.toBe(false);
  });
});
