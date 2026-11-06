import { afterEach, describe, expect, it, vi } from "vitest";
import { aiProviderConfig, requestAiAnswer } from "../lib/ai-provider";

const originalFetch = globalThis.fetch;
afterEach(() => { globalThis.fetch = originalFetch; vi.restoreAllMocks(); });

describe("AI provider client", () => {
  it("parses a provider answer without exposing API-key config", async () => {
    globalThis.fetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: "Food total: $12.34" } }] }), { status: 200 }));
    const result = await requestAiAnswer({ apiKey: "test-only-key", baseUrl: "https://provider.example/v1", model: "test-model" }, [{ role: "user", content: "total" }]);
    expect(result).toEqual({ ok: true, answer: "Food total: $12.34" });
    const [url, options] = vi.mocked(globalThis.fetch).mock.calls[0];
    expect(url).toBe("https://provider.example/v1/chat/completions");
    expect((options?.headers as Record<string, string>).Authorization).toBe("Bearer test-only-key");
  });

  it("does not claim provider configuration when credentials are missing", () => {
    delete process.env.AI_API_KEY;
    delete process.env.AI_BASE_URL;
    delete process.env.AI_MODEL;
    expect(aiProviderConfig()).toBeNull();
  });
});
