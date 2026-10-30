/**
 * Drops the trailing slashes of a base URL, so paths join to it with a single `/`.
 * A single pass: the `/\/+$/` regex backtracks quadratically on a long run of slashes.
 */
export function withoutTrailingSlashes(url: string): string {
  let end = url.length;
  while (end > 0 && url[end - 1] === '/') end--;
  return url.slice(0, end);
}
