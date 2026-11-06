import { describe, expect, it } from "vitest";
import { clientKey, rateLimit, readJsonBody } from "../lib/request-security";

describe("request security", () => {
  it("rejects JSON bodies larger than the limit", async () => {
    const request = new Request("http://localhost/api/test", {
      method: "POST",
      headers: { "content-length": "16385" },
      body: "{}",
    });
    await expect(readJsonBody(request)).resolves.toEqual({ ok: false });
  });

  it("fails closed when shared Redis is unavailable", async () => {
    delete process.env.REDIS_URL;
    await expect(rateLimit("unique-limit-a", 1, 60_000)).resolves.toBe(false);
    await expect(rateLimit("unique-limit-b", 1, 60_000)).resolves.toBe(false);
  });

  it("uses the direct proxy address header as a key, not forward chains", () => {
    const request = new Request("http://localhost", { headers: { "x-real-ip": "192.0.2.1" } });
    expect(clientKey(request, "login")).toBe("login:192.0.2.1");
  });
});
