/**
 * Creates or updates the bucket from the environment: `bun run storage:provision`.
 * `--test` targets `S3_TEST_BUCKET` instead (integration suites).
 *
 * Idempotent: run it after `docker:up` locally, and once per environment (or from your
 * infrastructure code) in production, with credentials allowed to administer the bucket.
 */
import { commaSeparatedList, loadConfig, storageConfig } from '@template/config';
import { z } from 'zod';

import { createS3Clients } from '../client/create-s3-clients.ts';
import { provisionBucket } from '../provisioning/bucket-provisioner.ts';

const test = process.argv.includes('--test');
const env = { ...process.env };
if (test) env['S3_BUCKET'] = env['S3_TEST_BUCKET'];

const { storage } = loadConfig([storageConfig], env);
// Browsers on these origins upload to and download from the bucket: the web app's origins.
const { CORS_ORIGINS: corsOrigins } = z
  .object({ CORS_ORIGINS: commaSeparatedList().default([]) })
  .parse(env);

const { internal } = createS3Clients(storage);
try {
  const steps = await provisionBucket(internal, {
    bucket: storage.S3_BUCKET,
    region: storage.S3_REGION,
    corsOrigins,
  });
  console.log(`✔ Bucket "${storage.S3_BUCKET}" provisioned (${steps.join(', ')})`);
} catch (error) {
  console.error(
    `✖ Could not provision bucket "${storage.S3_BUCKET}" at ${storage.S3_ENDPOINT ?? 'AWS'}`,
  );
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
} finally {
  internal.destroy();
}
