export function ownedExpenseFilter(userId: string, expenseId?: string) {
  return expenseId ? { id: expenseId, userId } : { userId };
}
