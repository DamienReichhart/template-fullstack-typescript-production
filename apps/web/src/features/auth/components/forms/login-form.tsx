'use client';

import { loginRequestSchema } from '@template/contracts/identity';
import { Form, FormControl, FormItem, FormLabel } from '@template/ui/components/form/form';
import { FormField } from '@template/ui/components/form/form-field';
import { FormMessage } from '@template/ui/components/form/form-message';
import { PasswordInput } from '@template/ui/components/password-input';
import { Spinner } from '@template/ui/components/spinner';
import { Button } from '@template/ui/primitives/button';
import { Input } from '@template/ui/primitives/input';
import { useTranslations } from 'next-intl';

import { Link } from '@/i18n/navigation';
import { AppRoutes } from '@/shared/config/app-routes';
import { FormError } from '@/shared/forms/form-error';
import { useZodForm } from '@/shared/forms/use-zod-form';

import { useLogin } from '../../hooks/use-login';

export function LoginForm() {
  const t = useTranslations('auth');
  const form = useZodForm(loginRequestSchema, { defaultValues: { email: '', password: '' } });
  const login = useLogin();

  const onSubmit = form.handleSubmit((values) =>
    login.mutate(values, { onError: form.applyApiErrors }),
  );

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError error={login.error} />
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t('fields.password')}</FormLabel>
                <Link
                  href={AppRoutes.forgotPassword}
                  className="text-sm text-muted-foreground hover:underline"
                >
                  {t('login.forgotPassword')}
                </Link>
              </div>
              <FormControl>
                <PasswordInput
                  autoComplete="current-password"
                  showLabel={t('fields.showPassword')}
                  hideLabel={t('fields.hidePassword')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={login.isPending}>
          {login.isPending ? <Spinner /> : null}
          {t('login.submit')}
        </Button>
      </form>
    </Form>
  );
}
