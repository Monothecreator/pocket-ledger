"use client";

import { FormEvent, useState } from "react";

export default function AskSpending() {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  async function ask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/ai/spending", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: form.get("question") }),
    });
    const body = await response.json();
    if (!response.ok) return setError(body.error ?? "Unable to answer question");
    setAnswer(body.answer);
  }

  return (
    <section className="mt-10 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Ask about my spending</h2>
      <form onSubmit={ask} className="mt-4 flex gap-3">
        <input name="question" required maxLength={500} placeholder="What did I spend on food this month?" className="min-w-0 flex-1 rounded border px-3 py-2" />
        <button className="rounded-lg bg-black px-4 py-2 text-white">Ask</button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
      {answer && <p className="mt-4 whitespace-pre-wrap text-zinc-700">{answer}</p>}
    </section>
  );
}
