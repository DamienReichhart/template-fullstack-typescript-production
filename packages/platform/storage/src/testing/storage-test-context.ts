import { loadConfig, storageConfig } from '@template/config';

import { createS3Clients } from '../client/create-s3-clients.ts';
import { S3ObjectStorage } from '../objects/s3-object-storage.ts';

/**
 * Real object storage for integration tests: the `S3_TEST_BUCKET` bucket of the docker
 * compose RustFS (`nx run storage:provision-test` creates it). `reset()` empties it.
 */
export function createStorageTestContext() {
  const { storage: config } = loadConfig([storageConfig], {
    ...process.env,
    S3_BUCKET: process.env['S3_TEST_BUCKET'],
  });
  const clients = createS3Clients(config);
  const storage = new S3ObjectStorage(clients, config.S3_BUCKET);
  return {
    config,
    clients,
    storage,
    reset: () => storage.deletePrefix(''),
    close: () => {
      clients.internal.destroy();
      clients.signer.destroy();
    },
  };
}

/** Posts `file` with a presigned form, as a browser would. Returns the storage's response. */
export async function postPresignedForm(
  upload: { url: string; fields: Record<string, string> },
  file: Blob,
): Promise<Response> {
  const form = new FormData();
  for (const [name, value] of Object.entries(upload.fields)) form.append(name, value);
  form.append('file', file);
  return fetch(upload.url, { method: 'POST', body: form });
}
