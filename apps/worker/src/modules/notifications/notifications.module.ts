import { Module } from '@nestjs/common';
import { NotificationsApplicationModule } from '@template/notifications-application';
import { NotificationsInfrastructureModule } from '@template/notifications-infrastructure';
import { NotificationsJobsModule } from '@template/notifications-jobs';

/** Transactional emails: consumes the `mail` queue, delivers through `MAIL_TRANSPORT`. */
@Module({
  imports: [
    NotificationsJobsModule.register({
      application: NotificationsApplicationModule.register({
        infrastructure: NotificationsInfrastructureModule.forRoot(),
      }),
    }),
  ],
})
export class NotificationsModule {}
