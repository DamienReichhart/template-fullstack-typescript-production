import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/**
 * The API only serves JSON, so its CSP forbids everything. The Swagger UI (dev only) is an
 * HTML page and gets a CSP that lets its own scripts and styles run.
 */
export function createHelmetMiddleware(docsPath: string) {
  const api = helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });
  const docs = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });
  return (request: Request, response: Response, next: NextFunction) =>
    request.path.startsWith(`/${docsPath}`)
      ? docs(request, response, next)
      : api(request, response, next);
}
