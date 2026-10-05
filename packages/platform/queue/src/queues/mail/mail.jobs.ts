import { z } from 'zod';

import { defineJob } from '../../core/define-job.js';
import { mailQueue } from './mail.queue.js';

const recipient = {
  email: z.email(),
  name: z.string().min(1),
  locale: z.string().min(2),
};

export const sendWelcomeEmailJob = defineJob(
  mailQueue,
  'send-welcome-email',
  z.object({ ...recipient }),
);

export const sendEmailVerificationJob = defineJob(
  mailQueue,
  'send-email-verification',
  z.object({ ...recipient, token: z.string().min(1), expiresAt: z.iso.datetime() }),
);

export const sendPasswordResetEmailJob = defineJob(
  mailQueue,
  'send-password-reset-email',
  z.object({ ...recipient, token: z.string().min(1), expiresAt: z.iso.datetime() }),
);
