module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
  ],
  env: {
    node: true,
    es6: true,
    mocha: true,
  },
  globals: {
    ethers: 'readonly',
    hre: 'readonly',
    task: 'readonly',
  },
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-explicit-any': 'off',
    "@typescript-eslint/indent": ['error', 2, { 'SwitchCase': 1 }],
    '@typescript-eslint/semi': 'error',
    '@typescript-eslint/quotes': ['error', 'double', { 'avoidEscape': true, 'allowTemplateLiterals': true }]
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
