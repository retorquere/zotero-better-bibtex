const stylistic = require('@stylistic/eslint-plugin').configs.customize({
  indent: 2,
  quotes: 'single',
})

const config = {
    "root": true,
    "env": {
        "browser": true,
        "es6": true,
        "node": true
    },
    "extends": [
        'eslint:recommended',
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        '@stylistic',
        "eslint-plugin-import",
        "eslint-plugin-prefer-arrow",
        "@typescript-eslint",
        "@typescript-eslint/eslint-plugin",
    ],
    "rules": {
        ...stylistic.rules,
        '@stylistic/semi': [ 'error', 'never' ],
        '@stylistic/member-delimiter-style': [ 'error', {
          multiline: { delimiter: 'none', requireLast: false },
          singleline: { delimiter: 'semi', requireLast: false }
        }],
        '@stylistic/array-bracket-spacing': ['error', 'always', { singleValue: false }],
        '@stylistic/object-curly-spacing': ['error', 'always', { arraysInObjects: false, objectsInObjects: false }],
        '@stylistic/new-parens': ['error', 'never'],
        '@stylistic/quote-props': [ 'error', 'as-needed' ],
        '@stylistic/arrow-parens': [ 'error', 'as-needed' ],
        '@stylistic/max-statements-per-line': 'off',

        '@typescript-eslint/no-require-imports': 'off',
        "@typescript-eslint/adjacent-overload-signatures": "error",
        "@typescript-eslint/array-type": [
            "error",
            {
                "default": "array"
            }
        ],
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/dot-notation": "error",
        "@typescript-eslint/explicit-module-boundary-types": "warn",
        "@typescript-eslint/member-ordering": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/no-array-constructor": "error",
        "@typescript-eslint/no-empty-function": "error",
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-extra-non-null-assertion": "error",
        "@typescript-eslint/no-floating-promises": "error",
        "@typescript-eslint/no-for-in-array": "error",
        "@typescript-eslint/no-implied-eval": "error",
        "@typescript-eslint/no-inferrable-types": "error",
        "@typescript-eslint/no-misused-new": "error",
        "@typescript-eslint/no-misused-promises": "error",
        "@typescript-eslint/no-namespace": "error",
        "@typescript-eslint/no-non-null-asserted-optional-chain": "error",
        "@typescript-eslint/no-non-null-assertion": "warn",
        "@typescript-eslint/no-parameter-properties": "off",
        "@typescript-eslint/no-shadow": [
            "error",
            {
                "hoist": "all"
            }
        ],
        "@typescript-eslint/no-this-alias": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "@typescript-eslint/no-unsafe-assignment": "error",
        "@typescript-eslint/no-unsafe-call": "error",
        "@typescript-eslint/no-unsafe-member-access": "error",
        "@typescript-eslint/no-unsafe-return": "error",
        "@typescript-eslint/no-unused-expressions": "error",
        "@typescript-eslint/no-unused-vars": "warn",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-var-requires": "off",
        "@typescript-eslint/prefer-as-const": "error",
        "@typescript-eslint/prefer-for-of": "error",
        "@typescript-eslint/prefer-function-type": "error",
        "@typescript-eslint/prefer-namespace-keyword": "error",
        "@typescript-eslint/prefer-regexp-exec": "warn",
        "@typescript-eslint/require-await": "error",
        "@typescript-eslint/restrict-plus-operands": "error",
        "@typescript-eslint/restrict-template-expressions": "error",
        "@typescript-eslint/triple-slash-reference": [
            "error",
            {
                "path": "always",
                "types": "prefer-import",
                "lib": "always"
            }
        ],
        "@typescript-eslint/unbound-method": "error",
        "@typescript-eslint/unified-signatures": "error",
        "arrow-body-style": "error",
        "brace-style": [ "error", "stroustrup", { "allowSingleLine": true } ],
        "comma-dangle": [
            "error",
            {
                "objects": "always-multiline",
                "arrays": "always-multiline",
                "functions": "never"
            }
        ],
        "complexity": "off",
        "constructor-super": "error",
        "curly": [
            "error",
            "multi-line"
        ],
        "eol-last": "error",
        "eqeqeq": [
            "error",
            "smart"
        ],
        "guard-for-in": "error",
        "id-blacklist": [
            "error",
            "any",
            "Number",
            "number",
            "String",
            "string",
            "Boolean",
            "boolean",
            "Undefined",
            "undefined"
        ],
        "id-match": "error",
        "import/order": "off",
        "linebreak-style": [
            "error",
            "unix"
        ],
        "max-classes-per-file": [
            "error",
            4
        ],
        "max-len": [
            "warn",
            {
                "code": 240
            }
        ],
        "new-parens": "off",
        "no-array-constructor": "off",
        "no-bitwise": "error",
        "no-caller": "error",
        "no-cond-assign": "off",
        "no-console": "error",
        "no-debugger": "error",
        "no-empty": [
            "error",
            {
                "allowEmptyCatch": true
            }
        ],
        "no-empty-function": "off",
        "no-eval": "error",
        "no-extra-semi": "off",
        "no-fallthrough": "off",
        "no-implied-eval": "off",
        "no-invalid-this": "off",
        "no-irregular-whitespace": "error",
        "no-magic-numbers": [
            "error",
            {
                "ignore": [
                    -1,
                    0,
                    1,
                    2
                ]
            }
        ],
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-trailing-spaces": "error",
        "no-undef-init": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-labels": "error",
        "no-unused-vars": "off",
        "no-var": "error",
        "object-shorthand": "error",
        "one-var": [ "off", "never" ],
        'prefer-arrow/prefer-arrow-functions': 'off',
        "prefer-const": [ "error", { "destructuring": "all" } ],
        "prefer-object-spread": "error",
        "prefer-template": "error",
        "radix": "off",
        "require-await": "off",
        "@stylistic/space-before-function-paren": [
            "error",
            {
                "anonymous": "never",
                "named": "never",
                "asyncArrow": "always"
            }
        ],
        "spaced-comment": [
            "error",
            "always",
            {
                "markers": [
                    "/"
                ]
            }
        ],
        "use-isnan": "error",
        "valid-typeof": "off",
        "yoda": "error",
        "@typescript-eslint/prefer-regexp-exec": "off"
    }
}

Object.assign(config.rules, {
  'max-classes-per-file': 'off',
  'no-console': 'error',
  'no-new-func': 'off',
  'no-underscore-dangle': [ 'error', { "allowAfterThis": true } ],
  'prefer-template': 'off',

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

  '@stylistic/array-bracket-spacing': 'off',
  '@stylistic/template-curly-spacing': 'off',
  '@stylistic/quotes': ['error', 'single', { "avoidEscape": true }],
  '@stylistic/lines-between-class-members': 'off',
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
