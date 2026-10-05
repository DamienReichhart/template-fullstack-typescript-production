'use client';

import { toNestErrors, validateFieldsNatively } from '@hookform/resolvers';
import { isApiError } from '@template/api-client';
import { useTranslations } from 'next-intl';
import { useCallback } from 'react';
import {
  useForm,
  type FieldError,
  type FieldErrors,
  type FieldValues,
  type Path,
  type Resolver,
  type UseFormProps,
  type UseFormReturn,
} from 'react-hook-form';
import type { z } from 'zod';

import { issueParams, translateIssue } from './translate-zod-issue';

type ZodForm<Values extends FieldValues> = UseFormReturn<Values> & {
  /** Maps API field errors (RFC 9457 `errors[]`) onto the form; returns true when any matched. */
  applyApiErrors: (error: unknown) => boolean;
};

/**
 * react-hook-form + a contract schema, with every validation message translated, whether
 * it comes from the browser-side schema or from the API's field errors.
 */
export function useZodForm<Schema extends z.ZodType<FieldValues, FieldValues>>(
  schema: Schema,
  options: Omit<UseFormProps<z.input<Schema>>, 'resolver'> = {},
): ZodForm<z.input<Schema>> {
  const t = useTranslations();

  // Same keys and params as the API's field errors, so both read identically.
  const resolver: Resolver<z.input<Schema>> = async (values, _context, options) => {
    const result = await schema.safeParseAsync(values);
    if (result.success) {
      if (options.shouldUseNativeValidation) validateFieldsNatively({}, options);
      return { values: result.data as z.input<Schema>, errors: {} };
    }
    const errors: Record<string, FieldError> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join('.');
      errors[path] ??= {
        type: issue.code,
        message: translateIssue(t as never, { message: issue.message, params: issueParams(issue) }),
      };
    }
    return { values: {}, errors: toNestErrors(errors, options) as FieldErrors<z.input<Schema>> };
  };

  const form = useForm<z.input<Schema>>({ mode: 'onTouched', ...options, resolver });

  const applyApiErrors = useCallback(
    (error: unknown): boolean => {
      if (!isApiError(error) || error.fieldErrors.length === 0) return false;
      for (const fieldError of error.fieldErrors) {
        form.setError(fieldError.path as Path<z.input<Schema>>, {
          type: 'server',
          message: translateIssue(t as never, fieldError),
        });
      }
      return true;
    },
    [form, t],
  );

  return Object.assign(form, { applyApiErrors });
}
