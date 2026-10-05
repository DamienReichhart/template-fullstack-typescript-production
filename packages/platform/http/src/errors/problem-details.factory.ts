import { STATUS_CODES } from 'node:http';

import type { FieldError, ProblemDetails } from '@template/contracts/common';

export interface ProblemInput {
  status: number;
  code: string;
  detail?: string;
  instance?: string;
  requestId?: string;
  errors?: FieldError[];
}

/** Builds an RFC 9457 body. `type` stays `about:blank`: `code` carries the semantics. */
export function createProblem({ status, ...rest }: ProblemInput): ProblemDetails {
  return {
    type: 'about:blank',
    title: STATUS_CODES[status] ?? 'Error',
    status,
    ...Object.fromEntries(Object.entries(rest).filter(([, value]) => value !== undefined)),
    code: rest.code,
  };
}
