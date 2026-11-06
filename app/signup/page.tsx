"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: form.get("email"), password: form.get("password") }),
    });
    if (!response.ok) {
      const body = await response.json();
      setError(body.error ?? "Unable to create account");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-6">
      <h1 className="text-3xl font-semibold">Create your account</h1>
      <form onSubmit={submit} className="mt-8 flex flex-col gap-4">
        <label className="flex flex-col gap-2">Email<input required type="email" name="email" maxLength={254} className="rounded-lg border px-3 py-2" /></label>
        <label className="flex flex-col gap-2">Password<input required type="password" name="password" minLength={12} maxLength={128} className="rounded-lg border px-3 py-2" /></label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="submit" className="rounded-lg bg-black px-4 py-2 font-medium text-white">Sign up</button>
      </form>
    </main>
  );
}
