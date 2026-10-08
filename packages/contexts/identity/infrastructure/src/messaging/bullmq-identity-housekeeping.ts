import { Injectable } from '@nestjs/common';
import { IdentityHousekeeping } from '@template/identity-application';
import { JobProducer } from '@template/messaging';
import { deleteAvatarFileJob } from '@template/queue';

/** Hands housekeeping to the worker through the `identity-maintenance` queue. */
@Injectable()
export class BullMqIdentityHousekeeping extends IdentityHousekeeping {
  constructor(private readonly jobs: JobProducer) {
    super();
  }

  async deleteAvatarFile(avatarKey: string): Promise<void> {
    await this.jobs.enqueue(deleteAvatarFileJob, { avatarKey });
  }
}
