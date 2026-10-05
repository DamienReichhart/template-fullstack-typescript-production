export const systemKeys = {
  all: ['system'] as const,
  ping: () => [...systemKeys.all, 'ping'] as const,
  authenticatedPing: () => [...systemKeys.all, 'ping', 'authenticated'] as const,
};
