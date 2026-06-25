import { describe, expect, it } from "vitest";
import { getFriendlyAuthError } from "@/lib/auth/auth-errors";

describe("getFriendlyAuthError", () => {
  it("explains Supabase email rate limits in Portuguese", () => {
    expect(
      getFriendlyAuthError({
        code: "over_email_send_rate_limit",
        message: "email rate limit exceeded",
        status: 429,
      }),
    ).toContain("limite de envio de e-mails");
  });

  it("explains invalid email domains without exposing provider internals", () => {
    expect(
      getFriendlyAuthError({
        code: "email_address_invalid",
        message: "Email address is invalid",
        status: 400,
      }),
    ).toContain("e-mail valido");
  });

  it("maps invalid credentials to a safe login message", () => {
    expect(
      getFriendlyAuthError({
        code: "invalid_credentials",
        message: "Invalid login credentials",
        status: 400,
      }),
    ).toBe("E-mail ou senha incorretos.");
  });
});
