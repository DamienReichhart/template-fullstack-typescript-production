import { Module } from '@nestjs/common';
import { ConfigModule as PlatformConfigModule } from '@template/config';

import { apiConfigDefinitions } from './api.config.ts';

@Module({
  imports: [PlatformConfigModule.forRoot({ definitions: apiConfigDefinitions })],
})
export class ConfigModule {}
