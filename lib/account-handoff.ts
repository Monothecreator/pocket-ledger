import { randomBytes } from "crypto";
import Redis from "ioredis";

let redis: Redis | null = null;

function client() {
  if (!redis) {
    if (!process.env.REDIS_URL) throw new Error("REDIS_URL is required");
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
  }
  return redis;
}

export async function storeAccountHandoff(token: string, type: "recovery" | "verification") {
  const id = randomBytes(32).toString("base64url");
  await client().set(`account-handoff:${id}`, JSON.stringify({ token, type }), "EX", 15 * 60);
  return id;
}

export async function consumeAccountHandoff(id: string, expectedType: "recovery" | "verification") {
  const key = `account-handoff:${id}`;
  const value = await client().get(key);
  if (!value) return null;
  await client().del(key);
  try {
    const parsed = JSON.parse(value);
    return parsed.type === expectedType && typeof parsed.token === "string" ? parsed.token as string : null;
  } catch {
    return null;
  }
}
