import { z } from 'zod';

export const userRoleSchema = z.enum(['USER', 'ADMIN']);

export const currentUserResponseSchema = z.object({
  id: z.uuid(),
  email: z.email(),
  name: z.string(),
  role: userRoleSchema,
  emailVerified: z.boolean(),
  locale: z.string(),
  /** Display URL of the avatar, valid at least an hour; null without one. */
  avatarUrl: z.url().nullable(),
  createdAt: z.iso.datetime(),
});

export type UserRole = z.infer<typeof userRoleSchema>;
export type CurrentUserResponse = z.infer<typeof currentUserResponseSchema>;
