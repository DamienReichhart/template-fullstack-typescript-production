import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';

import baseConfig from '../../eslint.config.mjs';

/*
 * Flat config replaces a rule's options instead of merging them, so every scope below lists
 * its full set of restrictions, composed from these building blocks.
 */
const noCookieAccess = {
  name: 'next/headers',
  importNames: ['cookies'],
  message: 'Read auth state through the API, not cookies.',
};
const featureIndexOnly = {
  group: ['@/features/*/*', '!@/features/*/index'],
  message: 'Import a feature through its index.ts only.',
};
const noFeatures = { group: ['@/features/*'], message: 'shared/ never imports features.' };
const noRoutes = { group: ['@/app/*'], message: 'Only routes import routes.' };

const restrictImports = (patterns) => ['error', { paths: [noCookieAccess], patterns }];

export default [
  ...baseConfig,
  { ignores: ['.next/**', 'next-env.d.ts'] },
  {
    files: ['**/*.ts', '**/*.tsx'],
    plugins: { '@next/next': nextPlugin, 'react-hooks': reactHooks },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
      ...reactHooks.configs.recommended.rules,
      'no-restricted-syntax': [
        'error',
        // The web app is presentation only: business logic lives in the API.
        {
          selector: "ExpressionStatement > Literal[value='use server']",
          message: 'Server Actions are forbidden: call the API through @template/api-client.',
        },
        // Text that users (or screen readers) perceive is translated, attributes included.
        {
          selector:
            'JSXAttribute[name.name=/^(aria-label|aria-description|title|alt|placeholder)$/] > Literal',
          message: 'User-facing attributes are translated: use t(…) from next-intl.',
        },
      ],
      'no-restricted-imports': restrictImports([featureIndexOnly]),
    },
  },
  {
    files: ['src/features/**/*.ts', 'src/features/**/*.tsx'],
    rules: { 'no-restricted-imports': restrictImports([featureIndexOnly, noRoutes]) },
  },
  {
    files: ['src/shared/**/*.ts', 'src/shared/**/*.tsx'],
    rules: { 'no-restricted-imports': restrictImports([noFeatures, noRoutes]) },
  },
];
