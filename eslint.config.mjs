import tseslint from 'typescript-eslint'
import pluginJs from '@eslint/js'
import prettier from 'eslint-config-prettier/flat'
import eslintPluginPrettier from 'eslint-plugin-prettier'
import globals from 'globals'

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      'build/**',
      'mongo_data/**',
      'eslint.config.mjs',
    ],
  },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
      parserOptions: {
        project: ['tsconfig.json'],
      },
    },
    plugins: {
      prettier: eslintPluginPrettier,
    },
    files: ['**/*.{js,mjs,cjs,ts}'],
    rules: {
      'prefer-const': 'error',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'max-lines': ['warn', { max: 150 }],
      'max-params': ['error', 4],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { accessibility: 'explicit' },
      ],
      'prettier/prettier': ['warn', {}, { usePrettierrc: true }],
    },
  },
  prettier,
]
