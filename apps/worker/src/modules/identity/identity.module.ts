import { Module } from '@nestjs/common';
import { IdentityApplicationModule } from '@template/identity-application';
import { IdentityInfrastructureModule } from '@template/identity-infrastructure';
import { IdentityJobsModule } from '@template/identity-jobs';

/** Identity housekeeping: consumes the `identity-maintenance` queue. */
@Module({
  imports: [
    IdentityJobsModule.register({
      application: IdentityApplicationModule.register({
        infrastructure: IdentityInfrastructureModule.forRoot(),
      }),
    }),
  ],
})
export class IdentityModule {}
