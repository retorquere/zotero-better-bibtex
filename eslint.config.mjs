import eslint from '@eslint/js'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import globals from 'globals'
import tseslint from 'typescript-eslint'

import { fixupPluginRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import js from '@eslint/js'
import stylistic from '@stylistic/eslint-plugin'
import tsParser from '@typescript-eslint/parser'
import _import from 'eslint-plugin-import'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
})

import shell from 'shelljs'
const branch = (process.env.GITHUB_REF && process.env.GITHUB_REF.startsWith('refs/heads/'))
  ? process.env.GITHUB_REF.replace('refs/heads/', '')
  : shell.exec('git rev-parse --abbrev-ref HEAD', { silent: true }).stdout.trim()

const config = [
  {
    ignores: [
      'content/key-manager/compile.js',
      'eslint.config.mjs',
      'esbuild.js',
      'site/**/*.{ts,js,mjs}',
      'build/**/*.{ts,js}',
      'headless/**/*.{ts,js}',
      'tmp/**/*.{ts,js}',
      'typings/**/*.{ts,js}',
      'test/**/*.{ts,js}',
      'gen/**/*.{d.ts,ts,js,mjs}',
      'util/**/*.{ts,js}',
      'setup/**/*.{ts,js,mjs}',
      'submodules/**/*.{mts,ts,js,mjs,tsx,cjs}',
      'setup/**/*.{ts,js}',
      'util/*.ts',
      'util/*.mjs',
      'minitests/**/*.{ts,js}',
    ],
  },
  ...compat.extends(
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
  ),
  {
    plugins: {
      '@stylistic': stylistic,
      import: fixupPluginRules(_import),
      '@typescript-eslint': tsPlugin,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },

      parser: tsParser,
      ecmaVersion: 5,
      sourceType: 'module',

      parserOptions: {
        project: 'tsconfig.json',
      },
    },

    rules: {
      '@stylistic/array-bracket-spacing': 'off',
      '@stylistic/arrow-parens': ['error', 'as-needed'],

      '@stylistic/arrow-spacing': ['error', {
        after: true,
        before: true,
      }],

      '@stylistic/block-spacing': ['error', 'always'],

      '@stylistic/brace-style': ['error', 'stroustrup', {
        allowSingleLine: true,
      }],

      '@stylistic/comma-spacing': ['error', {
        after: true,
        before: false,
      }],

      '@stylistic/comma-style': ['error', 'last'],

      '@stylistic/computed-property-spacing': ['error', 'never', {
        enforceForClassMembers: true,
      }],

      '@stylistic/dot-location': ['error', 'property'],

      '@stylistic/indent': ['error', 2, {
        ArrayExpression: 1,

        CallExpression: {
          arguments: 1,
        },

        flatTernaryExpressions: false,

        FunctionDeclaration: {
          body: 1,
          parameters: 1,
        },

        FunctionExpression: {
          body: 1,
          parameters: 1,
        },

        ignoreComments: false,

        ignoredNodes: [
          'TSUnionType',
          'TSIntersectionType',
          'TSTypeParameterInstantiation',
          'FunctionExpression > .params[decorators.length > 0]',
          'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
        ],

        ImportDeclaration: 1,
        MemberExpression: 1,
        ObjectExpression: 1,
        offsetTernaryExpressions: true,
        outerIIFEBody: 1,
        SwitchCase: 1,
        tabLength: 2,
        VariableDeclarator: 1,
      }],

      '@stylistic/indent-binary-ops': 'off',

      '@stylistic/key-spacing': ['error', {
        afterColon: true,
        beforeColon: false,
      }],

      '@stylistic/keyword-spacing': ['error', {
        after: true,
        before: true,
      }],

      '@stylistic/lines-between-class-members': 'off',
      '@stylistic/max-statements-per-line': 'off',

      '@stylistic/member-delimiter-style': ['error', {
        multiline: {
          delimiter: 'none',
          requireLast: false,
        },

        singleline: {
          delimiter: 'semi',
          requireLast: false,
        },
      }],

      '@stylistic/multiline-ternary': ['error', 'always-multiline'],
      '@stylistic/new-parens': ['error', 'never'],
      '@stylistic/no-extra-parens': ['error', 'functions'],
      '@stylistic/no-floating-decimal': 'error',

      '@stylistic/no-mixed-operators': ['error', {
        allowSamePrecedence: true,

        groups: [
          ['==', '!=', '===', '!==', '>', '>=', '<', '<='],
          ['&&', '||'],
          ['in', 'instanceof'],
        ],
      }],

      '@stylistic/no-mixed-spaces-and-tabs': 'error',
      '@stylistic/no-multi-spaces': 'error',

      '@stylistic/no-multiple-empty-lines': ['error', {
        max: 1,
        maxBOF: 0,
        maxEOF: 0,
      }],

      '@stylistic/no-tabs': 'error',
      '@stylistic/no-trailing-spaces': 'error',
      '@stylistic/no-whitespace-before-property': 'error',
      '@stylistic/object-curly-spacing': 'off',
      '@stylistic/operator-linebreak': ['error', 'before'],

      '@stylistic/padded-blocks': ['error', {
        blocks: 'never',
        classes: 'never',
        switches: 'never',
      }],

      '@stylistic/quote-props': ['error', 'as-needed'],

      '@stylistic/quotes': ['error', 'single', {
        avoidEscape: true,
      }],

      '@stylistic/rest-spread-spacing': ['error', 'never'],
      '@stylistic/semi': ['error', 'never'],

      '@stylistic/semi-spacing': ['error', {
        after: true,
        before: false,
      }],

      '@stylistic/space-before-blocks': ['error', 'always'],

      '@stylistic/space-before-function-paren': ['error', {
        anonymous: 'never',
        named: 'never',
        asyncArrow: 'always',
      }],

      '@stylistic/space-in-parens': ['error', 'never'],
      '@stylistic/space-infix-ops': 'error',

      '@stylistic/space-unary-ops': ['error', {
        nonwords: false,
        words: true,
      }],

      '@stylistic/spaced-comment': ['error', 'always', {
        block: {
          balanced: true,
          exceptions: ['*'],
          markers: ['!'],
        },

        line: {
          exceptions: ['/', '#'],
          markers: ['/'],
        },
      }],

      '@stylistic/template-curly-spacing': 'off',
      '@stylistic/template-tag-spacing': ['error', 'never'],
      '@stylistic/type-annotation-spacing': ['error', {}],
      '@stylistic/type-generic-spacing': 'error',
      '@stylistic/type-named-tuple-spacing': 'error',

      '@stylistic/wrap-iife': ['error', 'any', {
        functionPrototypeMethods: true,
      }],

      '@stylistic/yield-star-spacing': ['error', {
        after: true,
        before: false,
      }],

      '@stylistic/jsx-closing-bracket-location': 'error',
      '@stylistic/jsx-closing-tag-location': 'error',

      '@stylistic/jsx-curly-brace-presence': ['error', {
        propElementValues: 'always',
      }],

      '@stylistic/jsx-curly-newline': 'error',
      '@stylistic/jsx-curly-spacing': ['error', 'never'],
      '@stylistic/jsx-equals-spacing': 'error',
      '@stylistic/jsx-first-prop-new-line': 'error',
      '@stylistic/jsx-function-call-newline': ['error', 'multiline'],
      '@stylistic/jsx-indent-props': ['error', 2],

      '@stylistic/jsx-max-props-per-line': ['error', {
        maximum: 1,
        when: 'multiline',
      }],

      '@stylistic/jsx-one-expression-per-line': ['error', {
        allow: 'single-child',
      }],

      '@stylistic/jsx-quotes': 'error',

      '@stylistic/jsx-tag-spacing': ['error', {
        afterOpening: 'never',
        beforeClosing: 'never',
        beforeSelfClosing: 'always',
        closingSlash: 'never',
      }],

      '@stylistic/jsx-wrap-multilines': ['error', {
        arrow: 'parens-new-line',
        assignment: 'parens-new-line',
        condition: 'parens-new-line',
        declaration: 'parens-new-line',
        logical: 'parens-new-line',
        prop: 'parens-new-line',
        propertyValue: 'parens-new-line',
        return: 'parens-new-line',
      }],

      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/array-type': 'off',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/consistent-type-assertions': 'off',
      '@typescript-eslint/dot-notation': 'error',
      '@typescript-eslint/explicit-module-boundary-types': 'error',
      '@typescript-eslint/member-ordering': 'off',
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-array-constructor': 'error',
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/no-empty-interface': 'error',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/no-implied-eval': 'off',
      '@typescript-eslint/no-inferrable-types': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/no-parameter-properties': 'off',

      '@typescript-eslint/no-shadow': ['error', {
        hoist: 'all',
      }],

      '@typescript-eslint/no-this-alias': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unused-expressions': 'error',

      '@typescript-eslint/no-unused-vars': ['error', {
        argsIgnorePattern: '^_',
      }],

      '@typescript-eslint/no-use-before-define': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/prefer-as-const': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/prefer-function-type': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/restrict-plus-operands': 'error',
      '@typescript-eslint/restrict-template-expressions': 'off',

      '@typescript-eslint/triple-slash-reference': ['error', {
        path: 'always',
        types: 'prefer-import',
        lib: 'always',
      }],

      '@typescript-eslint/unbound-method': 'error',
      '@typescript-eslint/unified-signatures': 'error',
      'arrow-body-style': 'error',

      'brace-style': ['error', 'stroustrup', {
        allowSingleLine: true,
      }],

      'comma-dangle': ['error', {
        objects: 'always-multiline',
        arrays: 'always-multiline',
        functions: 'never',
      }],

      complexity: 'off',
      'constructor-super': 'error',
      curly: ['error', 'multi-line'],
      'eol-last': 'error',
      eqeqeq: ['error', 'smart'],
      'guard-for-in': 'error',

      'id-blacklist': [
        'error',
        'any',
        'Number',
        'number',
        'String',
        'string',
        'Boolean',
        'boolean',
        'Undefined',
        'undefined',
      ],

      'id-match': 'error',
      'import/order': 'off',
      'linebreak-style': ['error', 'unix'],
      'max-classes-per-file': 'off',

      'max-len': ['warn', {
        code: 320,
      }],

      'new-parens': 'off',
      'no-array-constructor': 'off',
      'no-bitwise': 'error',
      'no-caller': 'error',
      'no-cond-assign': 'off',
      'no-console': 'error',
      'no-debugger': 'error',

      'no-empty': ['error', {
        allowEmptyCatch: true,
      }],

      'no-empty-function': 'off',
      'no-eval': 'error',
      'no-extra-semi': 'off',
      'no-fallthrough': 'off',
      'no-implied-eval': 'off',
      'no-invalid-this': 'off',
      'no-irregular-whitespace': 'error',
      'no-magic-numbers': 'off',
      'no-new-wrappers': 'error',
      'no-redeclare': 'error',
      'no-trailing-spaces': 'error',
      'no-undef-init': 'error',

      'no-underscore-dangle': ['error', {
        allowAfterThis: true,
      }],

      'no-unsafe-finally': 'error',
      'no-unused-labels': 'error',
      'no-unused-vars': 'off',
      'no-var': 'error',
      'object-shorthand': 'error',
      'one-var': ['off', 'never'],
      'prefer-arrow/prefer-arrow-functions': 'off',

      'prefer-const': ['error', {
        destructuring: 'all',
      }],

      'prefer-object-spread': 'error',
      'prefer-template': 'off',
      radix: 'off',
      'require-await': 'off',

      'spaced-comment': ['error', 'always', {
        markers: ['/'],
      }],

      'use-isnan': 'error',
      'valid-typeof': 'off',
      yoda: 'error',
      '@typescript-eslint/prefer-regexp-exec': 'off',
      'no-new-func': 'off',
      '@typescript-eslint/no-redundant-type-constituents': 'off',
      '@typescript-eslint/consistent-type-definitions': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',

      'no-restricted-syntax': [branch === 'master' ? 'error' : 'warn',
        { selector: "CallExpression[callee.name='dump']", message: 'use of dump is not allowed' },
        { selector: "CallExpression[callee.name='$dump']", message: 'use of $dump is not allowed' },
        { selector: "CallExpression[callee.object.name='Zotero'][callee.property.name='debug']", message: 'use of Zotero.debug is not allowed' },
        { selector: "CallExpression[callee.object.name='Zotero'][callee.property.name='logError']", message: 'use of Zotero.logError is not allowed' },
        { selector: "CallExpression[callee.object.name='log'][callee.property.name='debug']", message: 'use of log.debug is not allowed' },
        { selector: "CallExpression[callee.object.name='log'][callee.property.name='dump']", message: 'use of log.dump is not allowed' },
        { selector: "CallExpression[callee.name='trace']", message: 'use of trace is not allowed' }
      ],
    },
  },
]

export default config
