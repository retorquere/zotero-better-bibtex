const config = require('zotero-plugin/.eslintrc')

Object.assign(config.rules, {
  'max-classes-per-file': 'off',
  'no-console': 'error',
  'no-new-func': 'off',
  'no-underscore-dangle': [ 'error', { "allowAfterThis": true } ],
  'prefer-template': 'off',

  '@stylistic/template-curly-spacing': [ 'error', 'always' ],
  // '@stylistic/js/operator-linebreak': ['error', 'before' ],

  'prefer-arrow/prefer-arrow-functions': 'off',

  '@typescript-eslint/no-redundant-type-constituents': 'off',
  '@typescript-eslint/consistent-type-assertions': 'off',
  '@typescript-eslint/consistent-type-definitions': 'off',
  '@typescript-eslint/explicit-module-boundary-types': 'error',
  '@typescript-eslint/member-ordering': 'off',
  '@typescript-eslint/no-implied-eval': 'off',
  '@typescript-eslint/no-unsafe-argument': 'off',
  '@typescript-eslint/no-unsafe-assignment': 'off',
  '@typescript-eslint/no-unsafe-call': 'off',
  '@typescript-eslint/no-unsafe-member-access': 'off',
  '@typescript-eslint/prefer-regexp-exec': 'off',
  '@typescript-eslint/restrict-template-expressions': 'off',
  '@typescript-eslint/array-type': 'off',

  '@typescript-eslint/ban-ts-comment': 'warn',
  '@typescript-eslint/no-unused-vars': [ 'error', { "argsIgnorePattern": "^_" } ],
  'no-magic-numbers': 'off',
  'max-len': [ 'warn', { code: 320 } ],
  'prefer-arrow/prefer-arrow-functions': 'off',
  '@stylistic/template-curly-spacing': 'off',
  '@stylistic/quotes': ['error', 'single', { "avoidEscape": true }],
})

const shell = require('shelljs')
const branch = (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/'))
  ? process.env.GITHUB_REF.replace('refs/heads/', '')
  : shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim()
const no_restricted_syntax = {master: 'error', minlog: 'warn'}[branch] || 'off'
config.rules['no-restricted-syntax'] = [
  {master: 'error'}[branch] || 'off',
  { selector: "CallExpression[callee.name='dump']", message: 'use of dump is not allowed' },
  { selector: "CallExpression[callee.object.name='Zotero'][callee.property.name='debug']", message: 'use of Zotero.debug is not allowed' },
  { selector: "CallExpression[callee.object.name='Zotero'][callee.property.name='logError']", message: 'use of Zotero.logError is not allowed' },
  { selector: "CallExpression[callee.object.name='log'][callee.property.name='debug']", message: 'use of log.debug is not allowed' },
  { selector: "CallExpression[callee.object.name='log'][callee.property.name='dump']", message: 'use of log.dump is not allowed' },
  { selector: "CallExpression[callee.name='trace']", message: 'use of trace is not allowed' },
]

config.ignorePatterns = [
  'gen/**/*.ts',
  'gen/**/*.js',
  'setup/**/*.ts',
  'setup/**/*.js',
  'util/*.ts',
  'minitests/*.ts',
  'content/minitests/*.ts',
  'zotero-odf-scan-plugin',
]

module.exports = config
