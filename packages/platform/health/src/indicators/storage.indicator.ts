import { Injectable } from '@nestjs/common';
import { ObjectStorage } from '@template/storage';

import { DependencyIndicator } from './dependency-indicator.ts';
import { measure, type DependencyStatus } from './dependency-status.ts';

@Injectable()
export class StorageIndicator extends DependencyIndicator {
  readonly name = 'storage';

  constructor(private readonly storage: ObjectStorage) {
    super();
  }

  check(): Promise<DependencyStatus> {
    return measure(() => this.storage.ping());
  }
}
