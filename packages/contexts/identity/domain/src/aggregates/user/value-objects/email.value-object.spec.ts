import { describe, expect, it } from 'bun:test';

import { InvalidEmailError } from '../errors/invalid-email.error.js';
import { Email } from './email.value-object.js';

describe('Email', () => {
  it('normalises case and surrounding whitespace', () => {
    expect(Email.create('  Ada@Example.COM ').value).toBe('ada@example.com');
  });

  it('treats differently-cased addresses as the same email', () => {
    expect(Email.create('ADA@example.com').equals(Email.create('ada@example.com'))).toBe(true);
  });

  it('rejects malformed addresses', () => {
    expect(() => Email.create('not-an-email')).toThrow(InvalidEmailError);
  });
});
