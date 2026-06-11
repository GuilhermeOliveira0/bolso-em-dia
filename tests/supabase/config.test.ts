import { afterEach, describe, expect, it } from "vitest";
import { getSupabaseConfig } from "@/lib/supabase/config";

const ORIGINAL_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ORIGINAL_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

describe("getSupabaseConfig", () => {
  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = ORIGINAL_URL;
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = ORIGINAL_ANON_KEY;
  });

  it("fails safely when Supabase environment variables are missing", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    const config = getSupabaseConfig();

    expect(config.ok).toBe(false);
    if (!config.ok) {
      expect(config.message).toContain("NEXT_PUBLIC_SUPABASE_URL");
      expect(config.message).toContain("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    }
  });

  it("returns public Supabase configuration when variables exist", () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "public-anon-key";

    const config = getSupabaseConfig();

    expect(config).toEqual({
      ok: true,
      url: "https://example.supabase.co",
      anonKey: "public-anon-key",
    });
  });
});
