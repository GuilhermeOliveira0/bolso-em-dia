export type AuthenticatedUser = {
  id: string;
  email: string;
};

export function toAuthenticatedUser(user: {
  id: string;
  email?: string | null;
}): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email ?? "usuario-sem-email",
  };
}
