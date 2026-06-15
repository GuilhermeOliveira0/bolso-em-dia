import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("receipts RLS and storage SQL", () => {
  const sql = readFileSync(
    join(process.cwd(), "supabase", "sql", "002_receipts_storage.sql"),
    "utf8",
  );

  it("creates receipts with owner, private file path and upload limits", () => {
    expect(sql).toContain("user_id uuid not null references auth.users(id)");
    expect(sql).toContain("file_path text not null unique");
    expect(sql).toContain("file_size integer not null check (file_size > 0 and file_size <= 5242880)");
    expect(sql).toContain("file_type text not null check");
    expect(sql).toContain("'image/png', 'image/jpeg', 'image/webp'");
    expect(sql).toContain("status text not null default 'uploaded'");
  });

  it("enables RLS and limits table operations to the authenticated owner", () => {
    expect(sql).toContain("alter table public.receipts enable row level security");
    expect(sql).toContain("for select");
    expect(sql).toContain("for insert");
    expect(sql).toContain("for update");
    expect(sql).toContain("for delete");
    expect(sql.match(/auth\.uid\(\)/g)?.length).toBeGreaterThanOrEqual(8);
    expect(sql).toContain("auth.uid()) = user_id");
  });

  it("keeps the storage bucket private and limited to image files", () => {
    expect(sql).toContain("insert into storage.buckets");
    expect(sql).toContain("'receipts'");
    expect(sql).toContain("false");
    expect(sql).toContain("file_size_limit = 5242880");
    expect(sql).toContain("allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp']");
  });

  it("limits storage object access to the authenticated user's folder", () => {
    expect(sql).toContain("on storage.objects");
    expect(sql).toContain("bucket_id = 'receipts'");
    expect(sql).toContain("(storage.foldername(name))[1] = (select auth.uid())::text");
  });
});
