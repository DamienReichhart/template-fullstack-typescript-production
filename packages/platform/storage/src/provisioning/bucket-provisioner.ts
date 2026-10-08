import {
  CreateBucketCommand,
  GetBucketLifecycleConfigurationCommand,
  HeadBucketCommand,
  PutBucketCorsCommand,
  PutBucketLifecycleConfigurationCommand,
  type LifecycleRule,
  type S3Client,
} from '@aws-sdk/client-s3';

import { STAGING_PREFIX } from '../uploads/direct-uploads.ts';

export interface BucketProvisioningOptions {
  bucket: string;
  region: string;
  /** Web origins allowed to upload to and download from the bucket directly. */
  corsOrigins: readonly string[];
  /** Days before a staged upload nobody claimed is deleted. */
  stagingExpirationDays?: number;
}

export type ProvisioningStep = 'created' | 'exists' | 'cors' | 'lifecycle';

/** Lifecycle rules this code owns, by id. Rules with other ids are left as they are. */
export const MANAGED_RULE_IDS = ['expire-staged-uploads', 'abort-incomplete-multipart-uploads'];

const errorName = (error: unknown) => (error as { name?: string } | undefined)?.name;
const isNotFound = (error: unknown) =>
  (error as { $metadata?: { httpStatusCode?: number } }).$metadata?.httpStatusCode === 404 ||
  errorName(error) === 'NotFound' ||
  errorName(error) === 'NoSuchBucket';

/**
 * Makes a bucket match what the application needs, idempotently: exists, accepts browser
 * uploads from `corsOrigins`, expires abandoned uploads. Run with credentials that may
 * administer the bucket (`bun run storage:provision`), never with the app's own.
 */
export async function provisionBucket(
  client: S3Client,
  { bucket, region, corsOrigins, stagingExpirationDays = 1 }: BucketProvisioningOptions,
): Promise<ProvisioningStep[]> {
  const steps: ProvisioningStep[] = [];

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
    steps.push('exists');
  } catch (error) {
    if (!isNotFound(error)) throw error;
    try {
      await client.send(
        new CreateBucketCommand({
          Bucket: bucket,
          // us-east-1 is the one region S3 refuses as an explicit location constraint.
          CreateBucketConfiguration:
            region === 'us-east-1' ? undefined : { LocationConstraint: region as never },
        }),
      );
      steps.push('created');
    } catch (createError) {
      if (errorName(createError) !== 'BucketAlreadyOwnedByYou') throw createError;
      steps.push('exists');
    }
  }

  if (corsOrigins.length > 0) {
    await client.send(
      new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
          CORSRules: [
            {
              AllowedOrigins: [...corsOrigins],
              AllowedMethods: ['GET', 'HEAD', 'POST'],
              AllowedHeaders: ['*'],
              ExposeHeaders: ['ETag'],
              MaxAgeSeconds: 3600,
            },
          ],
        },
      }),
    );
    steps.push('cors');
  }

  const managed: LifecycleRule[] = [
    {
      ID: MANAGED_RULE_IDS[0],
      Status: 'Enabled',
      Filter: { Prefix: `${STAGING_PREFIX}/` },
      Expiration: { Days: stagingExpirationDays },
    },
    {
      ID: MANAGED_RULE_IDS[1],
      Status: 'Enabled',
      Filter: { Prefix: '' },
      AbortIncompleteMultipartUpload: { DaysAfterInitiation: 1 },
    },
  ];
  // The lifecycle configuration is replaced as a whole: keep the rules someone else added.
  const foreign = (await currentLifecycleRules(client, bucket)).filter(
    (rule) => !MANAGED_RULE_IDS.includes(rule.ID ?? ''),
  );
  await client.send(
    new PutBucketLifecycleConfigurationCommand({
      Bucket: bucket,
      LifecycleConfiguration: { Rules: [...foreign, ...managed] },
    }),
  );
  steps.push('lifecycle');

  return steps;
}

async function currentLifecycleRules(client: S3Client, bucket: string): Promise<LifecycleRule[]> {
  try {
    const output = await client.send(
      new GetBucketLifecycleConfigurationCommand({ Bucket: bucket }),
    );
    return output.Rules ?? [];
  } catch (error) {
    if (errorName(error) === 'NoSuchLifecycleConfiguration' || isNotFound(error)) return [];
    throw error;
  }
}
