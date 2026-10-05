import { Module } from '@nestjs/common';
import { LoggerModule as PlatformLoggerModule } from '@template/logger';

@Module({
  imports: [PlatformLoggerModule.forRoot({ service: 'worker' })],
})
export class LoggerModule {}
