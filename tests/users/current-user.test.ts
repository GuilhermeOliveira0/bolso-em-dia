import { describe, expect, it } from "vitest";
import { toAuthenticatedUser } from "@/lib/users/current-user";

describe("toAuthenticatedUser", () => {
  it("uses the name stored in authenticated user metadata", () => {
    const user = toAuthenticatedUser({
      id: "user-a",
      email: "guilherme@example.com",
      user_metadata: { name: "Guilherme Oliveira" },
    });

    expect(user.name).toBe("Guilherme Oliveira");
  });

  it("uses the email identifier as fallback for legacy accounts", () => {
    const user = toAuthenticatedUser({ id: "user-a", email: "guilherme@example.com" });

    expect(user.name).toBe("guilherme");
  });
});
