import { describe, expect, it } from "vitest";
import { aiExpenseWhere, summarizeExpense } from "../lib/ai-context";

describe("AI context isolation", () => {
  it("always scopes expense context to the authenticated user", () => {
    expect(aiExpenseWhere("user-a")).toEqual({ userId: "user-a" });
    expect(aiExpenseWhere("user-a")).not.toEqual({ userId: "user-b" });
  });

  it("normalizes expense values without exposing internal cents", () => {
    expect(summarizeExpense(1234, "Food", "Lunch", new Date("2026-01-02T12:00:00Z"))).toEqual({
      amount: "12.34",
      category: "Food",
      description: "Lunch",
      spentAt: "2026-01-02T12:00:00.000Z",
    });
  });
});
