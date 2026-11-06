"use client";

import { FormEvent, useEffect, useState } from "react";

type Expense = {
  id: string;
  amountCents: number;
  category: string;
  description: string;
  spentAt: string;
};

export default function ExpenseDashboard() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [error, setError] = useState("");

  async function load() {
    const response = await fetch("/api/expenses", { cache: "no-store" });
    if (!response.ok) return setError("Unable to load expenses");
    setExpenses((await response.json()).expenses);
  }

  useEffect(() => { queueMicrotask(() => { void load(); }); }, []);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const dollars = Number(form.get("amount"));
    const cents = Math.round(dollars * 100);
    const response = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amountCents: cents,
        category: form.get("category"),
        description: form.get("description") || "",
        spentAt: new Date(String(form.get("spentAt"))).toISOString(),
      }),
    });
    if (!response.ok) return setError("Unable to add expense");
    formElement.reset();
    await load();
  }

  async function remove(id: string) {
    const response = await fetch(`/api/expenses/${encodeURIComponent(id)}`, { method: "DELETE" });
    if (!response.ok) return setError("Unable to delete expense");
    await load();
  }

  return (
    <section className="mt-8">
      <form onSubmit={add} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">Amount (USD)<input name="amount" type="number" min="0.01" step="0.01" required className="rounded border px-3 py-2" /></label>
        <label className="flex flex-col gap-1">Category<input name="category" maxLength={50} required className="rounded border px-3 py-2" /></label>
        <label className="flex flex-col gap-1 sm:col-span-2">Description<input name="description" maxLength={500} className="rounded border px-3 py-2" /></label>
        <label className="flex flex-col gap-1 sm:col-span-2">Date<input name="spentAt" type="datetime-local" required className="rounded border px-3 py-2" /></label>
        <button className="rounded-lg bg-black px-4 py-2 text-white sm:col-span-2">Add expense</button>
      </form>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <ul className="mt-6 divide-y rounded-xl border">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between gap-4 p-4">
            <div><strong>${(expense.amountCents / 100).toFixed(2)}</strong> — {expense.category}<br /><span className="text-sm text-zinc-600">{expense.description}</span></div>
            <button type="button" onClick={() => void remove(expense.id)} className="text-sm text-red-700">Delete</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
