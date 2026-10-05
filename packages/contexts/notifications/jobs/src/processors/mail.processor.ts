import { CommandBus } from '@nestjs/cqrs';
import { onJob, Processor, TypedProcessor } from '@template/messaging';
import {
  SendEmailVerificationCommand,
  SendPasswordResetEmailCommand,
  SendWelcomeEmailCommand,
} from '@template/notifications-application';
import {
  mailQueue,
  sendEmailVerificationJob,
  sendPasswordResetEmailJob,
  sendWelcomeEmailJob,
} from '@template/queue';
import type { Job } from 'bullmq';

/** Retries of the same job share a key, so the provider sends the email at most once. */
const idempotencyKey = (job: Job) => `${job.name}:${job.id}`;

/** Consumes the `mail` queue: one application command per job. */
@Processor(mailQueue.name)
export class MailProcessor extends TypedProcessor {
  constructor(private readonly commands: CommandBus) {
    super();
  }

  protected handlers() {
    return [
      onJob(sendWelcomeEmailJob, (payload, job) =>
        this.commands.execute(
          new SendWelcomeEmailCommand(
            payload.email,
            payload.name,
            payload.locale,
            idempotencyKey(job),
          ),
        ),
      ),
      onJob(sendEmailVerificationJob, (payload, job) =>
        this.commands.execute(
          new SendEmailVerificationCommand(
            payload.email,
            payload.name,
            payload.locale,
            payload.token,
            new Date(payload.expiresAt),
            idempotencyKey(job),
          ),
        ),
      ),
      onJob(sendPasswordResetEmailJob, (payload, job) =>
        this.commands.execute(
          new SendPasswordResetEmailCommand(
            payload.email,
            payload.name,
            payload.locale,
            payload.token,
            new Date(payload.expiresAt),
            idempotencyKey(job),
          ),
        ),
      ),
    ];
  }
}
