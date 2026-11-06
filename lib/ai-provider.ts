export type AiProviderConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

export function aiProviderConfig() {
  const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = process.env;
  if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) return null;
  return { apiKey: AI_API_KEY, baseUrl: AI_BASE_URL, model: AI_MODEL } satisfies AiProviderConfig;
}

export async function requestAiAnswer(config: AiProviderConfig, messages: { role: string; content: string }[]) {
  const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model: config.model, messages, max_tokens: 400 }),
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) return { ok: false as const };
  const result = await response.json();
  const answer = result?.choices?.[0]?.message?.content;
  return typeof answer === "string" ? { ok: true as const, answer: answer.slice(0, 4000) } : { ok: false as const };
}
