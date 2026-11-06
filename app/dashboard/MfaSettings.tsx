"use client";

import { FormEvent, useState } from "react";

export default function MfaSettings() {
  const [uri, setUri] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function setup() {
    setError("");
    const response = await fetch("/api/auth/mfa/setup", { method: "POST" });
    const body = await response.json();
    if (!response.ok) return setError(body.error ?? "Unable to start MFA setup");
    setUri(body.uri);
  }

  async function activate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const code = String(new FormData(event.currentTarget).get("code") ?? "");
    const response = await fetch("/api/auth/mfa/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    if (!response.ok) return setError("Invalid MFA code");
    setUri("");
    setMessage("MFA is enabled for this account.");
  }

  return (
    <section className="mt-10 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Multi-factor authentication</h2>
      {!uri && !message && <button type="button" onClick={() => void setup()} className="mt-4 rounded-lg bg-black px-4 py-2 text-white">Set up MFA</button>}
      {uri && <form onSubmit={activate} className="mt-4 flex flex-col gap-3"><p className="break-all text-sm text-zinc-600">Authenticator setup URI: {uri}</p><label>Six-digit code<input required name="code" pattern="[0-9]{6}" maxLength={6} className="ml-3 rounded border px-3 py-2" /></label><button className="rounded-lg bg-black px-4 py-2 text-white">Activate MFA</button></form>}
      {message && <p role="status" className="mt-4">{message}</p>}
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    </section>
  );
}
