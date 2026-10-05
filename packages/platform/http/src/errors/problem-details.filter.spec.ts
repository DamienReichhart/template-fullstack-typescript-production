import 'reflect-metadata';

import { afterAll, beforeAll, describe, expect, it } from 'bun:test';
import {
  Body,
  Controller,
  Get,
  Injectable,
  NotFoundException,
  Post,
  type INestApplication,
} from '@nestjs/common';
import { APP_FILTER, APP_PIPE, DiscoveryModule } from '@nestjs/core';
import { Test } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { createZodDto, ZodValidationPipe } from 'nestjs-zod';
import request from 'supertest';
import { z } from 'zod';

import { ApiProblemException } from './api-problem.exception.js';
import { DomainErrorMapper, type MappedError } from './error-mapper.js';
import { ProblemDetailsFilter } from './problem-details.filter.js';

class OutOfStockError extends Error {}

@Injectable()
class StockErrorMapper extends DomainErrorMapper {
  map(error: unknown): MappedError | undefined {
    return error instanceof OutOfStockError ? { status: 409, code: 'OUT_OF_STOCK' } : undefined;
  }
}

class OrderDto extends createZodDto(
  z.object({ quantity: z.number().int().min(1, 'validation.quantity.tooSmall') }),
) {}

@Controller()
class TestController {
  @Post('orders') create(@Body() body: OrderDto) {
    return body;
  }
  @Get('domain') domain() {
    throw new OutOfStockError('sold out');
  }
  @Get('not-found') notFound() {
    throw new NotFoundException();
  }
  @Get('throttled') throttled() {
    throw new HttpException('Too Many Requests', 429);
  }
  @Get('problem') problem() {
    throw new ApiProblemException(403, 'CSRF_TOKEN_INVALID', 'Missing token');
  }
  @Get('crash') crash() {
    throw new Error('secret internals');
  }
}

describe('ProblemDetailsFilter', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [DiscoveryModule],
      controllers: [TestController],
      providers: [
        StockErrorMapper,
        { provide: APP_FILTER, useClass: ProblemDetailsFilter },
        { provide: APP_PIPE, useClass: ZodValidationPipe },
      ],
    }).compile();
    app = moduleRef.createNestApplication({ logger: false });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('turns validation failures into field errors with translation keys and params', async () => {
    const response = await request(app.getHttpServer()).post('/orders').send({ quantity: 0 });
    expect(response.status).toBe(400);
    expect(response.headers['content-type']).toContain('application/problem+json');
    expect(response.body).toMatchObject({
      type: 'about:blank',
      status: 400,
      code: 'VALIDATION_FAILED',
      instance: '/orders',
      errors: [
        { path: 'quantity', message: 'validation.quantity.tooSmall', params: { minimum: 1 } },
      ],
    });
  });

  it('maps domain errors through the registered mappers', async () => {
    const response = await request(app.getHttpServer()).get('/domain');
    expect(response.body).toMatchObject({ status: 409, code: 'OUT_OF_STOCK', title: 'Conflict' });
  });

  it('maps framework HTTP exceptions to common codes', async () => {
    expect((await request(app.getHttpServer()).get('/not-found')).body.code).toBe('NOT_FOUND');
    expect((await request(app.getHttpServer()).get('/throttled')).body).toMatchObject({
      status: 429,
      code: 'RATE_LIMITED',
    });
  });

  it('keeps the code and detail of explicit API problems', async () => {
    const response = await request(app.getHttpServer()).get('/problem');
    expect(response.body).toMatchObject({
      status: 403,
      code: 'CSRF_TOKEN_INVALID',
      detail: 'Missing token',
    });
  });

  it('hides unknown errors behind an opaque 500', async () => {
    const response = await request(app.getHttpServer()).get('/crash');
    expect(response.status).toBe(500);
    expect(response.body.code).toBe('INTERNAL_ERROR');
    expect(JSON.stringify(response.body)).not.toContain('secret internals');
  });
});
