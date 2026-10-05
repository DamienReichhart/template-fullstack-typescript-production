import { Module } from '@nestjs/common';
import { DatabaseModule as PlatformDatabaseModule } from '@template/database';

@Module({
  imports: [PlatformDatabaseModule.forRoot()],
})
export class DatabaseModule {}
