'use client';

import { isApiError } from '@template/api-client';
import { CommonErrorCode } from '@template/contracts/common';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Form-level error: the translated `code` of an API problem. Field-level validation errors
 * are shown next to their fields instead.
 */
export function FormError({ error }: { error: unknown }) {
  const t = useTranslations('errors');
  if (!error) return null;
  if (
    isApiError(error) &&
    error.code === CommonErrorCode.validationFailed &&
    error.fieldErrors.length > 0
  )
    return null;

  const code = isApiError(error) && t.has(error.code as never) ? error.code : 'UNKNOWN';
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertDescription>{t(code as never)}</AlertDescription>
    </Alert>
  );
}
