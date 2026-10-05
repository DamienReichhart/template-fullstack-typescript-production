import { Module } from '@nestjs/common';
import { ConfigModule as PlatformConfigModule } from '@template/config';

import { schedulerConfigDefinitions } from './scheduler.config.ts';

@Module({
  imports: [PlatformConfigModule.forRoot({ definitions: schedulerConfigDefinitions })],
})
export class ConfigModule {}
