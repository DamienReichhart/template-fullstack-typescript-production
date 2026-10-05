import { timingSafeEqual } from 'node:crypto';

import { HttpStatus, Injectable, type CanActivate, type ExecutionContext } from '@nestjs/common';
import { AuthCookies, CommonErrorCode, HttpHeaders } from '@template/contracts/common';
import { ApiProblemException } from '@template/http';
import type { Request } from 'express';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function sameToken(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}

/**
 * Double-submit CSRF protection: state-changing requests must echo the readable CSRF cookie
 * in the `x-csrf-token` header. A cross-site page can make the browser send the cookie,
 * but cannot read it to set the header.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    if (context.getType() !== 'http') return true;
    const request = context.switchToHttp().getRequest<Request>();
    if (SAFE_METHODS.has(request.method)) return true;

    const cookie = (request.cookies as Record<string, string> | undefined)?.[AuthCookies.csrfToken];
    const header = request.header(HttpHeaders.csrfToken);
    if (!cookie || !header || !sameToken(cookie, header)) {
      throw new ApiProblemException(HttpStatus.FORBIDDEN, CommonErrorCode.csrfTokenInvalid);
    }
    return true;
  }
}
