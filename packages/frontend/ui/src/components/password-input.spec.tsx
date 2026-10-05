import { afterEach, describe, expect, it } from 'bun:test';
import { cleanup, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { PasswordInput } from './password-input.tsx';

afterEach(cleanup);

describe('PasswordInput', () => {
  it('hides the value by default and toggles its visibility', async () => {
    render(
      <PasswordInput placeholder="Password" showLabel="Show password" hideLabel="Hide password" />,
    );
    const input = screen.getByPlaceholderText('Password');
    expect(input.getAttribute('type')).toBe('password');

    await userEvent.click(screen.getByRole('button', { name: 'Show password' }));
    expect(input.getAttribute('type')).toBe('text');

    await userEvent.click(screen.getByRole('button', { name: 'Hide password' }));
    expect(input.getAttribute('type')).toBe('password');
  });
});
