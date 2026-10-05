import nx from '@nx/eslint-plugin';
import prettier from 'eslint-config-prettier';

/**
 * Architecture is enforced here, not in a wiki.
 * Every project carries one `scope:*` tag and one `type:*` or `layer:*` tag;
 * see docs/architecture/boundaries.md for the reasoning behind each rule.
 */
const depConstraints = [
  // Scopes: who may talk to whom.
  { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:shared'] },
  { sourceTag: 'scope:frontend', onlyDependOnLibsWithTags: ['scope:frontend', 'scope:shared'] },
  { sourceTag: 'scope:platform', onlyDependOnLibsWithTags: ['scope:platform', 'scope:shared'] },
  {
    sourceTag: 'scope:identity',
    onlyDependOnLibsWithTags: ['scope:identity', 'scope:platform', 'scope:shared'],
  },
  {
    sourceTag: 'scope:notifications',
    onlyDependOnLibsWithTags: ['scope:notifications', 'scope:platform', 'scope:shared'],
  },

  // Layers inside a bounded context.
  { sourceTag: 'layer:domain', onlyDependOnLibsWithTags: ['layer:domain', 'type:ddd'] },
  {
    sourceTag: 'layer:application',
    onlyDependOnLibsWithTags: ['layer:domain', 'layer:application', 'type:ddd'],
  },
  {
    sourceTag: 'layer:infrastructure',
    onlyDependOnLibsWithTags: [
      'layer:domain',
      'layer:application',
      'scope:platform',
      'scope:shared',
    ],
  },
  {
    sourceTag: 'layer:http',
    onlyDependOnLibsWithTags: [
      'layer:domain',
      'layer:application',
      'scope:platform',
      'scope:shared',
    ],
  },
  {
    sourceTag: 'layer:jobs',
    onlyDependOnLibsWithTags: ['layer:application', 'scope:platform', 'scope:shared'],
  },

  // Runnables: compose anything, but never another runnable.
  { sourceTag: 'type:app', notDependOnLibsWithTags: ['type:app', 'type:e2e'] },
  { sourceTag: 'type:e2e', notDependOnLibsWithTags: ['type:app', 'type:e2e'] },
];

export default [
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],
  {
    ignores: [
      '**/dist',
      '**/out-tsc',
      '**/.next',
      '**/coverage',
      '**/generated',
      '**/playwright-report',
      '**/test-results',
      '**/next-env.d.ts',
      '**/vite.config.*.timestamp*',
    ],
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      // Nest resolves constructor parameters from emitted decorator metadata: with these
      // flags typescript-eslint keeps injected classes as value imports.
      parserOptions: { emitDecoratorMetadata: true, experimentalDecorators: true },
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx', '**/*.mjs'],
    rules: {
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          banTransitiveDependencies: true,
          allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$', '^bun:.*$', '^@/.*$'],
          depConstraints,
        },
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'separate-type-imports' },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
  {
    files: [
      '**/*.spec.ts',
      '**/*.spec.tsx',
      '**/*.int-spec.ts',
      '**/*.e2e-spec.ts',
      '**/scripts/**/*.ts',
    ],
    rules: {
      'no-console': 'off',
    },
  },
  prettier,
];
