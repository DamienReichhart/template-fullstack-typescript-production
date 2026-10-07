import {
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type OnApplicationShutdown,
} from '@nestjs/common';
import { storageConfig } from '@template/config';

import { createS3Clients, type S3Clients, type StorageConfig } from './client/create-s3-clients.ts';
import { ObjectStorage } from './objects/object-storage.ts';
import { S3ObjectStorage } from './objects/s3-object-storage.ts';
import { S3_CLIENTS } from './storage.tokens.ts';
import { DirectUploads } from './uploads/direct-uploads.ts';

@Injectable()
class StorageLifecycle implements OnApplicationShutdown {
  constructor(@Inject(S3_CLIENTS) private readonly clients: S3Clients) {}

  onApplicationShutdown(): void {
    this.clients.internal.destroy();
    this.clients.signer.destroy();
  }
}

/**
 * The application's bucket as `ObjectStorage`, and `DirectUploads` for browser uploads.
 * Global: import once per app, after `ConfigModule` with `storageConfig`.
 */
@Module({})
export class StorageModule {
  static forRoot(): DynamicModule {
    return {
      module: StorageModule,
      global: true,
      providers: [
        {
          provide: S3_CLIENTS,
          inject: [storageConfig.token],
          useFactory: (config: StorageConfig) => createS3Clients(config),
        },
        {
          provide: ObjectStorage,
          inject: [S3_CLIENTS, storageConfig.token],
          useFactory: (clients: S3Clients, config: StorageConfig) =>
            new S3ObjectStorage(clients, config.S3_BUCKET),
        },
        DirectUploads,
        StorageLifecycle,
      ],
      exports: [ObjectStorage, DirectUploads, S3_CLIENTS],
    };
  }
}
