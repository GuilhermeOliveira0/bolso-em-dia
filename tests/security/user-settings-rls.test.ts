import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const sql = readFileSync(
  join(process.cwd(), "supabase", "sql", "004_user_finance_settings.sql"),
  "utf8",
);

describe("user finance settings RLS", () => {
  it("creates per-user settings tables with auth user ownership", () => {
    expect(sql).toContain("create table if not exists public.user_categories");
    expect(sql).toContain("user_id uuid not null references auth.users(id)");
    expect(sql).toContain("create table if not exists public.user_expense_types");
    expect(sql).toContain("create table if not exists public.user_payment_methods");
  });

  it("enables RLS and authenticated grants for all settings tables", () => {
    expect(sql).toContain("alter table public.user_categories enable row level security");
    expect(sql).toContain("alter table public.user_expense_types enable row level security");
    expect(sql).toContain("alter table public.user_payment_methods enable row level security");
    expect(sql).toContain("grant select, insert, update, delete on public.user_categories to authenticated");
  });

  it("uses ownership predicates in policies instead of role-only authorization", () => {
    expect(sql).toContain("using ((select auth.uid()) = user_id)");
    expect(sql).toContain("with check ((select auth.uid()) = user_id)");
    expect(sql).not.toContain("auth.role()");
  });
});
