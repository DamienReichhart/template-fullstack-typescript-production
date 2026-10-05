'use client';

import { forgotPasswordRequestSchema } from '@template/contracts/identity';
import { Form, FormControl, FormItem, FormLabel } from '@template/ui/components/form/form';
import { FormField } from '@template/ui/components/form/form-field';
import { FormMessage } from '@template/ui/components/form/form-message';
import { Spinner } from '@template/ui/components/spinner';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import { Input } from '@template/ui/primitives/input';
import { MailCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { FormError } from '@/shared/forms/form-error';
import { useZodForm } from '@/shared/forms/use-zod-form';

import { useForgotPassword } from '../../hooks/use-forgot-password';

export function ForgotPasswordForm() {
  const t = useTranslations('auth');
  const form = useZodForm(forgotPasswordRequestSchema, { defaultValues: { email: '' } });
  const forgotPassword = useForgotPassword();

  if (forgotPassword.isSuccess) {
    return (
      <Alert variant="success">
        <MailCheck />
        <AlertDescription>{t('forgotPassword.sent')}</AlertDescription>
      </Alert>
    );
  }

  const onSubmit = form.handleSubmit((values) =>
    forgotPassword.mutate(values, { onError: form.applyApiErrors }),
  );
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError error={forgotPassword.error} />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.email')}</FormLabel>
              <FormControl>
                <Input type="email" autoComplete="email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={forgotPassword.isPending}>
          {forgotPassword.isPending ? <Spinner /> : null}
          {t('forgotPassword.submit')}
        </Button>
      </form>
    </Form>
  );
}
