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
  },
  rules: {
    'import/no-unresolved': 0,
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
    '@typescript-eslint/no-explicit-any': 'off',
  },
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
    ecmaVersion: 2018,
    sourceType: 'module',
  },
};
