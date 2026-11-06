const { AI_API_KEY, AI_BASE_URL, AI_MODEL } = process.env;
if (!AI_API_KEY || !AI_BASE_URL || !AI_MODEL) {
  console.error("Missing AI_API_KEY, AI_BASE_URL, or AI_MODEL.");
  process.exit(2);
}

const response = await fetch(`${AI_BASE_URL.replace(/\/$/, '')}/chat/completions`, {
  method: "POST",
  headers: { Authorization: `Bearer ${AI_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    model: AI_MODEL,
    messages: [{ role: "user", content: "Reply with exactly: provider connection verified." }],
    max_tokens: 20,
  }),
  signal: AbortSignal.timeout(15000),
});
if (!response.ok) {
  console.error(`AI provider returned HTTP ${response.status}.`);
  process.exit(1);
}
const result = await response.json();
if (typeof result?.choices?.[0]?.message?.content !== "string") process.exit(1);
console.log("AI provider connection verified.");
