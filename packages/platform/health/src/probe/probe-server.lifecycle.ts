import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
  type OnApplicationShutdown,
} from '@nestjs/common';

import { ReadinessService } from '../readiness/readiness.service.ts';
import { ProbeServer } from './probe-server.ts';

export const PROBE_PORT = Symbol.for('template:probe-port');

@Injectable()
export class ProbeServerLifecycle implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly logger = new Logger('ProbeServer');
  private readonly server: ProbeServer;

  constructor(@Inject(PROBE_PORT) port: number, readiness: ReadinessService) {
    this.server = new ProbeServer({ port, dependencies: () => readiness.required() });
  }

  async onApplicationBootstrap(): Promise<void> {
    const port = await this.server.start();
    this.logger.log(`Health probes listening on :${port} (/live, /ready)`);
  }

  async onApplicationShutdown(): Promise<void> {
    await this.server.stop();
  }
}
