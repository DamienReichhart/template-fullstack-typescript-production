import { Module } from '@nestjs/common';
import { CqrsModule as NestCqrsModule } from '@nestjs/cqrs';

/** The command, query and event buses, shared by every bounded context of the app. */
@Module({
  imports: [NestCqrsModule.forRoot()],
})
export class CqrsModule {}
