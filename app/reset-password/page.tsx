"use client";

import { FormEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<main className="mx-auto flex w-full max-w-md flex-1 items-center px-6">Loading…</main>}>
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const password = String(new FormData(event.currentTarget).get("password") ?? "");
    const response = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!response.ok) {
      setError("The recovery link is invalid or expired");
      return;
    }
    router.push("/login");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">Choose a new password</h1>
      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">
          New password
          <input required type="password" name="password" minLength={12} maxLength={128} className="rounded-lg border px-3 py-2" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button className="rounded-lg bg-black px-4 py-2 text-white">Reset password</button>
      </form>
    </main>
  );
}
