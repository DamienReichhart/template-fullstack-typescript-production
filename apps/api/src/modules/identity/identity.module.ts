import { Module } from '@nestjs/common';
import { IdentityApplicationModule } from '@template/identity-application';
import { IdentityHttpModule } from '@template/identity-http';
import { IdentityInfrastructureModule } from '@template/identity-infrastructure';

const identity = IdentityHttpModule.register({
  application: IdentityApplicationModule.register({
    infrastructure: IdentityInfrastructureModule.forRoot(),
  }),
});

/** The identity context, wired for HTTP: `/api/v1/auth/*`, `/api/v1/me` and the auth guards. */
@Module({
  imports: [identity],
  exports: [identity],
})
export class IdentityModule {}
