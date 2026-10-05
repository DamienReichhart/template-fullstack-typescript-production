import { createServer, type Server } from 'node:http';

import type { DependencyStatus } from '../indicators/dependency-status.js';

export interface ProbeServerOptions {
  port: number;
  dependencies: () => Promise<Record<string, DependencyStatus>>;
}

/**
 * A minimal HTTP server for runnables without an HTTP API (worker, scheduler), so the
 * orchestrator can probe them like any other service: `GET /live` and `GET /ready`.
 */
export class ProbeServer {
  #server: Server | undefined;

  constructor(private readonly options: ProbeServerOptions) {}

  async start(): Promise<number> {
    this.#server = createServer(async (request, response) => {
      const reply = (status: number, body: unknown) => {
        response
          .writeHead(status, { 'content-type': 'application/json' })
          .end(JSON.stringify(body));
      };
      if (request.method !== 'GET') return reply(405, { status: 'error' });
      if (request.url === '/live') return reply(200, { status: 'ok' });
      if (request.url === '/ready') {
        const dependencies = await this.options.dependencies();
        const ready = Object.values(dependencies).every((dependency) => dependency.status === 'up');
        return reply(ready ? 200 : 503, { status: ready ? 'ok' : 'error', dependencies });
      }
      return reply(404, { status: 'error' });
    });
    await new Promise<void>((resolve) => this.#server?.listen(this.options.port, resolve));
    const address = this.#server.address();
    return typeof address === 'object' && address ? address.port : this.options.port;
  }

  async stop(): Promise<void> {
    await new Promise<void>((resolve) =>
      this.#server ? this.#server.close(() => resolve()) : resolve(),
    );
  }
}
