import { Injectable } from '@nestjs/common';
import { PrismaService } from '@template/database';

import { DependencyIndicator } from './dependency-indicator.js';
import { measure, type DependencyStatus } from './dependency-status.js';

@Injectable()
export class PrismaIndicator extends DependencyIndicator {
  readonly name = 'database';

  constructor(private readonly prisma: PrismaService) {
    super();
  }

  check(): Promise<DependencyStatus> {
    return measure(() => this.prisma.$queryRaw`SELECT 1`);
  }
}
