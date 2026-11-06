export function aiExpenseWhere(userId: string) {
  return { userId };
}

export function summarizeExpense(amountCents: number, category: string, description: string, spentAt: Date) {
  return {
    amount: (amountCents / 100).toFixed(2),
    category,
    description,
    spentAt: spentAt.toISOString(),
  };
}
