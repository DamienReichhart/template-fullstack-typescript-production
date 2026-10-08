import { Module } from '@nestjs/common';
import { StorageModule as PlatformStorageModule } from '@template/storage';

/** The object storage bucket (`ObjectStorage`) and browser uploads (`DirectUploads`). */
@Module({
  imports: [PlatformStorageModule.forRoot()],
})
export class StorageModule {}
