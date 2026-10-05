import { Module } from '@nestjs/common';
import { MessagingModule as PlatformMessagingModule } from '@template/messaging';

/** The api only produces jobs: queues are registered by the modules that enqueue into them. */
@Module({
  imports: [PlatformMessagingModule.forRoot({ connectionName: 'api' })],
})
export class MessagingModule {}
