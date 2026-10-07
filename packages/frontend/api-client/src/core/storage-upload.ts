import { ApiError, ClientErrorCode } from './api-error.ts';
import type { FetchLike } from './http-client.ts';

/** A presigned form upload, as the api hands it out (`url` + `fields`). */
export interface StorageUploadTicket {
  url: string;
  fields: Record<string, string>;
}

export interface StorageUploadOptions {
  fetch?: FetchLike;
  signal?: AbortSignal;
}

/**
 * Sends a file straight to object storage with a presigned form. Never through the api, and
 * never with credentials: the bucket is another origin and must not see the session cookies.
 * The storage enforces the size and type signed into the ticket; a refusal is an `ApiError`
 * with code `UPLOAD_FAILED`.
 */
export async function uploadToStorage(
  ticket: StorageUploadTicket,
  file: Blob,
  { fetch: fetchImpl = (input, init) => fetch(input, init), signal }: StorageUploadOptions = {},
): Promise<void> {
  const form = new FormData();
  for (const [name, value] of Object.entries(ticket.fields)) form.append(name, value);
  // S3 ignores every field after the file: it must come last.
  form.append('file', file);

  let response: Response;
  try {
    response = await fetchImpl(ticket.url, {
      method: 'POST',
      body: form,
      credentials: 'omit',
      signal,
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw ApiError.network();
  }
  if (!response.ok) throw new ApiError(response.status, ClientErrorCode.uploadFailed);
}
