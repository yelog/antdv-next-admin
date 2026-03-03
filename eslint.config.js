import antfu from '@antfu/eslint-config'

export default antfu({
  // Vue specific
  vue: true,

  // TypeScript
  typescript: true,

  // Formatting with Prettier
  formatters: {
    css: true,
    html: true,
    markdown: 'prettier',
  },

  // Ignore patterns
  ignores: [
    'dist',
    'node_modules',
    '*.d.ts',
    'coverage',
    'tests/e2e',
    '.github',
    '**/*.md',
  ],

  // Rules
  rules: {
    // Allow console in development
    'no-console': ['warn', { allow: ['warn', 'error'] }],

    // TypeScript - relaxed for gradual adoption
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'ts/no-explicit-any': 'off',
    'ts/no-empty-object-type': 'off',
    'ts/no-use-before-define': 'off',
    'ts/no-this-alias': 'off',

    // Style - relaxed
    'style/max-statements-per-line': 'off',

    // Unused vars - warn instead of error
    'unused-imports/no-unused-vars': 'warn',

    // Vue - relaxed
    'vue/no-unused-refs': 'warn',
    'vue/custom-event-name-casing': 'off',
    'vue/require-valid-default-prop': 'off',

    // Node
    'node/prefer-global/process': 'off',

    // Regexp
    'regexp/no-unused-capturing-group': 'off',

    // Others
    'no-useless-return': 'off',
    'no-prototype-builtins': 'off',
    'no-new': 'off',
    'no-throw-literal': 'off',
  },
})
