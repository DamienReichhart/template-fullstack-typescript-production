/**
 * One namespace per web feature (auth, dashboard, marketing, system) plus cross-cutting
 * catalogs. Adding a namespace means adding `<namespace>.json` to every locale folder.
 */
export const namespaces = [
  'common',
  'auth',
  'dashboard',
  'marketing',
  'system',
  'validation',
  'errors',
  'emails',
  'seo',
] as const;

export type Namespace = (typeof namespaces)[number];
