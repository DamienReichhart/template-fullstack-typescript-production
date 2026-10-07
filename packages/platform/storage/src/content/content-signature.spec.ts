import { describe, expect, it } from 'bun:test';

import { detectContentType, extensionFor, hasKnownSignature } from './content-signature.ts';

const bytes = (...values: number[]) => new Uint8Array(values);
const text = (value: string) => new TextEncoder().encode(value);

describe('detectContentType', () => {
  it.each([
    ['image/png', bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0)],
    ['image/jpeg', bytes(0xff, 0xd8, 0xff, 0xe0)],
    ['image/gif', text('GIF89a')],
    ['image/webp', text('RIFF\u0010\u0000\u0000\u0000WEBPVP8 ')],
    ['application/pdf', text('%PDF-1.7')],
  ])('recognises %s', (contentType, head) => {
    expect(detectContentType(head)).toBe(contentType);
  });

  it('recognises nothing in text or a truncated header', () => {
    expect(detectContentType(text('<svg xmlns="http://www.w3.org/2000/svg">'))).toBeUndefined();
    expect(detectContentType(bytes(0x89, 0x50))).toBeUndefined();
    expect(detectContentType(text('RIFF\u0010\u0000\u0000\u0000WAVE'))).toBeUndefined();
  });
});

describe('signature metadata', () => {
  it('knows which types it can verify and their extension', () => {
    expect(hasKnownSignature('image/jpeg')).toBe(true);
    expect(hasKnownSignature('text/plain')).toBe(false);
    expect(extensionFor('image/jpeg')).toBe('jpg');
    expect(extensionFor('text/plain')).toBeUndefined();
  });
});
