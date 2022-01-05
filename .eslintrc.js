const config = require('zotero-plugin/.eslintrc')

config.rules['@typescript-eslint/consistent-type-definitions'] = 'off'
config.rules['@typescript-eslint/member-ordering'] = 'off'
config.rules['max-classes-per-file'] = 'off'
config.rules['no-console'] = 'error'
config.rules['no-new-func'] = 'off'
config.rules['no-underscore-dangle'] = [ 'error', { "allowAfterThis": true } ]

config.rules['@typescript-eslint/no-unsafe-member-access'] = 'off'
config.rules['@typescript-eslint/no-unsafe-call'] = 'off'
config.rules['@typescript-eslint/prefer-regexp-exec'] = 'off'
config.rules['@typescript-eslint/no-implied-eval'] = 'off'
config.rules['@typescript-eslint/no-unsafe-assignment'] = 'off'
config.rules['@typescript-eslint/no-unsafe-argument'] = 'off'
config.rules['@typescript-eslint/restrict-template-expressions'] = 'off'
config.rules['@typescript-eslint/explicit-module-boundary-types'] = 'error'

config.rules['@typescript-eslint/ban-ts-comment'] = 'warn'
config.rules['@typescript-eslint/member-delimiter-style'] = [ 'error', {
  multiline: { delimiter: 'none', requireLast: false },
  singleline: { delimiter: 'comma', requireLast: false },
}]
config.rules['@typescript-eslint/no-unused-vars'] = [ 'error', { "argsIgnorePattern": "^_" } ]

config.ignorePatterns = [
  'webpack.config.ts',
  'util/*.ts',
  'minitests/*.ts',
  'content/minitests/*.ts',
  'zotero-odf-scan-plugin',
]

module.exports = config
