"use client";

import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
  const [message, setMessage] = useState("Verifying…");

  useEffect(() => {
    void fetch("/api/auth/verify-email/confirm", { method: "POST" }).then((response) => {
      setMessage(response.ok ? "Email verified." : "Verification link is invalid or expired.");
    });
  }, []);

  return <main className="mx-auto flex w-full max-w-md flex-1 items-center px-6"><p role="status">{message}</p></main>;
}
