import { createHash, randomBytes } from "crypto";

export function createAccountToken() {
  const token = randomBytes(32).toString("base64url");
  return { token, tokenHash: hashAccountToken(token) };
}

export function hashAccountToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
