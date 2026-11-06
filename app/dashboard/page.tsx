import { redirect } from "next/navigation";
import { getSessionUserId } from "@/lib/auth";
import AskSpending from "./AskSpending";
import ExpenseDashboard from "./ExpenseDashboard";
import LogoutButton from "./LogoutButton";
import MfaSettings from "./MfaSettings";

export const instant = false;

export default async function DashboardPage() {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <h1 className="text-3xl font-semibold">Your Pocket Ledger</h1>
        <LogoutButton />
      </div>
      <ExpenseDashboard />
      <AskSpending />
      <MfaSettings />
    </main>
  );
}
