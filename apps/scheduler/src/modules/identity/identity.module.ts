import { Module } from '@nestjs/common';
import { MessagingModule } from '@template/messaging';

import { identityMaintenanceSchedules } from './schedules/identity-maintenance.schedules.ts';

/** Declares the identity context's recurring jobs. */
@Module({
  imports: [MessagingModule.registerSchedules(...identityMaintenanceSchedules)],
})
export class IdentityModule {}
