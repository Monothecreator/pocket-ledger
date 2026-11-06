import Redis from "ioredis";

const MAX_BODY_BYTES = 16_384;
let redis: Redis | null = null;

function getRedis() {
  if (!redis) {
    if (!process.env.REDIS_URL) return null;
    redis = new Redis(process.env.REDIS_URL, { maxRetriesPerRequest: 1, enableOfflineQueue: false });
  }
  return redis;
}

export function clientKey(request: Request, prefix: string) {
  const address = request.headers.get("x-real-ip")?.trim() || "unknown";
  return `${prefix}:${address}`;
}

export async function rateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const client = getRedis();
  if (!client) return false;
  try {
    const count = await client.incr(key);
    if (count === 1) await client.pexpire(key, windowMs);
    return count <= limit;
  } catch {
    return false;
  }
}

export async function readJsonBody(request: Request): Promise<{ ok: true; value: unknown } | { ok: false }> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && Number(contentLength) > MAX_BODY_BYTES) return { ok: false };
  const buffer = await request.arrayBuffer();
  if (buffer.byteLength > MAX_BODY_BYTES) return { ok: false };
  try {
    return { ok: true, value: JSON.parse(new TextDecoder().decode(buffer)) };
  } catch {
    return { ok: false };
  }
}
