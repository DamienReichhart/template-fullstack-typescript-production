import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test';
import { cleanup, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { renderWithProviders } from '@/shared/testing/render-with-providers';

import { RegisterForm } from './register-form';

let fetchMock: ReturnType<typeof mock>;

beforeEach(() => {
  document.cookie = 'tpl_csrf=test-csrf';
  fetchMock = mock(async () => new Response('{}', { status: 200 }));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
});

afterEach(cleanup);

async function fill(password: string, confirmation: string) {
  await userEvent.type(screen.getByLabelText('Name'), 'Ada');
  await userEvent.type(screen.getByLabelText('Email'), 'ada@example.com');
  await userEvent.type(screen.getByLabelText('Password'), password);
  await userEvent.type(screen.getByLabelText('Confirm password'), confirmation);
  await userEvent.click(screen.getByRole('button', { name: 'Create account' }));
}

describe('RegisterForm', () => {
  it('enforces the password policy of the contract, in the user language', async () => {
    await renderWithProviders(<RegisterForm />, { locale: 'fr' });

    await userEvent.type(screen.getByLabelText('Mot de passe'), 'short');
    await userEvent.click(screen.getByRole('button', { name: 'Créer le compte' }));

    expect(await screen.findByText('Utilisez au moins 12 caractères.')).toBeTruthy();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('requires matching passwords', async () => {
    await renderWithProviders(<RegisterForm />);
    await fill('correct horse battery', 'correct horse battery!');
    expect(await screen.findByText('Passwords do not match.')).toBeTruthy();
  });

  it('shows API field errors next to their field', async () => {
    fetchMock.mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            type: 'about:blank',
            title: 'Bad Request',
            status: 400,
            code: 'VALIDATION_FAILED',
            errors: [{ path: 'email', message: 'validation.email.invalid' }],
          }),
          { status: 400 },
        ),
    );
    await renderWithProviders(<RegisterForm />);
    await fill('correct horse battery', 'correct horse battery');
    expect(await screen.findByText('Enter a valid email address.')).toBeTruthy();
  });
});
