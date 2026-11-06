export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-medium uppercase tracking-widest text-zinc-500">
          Pocket Ledger
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">
          Private, simple expense tracking
        </h1>
        <p className="mt-4 max-w-lg text-zinc-600">
          Create an account, record spending, and ask questions grounded in your
          own expenses.
        </p>
        <div className="mt-8 flex gap-3">
          <a
            href="/signup"
            className="rounded-lg bg-black px-5 py-2.5 font-medium text-white"
          >
            Sign up
          </a>
          <a
            href="/login"
            className="rounded-lg border px-5 py-2.5 font-medium"
          >
            Log in
          </a>
        </div>
      </main>
    </div>
  );
}
