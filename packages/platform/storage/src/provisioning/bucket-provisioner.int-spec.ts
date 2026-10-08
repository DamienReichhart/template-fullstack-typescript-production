import { afterAll, describe, expect, it } from 'bun:test';
import { randomUUID } from 'node:crypto';

import {
  DeleteBucketCommand,
  GetBucketCorsCommand,
  GetBucketLifecycleConfigurationCommand,
  PutBucketLifecycleConfigurationCommand,
} from '@aws-sdk/client-s3';

import { createStorageTestContext } from '../testing/storage-test-context.ts';
import { provisionBucket } from './bucket-provisioner.ts';

const context = createStorageTestContext();
const client = context.clients.internal;
const bucket = `provision-${randomUUID().slice(0, 8)}`;
const options = {
  bucket,
  region: context.config.S3_REGION,
  corsOrigins: ['http://localhost:3000'],
};

afterAll(async () => {
  await client.send(new DeleteBucketCommand({ Bucket: bucket })).catch(() => undefined);
  context.close();
});

describe('provisionBucket against RustFS', () => {
  it('creates the bucket with CORS and lifecycle rules, then converges idempotently', async () => {
    expect(await provisionBucket(client, options)).toEqual(['created', 'cors', 'lifecycle']);

    const cors = await client.send(new GetBucketCorsCommand({ Bucket: bucket }));
    expect(cors.CORSRules?.[0]?.AllowedOrigins).toEqual(['http://localhost:3000']);

    // Someone adds their own rule: provisioning again must keep it.
    const { Rules = [] } = await client.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }),
    );
    await client.send(
      new PutBucketLifecycleConfigurationCommand({
        Bucket: bucket,
        LifecycleConfiguration: {
          Rules: [
            ...Rules,
            {
              ID: 'ops-archive',
              Status: 'Enabled',
              Filter: { Prefix: 'logs/' },
              Expiration: { Days: 30 },
            },
          ],
        },
      }),
    );

    expect(await provisionBucket(client, options)).toEqual(['exists', 'cors', 'lifecycle']);
    const lifecycle = await client.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }),
    );
    expect(lifecycle.Rules?.map((rule) => rule.ID).sort()).toEqual([
      'abort-incomplete-multipart-uploads',
      'expire-staged-uploads',
      'ops-archive',
    ]);
  });
});
