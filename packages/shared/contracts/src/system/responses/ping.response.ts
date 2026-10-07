import { z } from 'zod';

export const serviceStatusSchema = z.object({
  status: z.enum(['up', 'down']),
  latencyMs: z.number().nonnegative().optional(),
});

export const pingResponseSchema = z.object({
  status: z.enum(['ok', 'degraded']),
  version: z.string(),
  environment: z.string(),
  uptimeSeconds: z.number().nonnegative(),
  timestamp: z.iso.datetime(),
  services: z.object({
    database: serviceStatusSchema,
    redis: serviceStatusSchema,
    storage: serviceStatusSchema,
  }),
});

export const authenticatedPingResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.iso.datetime(),
  user: z.object({
    id: z.uuid(),
    email: z.email(),
    role: z.enum(['USER', 'ADMIN']),
  }),
});

export type ServiceStatus = z.infer<typeof serviceStatusSchema>;
export type PingResponse = z.infer<typeof pingResponseSchema>;
export type AuthenticatedPingResponse = z.infer<typeof authenticatedPingResponseSchema>;
