import { Module } from '@nestjs/common';
import { ConfigModule as PlatformConfigModule } from '@template/config';

import { apiConfigDefinitions } from './api.config.js';

@Module({
  imports: [PlatformConfigModule.forRoot({ definitions: apiConfigDefinitions })],
})
export class ConfigModule {}
