export const UserRoles = ['USER', 'ADMIN'] as const;

/** What a user may do. `ADMIN` unlocks operational tooling (e.g. the queue dashboard). */
export type UserRole = (typeof UserRoles)[number];

export function isUserRole(value: string): value is UserRole {
  return (UserRoles as readonly string[]).includes(value);
}
