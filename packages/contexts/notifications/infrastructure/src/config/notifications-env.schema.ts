import { defineConfig, type ConfigType } from '@template/config';
import { z } from 'zod';

export const MAIL_TRANSPORTS = ['resend', 'console', 'capture'] as const;
export type MailTransport = (typeof MAIL_TRANSPORTS)[number];

export const notificationsConfig = defineConfig(
  'notifications',
  z
    .object({
      MAIL_TRANSPORT: z.enum(MAIL_TRANSPORTS).default('resend'),
      RESEND_API_KEY: z.string().optional(),
      MAIL_FROM: z.string().min(3),
      WEB_APP_URL: z.url(),
    })
    .superRefine((env, context) => {
      if (env.MAIL_TRANSPORT === 'resend' && !env.RESEND_API_KEY) {
        context.addIssue({
          code: 'custom',
          path: ['RESEND_API_KEY'],
          message: 'required when MAIL_TRANSPORT=resend (or set MAIL_TRANSPORT=console)',
        });
      }
    }),
);

export type NotificationsConfig = ConfigType<typeof notificationsConfig>;
