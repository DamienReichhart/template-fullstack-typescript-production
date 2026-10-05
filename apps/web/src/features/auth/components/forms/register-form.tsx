'use client';

import { Form, FormControl, FormItem, FormLabel } from '@template/ui/components/form/form';
import { FormField } from '@template/ui/components/form/form-field';
import { FormMessage } from '@template/ui/components/form/form-message';
import { PasswordInput } from '@template/ui/components/password-input';
import { Spinner } from '@template/ui/components/spinner';
import { Button } from '@template/ui/primitives/button';
import { Input } from '@template/ui/primitives/input';
import { useTranslations } from 'next-intl';

import { FormError } from '@/shared/forms/form-error';
import { useZodForm } from '@/shared/forms/use-zod-form';

import { useRegister } from '../../hooks/use-register';
import { registerFormSchema } from '../../schemas/register-form.schema';

export function RegisterForm() {
  const t = useTranslations('auth');
  const form = useZodForm(registerFormSchema, {
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });
  const register = useRegister();

  const onSubmit = form.handleSubmit((values) =>
    register.mutate(values, { onError: form.applyApiErrors }),
  );
  const passwordLabels = {
    showLabel: t('fields.showPassword'),
    hideLabel: t('fields.hidePassword'),
  };

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} noValidate className="grid gap-4">
        <FormError error={register.error} />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('fields.name')}</FormLabel>
              <FormControl>
                <Input autoComplete="name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
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
              <FormLabel>{t('fields.password')}</FormLabel>
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
        <Button type="submit" disabled={register.isPending}>
          {register.isPending ? <Spinner /> : null}
          {t('register.submit')}
        </Button>
      </form>
    </Form>
  );
}
