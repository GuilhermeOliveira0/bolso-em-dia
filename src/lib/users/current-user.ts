export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string;
};

export function toAuthenticatedUser(user: {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
}): AuthenticatedUser {
  const email = user.email ?? "usuario-sem-email";
  const metadataName = user.user_metadata?.name;

  return {
    id: user.id,
    email,
    name:
      typeof metadataName === "string" && metadataName.trim()
        ? metadataName.trim()
        : email.split("@")[0],
  };
}
