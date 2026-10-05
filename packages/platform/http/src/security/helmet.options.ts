import type { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';

/**
 * The API only serves JSON, so its CSP forbids everything. HTML tools mounted on the API
 * (Swagger UI, Bull Board) get a CSP that lets their own scripts and styles run.
 */
export function createHelmetMiddleware(uiPaths: readonly string[]) {
  const api = helmet({
    contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
    crossOriginResourcePolicy: { policy: 'same-site' },
  });
  const ui = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:'],
      },
    },
  });
  return (request: Request, response: Response, next: NextFunction) =>
    uiPaths.some((path) => request.path.startsWith(path))
      ? ui(request, response, next)
      : api(request, response, next);
}
