"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const body: Record<string, FormDataEntryValue | null> = {
      email: form.get("email"),
      password: form.get("password"),
    };
    const mfaCode = form.get("mfaCode");
    if (mfaCode) body.mfaCode = mfaCode;
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const result = await response.json();
      setError(result.error ?? "Unable to log in");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">Welcome back</h1>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          Email
          <input
            required
            type="email"
            name="email"
            maxLength={254}
            className="rounded-lg border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          Password
          <input
            required
            type="password"
            name="password"
            maxLength={128}
            className="rounded-lg border px-3 py-2"
          />
        </label>
        <label className="flex flex-col gap-2">
          MFA code (if enabled)
          <input
            name="mfaCode"
            inputMode="numeric"
            pattern="[0-9]{6}"
            maxLength={6}
            className="rounded-lg border px-3 py-2"
          />
        </label>
        {error && (
          <p role="alert" className="text-sm text-red-700">
            {error}
          </p>
        )}
        <button
          type="submit"
          className="rounded-lg bg-black px-4 py-2 font-medium text-white"
        >
          Log in
        </button>
        <a href="/recover" className="text-sm underline">
          Forgot password?
        </a>
      </form>
    </main>
  );
}
