interface Signature {
  contentType: string;
  extension: string;
  /** Byte at each offset; `undefined` matches anything. */
  bytes: readonly (number | undefined)[];
  offset?: number;
}

const ascii = (text: string) => [...text].map((char) => char.charCodeAt(0));

const SIGNATURES: readonly Signature[] = [
  {
    contentType: 'image/png',
    extension: 'png',
    bytes: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
  },
  { contentType: 'image/jpeg', extension: 'jpg', bytes: [0xff, 0xd8, 0xff] },
  { contentType: 'image/gif', extension: 'gif', bytes: ascii('GIF8') },
  {
    contentType: 'image/webp',
    extension: 'webp',
    bytes: [...ascii('RIFF'), undefined, undefined, undefined, undefined, ...ascii('WEBP')],
  },
  { contentType: 'application/pdf', extension: 'pdf', bytes: ascii('%PDF-') },
  // ISO base media files open with an `ftyp` box after its 4-byte size. QuickTime's brand is
  // `qt  `; every other brand (`isom`, `mp42`, `avc1`, …) is MP4. The QuickTime entry first.
  { contentType: 'video/quicktime', extension: 'mov', bytes: ascii('ftypqt  '), offset: 4 },
  { contentType: 'video/mp4', extension: 'mp4', bytes: ascii('ftyp'), offset: 4 },
];

/** Bytes to read from the start of an object to recognise any known signature. */
export const SIGNATURE_BYTES = 16;

/**
 * The content type the first bytes of a file prove, or `undefined` when no known signature
 * matches. A declared `Content-Type` is the client's claim; this is the file's.
 */
export function detectContentType(head: Uint8Array): string | undefined {
  return SIGNATURES.find(({ bytes, offset = 0 }) =>
    bytes.every((byte, index) => byte === undefined || head[offset + index] === byte),
  )?.contentType;
}

/** True when `detectContentType` can confirm or refute a file declared as `contentType`. */
export function hasKnownSignature(contentType: string): boolean {
  return SIGNATURES.some((signature) => signature.contentType === contentType);
}

/** Conventional file extension of a content type with a known signature (`image/jpeg` → `jpg`). */
export function extensionFor(contentType: string): string | undefined {
  return SIGNATURES.find((signature) => signature.contentType === contentType)?.extension;
}
