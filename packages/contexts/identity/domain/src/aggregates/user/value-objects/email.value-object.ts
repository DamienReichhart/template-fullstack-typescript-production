import { ValueObject } from '@template/ddd';

import { InvalidEmailError } from '../errors/invalid-email.error.ts';

const EMAIL_SHAPE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** An email address, normalised (trimmed, lower-cased) so that lookups are case-insensitive. */
export class Email extends ValueObject<{ value: string }> {
  static create(raw: string): Email {
    const value = raw.trim().toLowerCase();
    if (value.length > 254 || !EMAIL_SHAPE.test(value)) throw new InvalidEmailError(raw);
    return new Email({ value });
  }

  get value(): string {
    return this.props.value;
  }
}
