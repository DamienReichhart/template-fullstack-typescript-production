import { describe, expect, it } from 'bun:test';

import { withoutTrailingSlashes } from './base-url.ts';

describe('withoutTrailingSlashes', () => {
  it('drops every trailing slash', () => {
    expect(withoutTrailingSlashes('http://api.test///')).toBe('http://api.test');
  });

  it('keeps a URL without one as it is', () => {
    expect(withoutTrailingSlashes('http://api.test/v1')).toBe('http://api.test/v1');
  });

  it('keeps inner slashes', () => {
    expect(withoutTrailingSlashes('http://api.test//v1/')).toBe('http://api.test//v1');
  });

  // The input that makes `/\/+$/` backtrack, and the longest walk for the loop: both stay fast.
  it('runs in linear time on long runs of slashes', () => {
    const run = '/'.repeat(1_000_000);
    expect(withoutTrailingSlashes(`x${run}y`)).toBe(`x${run}y`);
    expect(withoutTrailingSlashes(`x${run}`)).toBe('x');
  }, 1_000);
});
