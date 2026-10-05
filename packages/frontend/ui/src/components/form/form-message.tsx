'use client';

import type { ComponentProps } from 'react';

import { cn } from '../../lib/cn.ts';
import { useFormField } from './form.tsx';

/**
 * The field's error message, or `children` when the field is valid. Messages arrive already
 * translated: this package knows nothing about i18n.
 */
export function FormMessage({ className, children, ...props }: ComponentProps<'p'>) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error.message ?? '') : children;
  if (!body) return null;
  return (
    <p
      data-slot="form-message"
      id={formMessageId}
      className={cn('text-sm text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
}
