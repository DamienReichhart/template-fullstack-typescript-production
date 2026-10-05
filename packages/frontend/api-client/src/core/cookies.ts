/** Reads one cookie from a `document.cookie`-formatted string. */
export function readCookie(cookies: string, name: string): string | undefined {
  for (const part of cookies.split(';')) {
    const [key, ...value] = part.trim().split('=');
    if (key === name) return decodeURIComponent(value.join('='));
  }
  return undefined;
}

/** `document.cookie` in browsers, nothing on the server. */
export const browserCookies = (): string =>
  typeof document === 'undefined' ? '' : document.cookie;
