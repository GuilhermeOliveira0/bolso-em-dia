import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("expenses RLS SQL", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase", "sql", "001_expenses_rls.sql"),
    "utf8",
  );

  it("requires an owner and enables row level security", () => {
    expect(sql).toContain("user_id uuid not null references auth.users(id)");
    expect(sql).toContain("alter table public.expenses enable row level security");
  });

  it("limits select, insert, update and delete to the authenticated owner", () => {
    expect(sql).toContain("for select");
    expect(sql).toContain("for insert");
    expect(sql).toContain("for update");
    expect(sql).toContain("for delete");
    expect(sql.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(4);
    expect(sql).toContain("auth.uid()) = user_id");
  });
});
