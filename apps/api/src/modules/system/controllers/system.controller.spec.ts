import 'reflect-metadata';

import { afterEach, describe, expect, it } from 'bun:test';
import type { INestApplication } from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { createTestApp } from '@template/testing';
import request from 'supertest';

import { SystemStatusService } from '../services/system-status.service.js';
import { SystemController } from './system.controller.js';

let app: INestApplication;

afterEach(async () => {
  await app.close();
});

const ping = {
  status: 'ok',
  version: '0.1.0',
  environment: 'test',
  uptimeSeconds: 3,
  timestamp: '2026-01-01T00:00:00.000Z',
  services: { database: { status: 'up', latencyMs: 1 }, redis: { status: 'up', latencyMs: 1 } },
};

describe('SystemController', () => {
  it('serves the ping under /api/v1/system/ping', async () => {
    app = await createTestApp({
      controllers: [SystemController],
      providers: [
        { provide: SystemStatusService, useValue: { ping: async () => ping } },
        { provide: QueryBus, useValue: {} },
      ],
    });

    const response = await request(app.getHttpServer()).get('/api/v1/system/ping');

    expect(response.status).toBe(200);
    expect(response.body).toEqual(ping);
  });
});
