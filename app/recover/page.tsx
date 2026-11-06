"use client";

import { FormEvent, useState } from "react";

export default function RecoverPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/recover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email") }),
    });
    if (!response.ok) setError("Unable to process request");
    else setSubmitted(true);
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">Recover your account</h1>
      {submitted ? <p className="mt-6" role="status">If the account exists and email delivery is configured, a recovery link has been sent.</p> : (
        <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
          <label className="flex flex-col gap-2">Email<input required type="email" name="email" maxLength={254} className="rounded-lg border px-3 py-2" /></label>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <button className="rounded-lg bg-black px-4 py-2 text-white">Send recovery link</button>
        </form>
      )}
    </main>
  );
}
