/**
 * Work identity hands to its background jobs (the `identity-maintenance` queue), so it is
 * retried until done instead of failing the request that caused it.
 */
export abstract class IdentityHousekeeping {
  /** Deletes an Avatar file nothing points to any more. */
  abstract deleteAvatarFile(avatarKey: string): Promise<void>;
}
