'use client';

import { Form, FormControl, FormItem, FormLabel } from '@template/ui/components/form/form';
import { FormField } from '@template/ui/components/form/form-field';
import { FormMessage } from '@template/ui/components/form/form-message';
import { PasswordInput } from '@template/ui/components/password-input';
import { Spinner } from '@template/ui/components/spinner';
import { Alert, AlertDescription } from '@template/ui/primitives/alert';
import { Button } from '@template/ui/primitives/button';
import { CheckCircle2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';
import { FormError } from '@/shared/forms/form-error';
import { useZodForm } from '@/shared/forms/use-zod-form';

import { useResetPassword } from '../../hooks/use-reset-password';
import { resetPasswordFormSchema } from '../../schemas/reset-password-form.schema';

export function ResetPasswordForm({ token }: { token: string }) {
  const t = useTranslations('auth');
  const form = useZodForm(resetPasswordFormSchema, {
    defaultValues: { password: '', confirmPassword: '' },
  });
  const resetPassword = useResetPassword();
  const passwordLabels = {
    showLabel: t('fields.showPassword'),
    hideLabel: t('fields.hidePassword'),
  };

  if (resetPassword.isSuccess) {
    return (
      <div className="grid gap-4">
        <Alert variant="success">
          <CheckCircle2 />
          <AlertDescription>{t('resetPassword.success')}</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href={AppRoutes.login}>{t('resetPassword.backToLogin')}</Link>
        </Button>
      </div>
    );
  }

  const onSubmit = form.handleSubmit(({ password }) =>
    resetPassword.mutate({ token, password }, { onError: form.applyApiErrors }),
  );
  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError error={resetPassword.error} />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.newPassword')}</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...passwordLabels} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.confirmPassword')}</FormLabel>
              <FormControl>
                <PasswordInput autoComplete="new-password" {...passwordLabels} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={resetPassword.isPending}>
          {resetPassword.isPending ? <Spinner /> : null}
          {t('resetPassword.submit')}
        </Button>
      </form>
    </Form>
  );
}
