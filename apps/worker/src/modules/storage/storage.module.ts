import { Module } from '@nestjs/common';
import { StorageModule as PlatformStorageModule } from '@template/storage';

/** The object storage bucket, for jobs that write or delete files. */
@Module({
  imports: [PlatformStorageModule.forRoot()],
})
export class StorageModule {}
