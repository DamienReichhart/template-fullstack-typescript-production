import { Module } from '@nestjs/common';
import { ConfigModule as PlatformConfigModule } from '@template/config';

import { workerConfigDefinitions } from './worker.config.ts';

@Module({
  imports: [PlatformConfigModule.forRoot({ definitions: workerConfigDefinitions })],
})
export class ConfigModule {}
