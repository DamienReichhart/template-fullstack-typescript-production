/** Query keys of the auth feature. Every key starts with `auth` so the feature can be reset at once. */
export const authKeys = {
  all: ['auth'] as const,
  currentUser: () => [...authKeys.all, 'current-user'] as const,
};
