import { describe, expect, it } from "vitest";
import { ownedExpenseFilter } from "../lib/ownership";

describe("expense ownership", () => {
  it("always constrains list and deletion by the authenticated user", () => {
    expect(ownedExpenseFilter("user-a")).toEqual({ userId: "user-a" });
    expect(ownedExpenseFilter("user-a", "expense-1")).toEqual({ id: "expense-1", userId: "user-a" });
  });

  it("cannot accidentally authorize a different owner", () => {
    const filter = ownedExpenseFilter("user-a", "expense-owned-by-user-b");
    expect(filter).not.toEqual({ id: "expense-owned-by-user-b", userId: "user-b" });
  });
});
