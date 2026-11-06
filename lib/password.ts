import argon2 from "argon2";

export const argon2Options = {
  type: argon2.argon2id,
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string) {
  return argon2.hash(password, argon2Options);
}

export async function verifyPassword(hash: string, password: string) {
  return argon2.verify(hash, password);
}

export async function dummyPasswordHash() {
  return argon2.hash("not-a-real-password", argon2Options);
}
