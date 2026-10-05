import nextPlugin from '@next/eslint-plugin-next';
import reactHooks from 'eslint-plugin-react-hooks';

import baseConfig from '../../eslint.config.mjs';

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
      // The web app is presentation only: business logic lives in the API (ADR 0011).
      'no-restricted-syntax': [
        'error',
        {
          selector: "ExpressionStatement > Literal[value='use server']",
          message: 'Server Actions are forbidden: call the API through @template/api-client.',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'next/headers',
              importNames: ['cookies'],
              message: 'Read auth state through the API, not cookies.',
            },
          ],
          patterns: [
            {
              group: ['@/features/*/*', '!@/features/*/index'],
              message: 'Import a feature through its index.ts only.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/features/**/*.ts', 'src/features/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        { patterns: [{ group: ['@/app/*'], message: 'Features never import routes.' }] },
      ],
    },
  },
  {
    files: ['src/shared/**/*.ts', 'src/shared/**/*.tsx'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*', '@/app/*'],
              message: 'shared/ never imports features or routes.',
            },
          ],
        },
      ],
    },
  },
];
