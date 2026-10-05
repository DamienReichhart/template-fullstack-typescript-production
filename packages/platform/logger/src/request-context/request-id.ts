import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

import { HttpHeaders } from '@template/contracts/common';

const SAFE_REQUEST_ID = /^[\w.-]{1,128}$/;

/**
 * Reuses the caller's `x-request-id` when it is safe to log (so a trace spans services),
 * otherwise generates one. The id is echoed back so clients can quote it in bug reports.
 */
export function resolveRequestId(request: IncomingMessage, response: ServerResponse): string {
  const header = request.headers[HttpHeaders.requestId];
  const candidate = Array.isArray(header) ? header[0] : header;
  const requestId = candidate && SAFE_REQUEST_ID.test(candidate) ? candidate : randomUUID();
  response.setHeader(HttpHeaders.requestId, requestId);
  return requestId;
}
