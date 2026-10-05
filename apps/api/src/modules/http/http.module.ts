import { Module } from '@nestjs/common';
import { HttpModule as PlatformHttpModule } from '@template/http';

/** RFC 9457 errors, Zod validation and the Redis-backed rate limiter, app-wide. */
@Module({
  imports: [PlatformHttpModule.forRoot()],
})
export class HttpModule {}
