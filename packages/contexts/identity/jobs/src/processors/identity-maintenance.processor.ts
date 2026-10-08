import { CommandBus } from '@nestjs/cqrs';
import {
  DeleteAvatarFileCommand,
  PurgeExpiredSessionsCommand,
} from '@template/identity-application';
import { onJob, Processor, TypedProcessor } from '@template/messaging';
import {
  deleteAvatarFileJob,
  identityMaintenanceQueue,
  purgeExpiredSessionsJob,
} from '@template/queue';

/** Consumes `identity-maintenance`: each job is translated into an application command. */
@Processor(identityMaintenanceQueue.name)
export class IdentityMaintenanceProcessor extends TypedProcessor {
  constructor(private readonly commands: CommandBus) {
    super();
  }

  protected handlers() {
    return [
      onJob(purgeExpiredSessionsJob, async () => {
        const purged = await this.commands.execute(new PurgeExpiredSessionsCommand());
        this.logger.log(purged, 'Purged ended sessions and one-time tokens');
        return purged;
      }),
      onJob(deleteAvatarFileJob, ({ avatarKey }) =>
        this.commands.execute(new DeleteAvatarFileCommand(avatarKey)),
      ),
    ];
  }
}
