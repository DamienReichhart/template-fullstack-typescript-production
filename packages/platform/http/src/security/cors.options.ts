import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface.js';
import { HttpHeaders } from '@template/contracts/common';

/** Credentials (cookies) are only accepted from the explicit allow-list. */
export function createCorsOptions(allowedOrigins: readonly string[]): CorsOptions {
  return {
    origin: (origin, callback) => {
      // Same-origin and server-to-server requests carry no Origin header.
      callback(null, !origin || allowedOrigins.includes(origin));
    },
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['content-type', HttpHeaders.csrfToken, HttpHeaders.requestId],
    exposedHeaders: [HttpHeaders.requestId],
    maxAge: 600,
  };
}
