import { describe, expect, it } from 'bun:test';

import { ValueObject } from './value-object.js';

class Money extends ValueObject<{ amount: number; currency: string; at?: Date }> {
  static of(amount: number, currency: string, at?: Date) {
    return new Money({ amount, currency, at });
  }
}

class Other extends ValueObject<{ amount: number; currency: string }> {
  static of(amount: number, currency: string) {
    return new Other({ amount, currency });
  }
}

describe('ValueObject', () => {
  it('is equal when every prop is equal', () => {
    expect(Money.of(10, 'EUR').equals(Money.of(10, 'EUR'))).toBe(true);
  });

  it('compares dates by time, not reference', () => {
    expect(Money.of(1, 'EUR', new Date(0)).equals(Money.of(1, 'EUR', new Date(0)))).toBe(true);
  });

  it('is not equal when a prop differs', () => {
    expect(Money.of(10, 'EUR').equals(Money.of(10, 'USD'))).toBe(false);
  });

  it('is never equal to another value object type with the same props', () => {
    expect(Money.of(10, 'EUR').equals(Other.of(10, 'EUR'))).toBe(false);
  });
});
