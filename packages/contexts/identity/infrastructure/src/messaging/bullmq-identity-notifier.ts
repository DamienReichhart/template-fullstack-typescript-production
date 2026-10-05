import { Injectable } from '@nestjs/common';
import { IdentityNotifier, type Recipient } from '@template/identity-application';
import { JobProducer } from '@template/messaging';
import {
  sendEmailVerificationJob,
  sendPasswordResetEmailJob,
  sendWelcomeEmailJob,
} from '@template/queue';

/** Hands emails over to the notifications context through the `mail` queue. */
@Injectable()
export class BullMqIdentityNotifier extends IdentityNotifier {
  constructor(private readonly jobs: JobProducer) {
    super();
  }

  async sendWelcome(recipient: Recipient): Promise<void> {
    await this.jobs.enqueue(sendWelcomeEmailJob, recipient);
  }

  async sendEmailVerification(recipient: Recipient, token: string, expiresAt: Date): Promise<void> {
    await this.jobs.enqueue(sendEmailVerificationJob, {
      ...recipient,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  }

  async sendPasswordReset(recipient: Recipient, token: string, expiresAt: Date): Promise<void> {
    await this.jobs.enqueue(sendPasswordResetEmailJob, {
      ...recipient,
      token,
      expiresAt: expiresAt.toISOString(),
    });
  }
}
