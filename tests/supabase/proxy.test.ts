import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

describe("Next.js Supabase proxy", () => {
  const proxyPath = join(process.cwd(), "src", "proxy.ts");

  function readProxySource() {
    return existsSync(proxyPath) ? readFileSync(proxyPath, "utf8") : "";
  }

  it("exists at the Next.js request boundary", () => {
    expect(existsSync(proxyPath)).toBe(true);
  });

  it("runs the Supabase session updater at the request boundary", () => {
    const proxySource = readProxySource();

    expect(proxySource).toContain('from "@/lib/supabase/middleware"');
    expect(proxySource).toContain("export async function proxy");
    expect(proxySource).toContain("return updateSession(request)");
  });

  it("skips framework assets while protecting application routes", () => {
    const proxySource = readProxySource();

    expect(proxySource).toContain("matcher");
    expect(proxySource).toContain("_next/static");
    expect(proxySource).toContain("_next/image");
    expect(proxySource).toContain("favicon.ico");
  });
});
