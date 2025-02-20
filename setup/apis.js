#!/usr/bin/env node
'use strict'

const Showdown = require('showdown')
const showdown = new Showdown.Converter()
const findRoot = require('find-root')
const path = require('path')
const fs = require('fs')
const jsesc = require('jsesc')
const root = findRoot(__dirname)
const ast = require('./api/type-doc').parse
const crypto = require('crypto')

if (!fs.existsSync('gen/api')) fs.mkdirSync('gen/api', { recursive: true })
fs.writeFileSync('gen/api/key-formatter.js', '')
fs.writeFileSync('gen/api/json-rpc.js', '')

const stringify = require('safe-stable-stringify')
const Ajv = require('ajv/dist/2020')
const { _ } = Ajv
const ajv = new Ajv({
  code: { source: true },
})
const standaloneCode = require('ajv/dist/standalone').default

ajv.addKeyword({
  keyword: 'instanceof',
  schemaType: 'string',
  code(cxt) {
    const { data, schema } = cxt
    cxt.fail(_`!(${data} instanceof ` + `${schema})`)
  },
})

ajv.addKeyword({
  keyword: 'sprintf',
  schemaType: 'string',
  code(cxt) {
    const { data, schema } = cxt
    cxt.fail(_`typeof ${data} !== 'string' || !(${data}.replace(/%(?:(\\d*)[$]|\\(([a-zA-Z]+)\\))[+]?(?:0|'.)?-?\\d*(?:[.]\\d+)?([bcdieufgostTvxXj])/g, ((m, num, name, mod) => {
      if (typeof num === 'string') return '\\x15'
      return ${schema}.includes('%' + name + mod) ? '\\x06' : '\\x15'
    })).match(/^(?=.*\\x06)(?!.*\\x15)/))`)
  },
})

function flattenUnion(type) {
  if (type.type !== 'union') return type
  if (type.types.find(t => t.type !== 'union' && t.type !== 'literal')) return type
  return {
    ...type,
    types: type.types.reduce((acc, t) => [...acc, ...(t.type === 'union' ? t.types : [t])], []),
  }
}

function CreatorTypeArray(creatorType) {
  return {
    type: 'array',
    elementType: creatorType,
  }
}

function CreatorTypeCollection(creatorType) {
  return {
    type: 'array',
    elementType: {
      type: 'array',
      elementType: {
        type: 'union',
        types: [
          creatorType,
          { type: 'literal', value: '*' },
        ],
      },
    },
  }
}

function makeType(type) {
  type = flattenUnion(type)

  const creatorType = { type: 'reference', package: 'zotero-better-bibtex', name: 'CreatorType' }

  switch (`${type.type}.${type.package || ''}`) {
    case 'intrinsic.':
      return type.name
    case 'union.':
      return `(${type.types.map(makeType).join(' | ')})`
    case 'literal.':
      return JSON.stringify(type.value)
    case 'reference.typescript':
      switch (type.name) {
        case 'RegExp':
          return type.name
        case 'Record':
          return `Record<${type.typeArguments.map(makeType).join(', ')}>`
        default:
          throw type
      }
    case 'tuple.':
      return `[ ${type.elements.map(makeType)} ]`
    case 'array.':
      return `${makeType(type.elementType)}[]`

    case 'reference.zotero-better-bibtex':
      switch (type.name) {
        case 'Template':
          return '`sprintf-style format template`'
        case 'AuthorType':
          return makeType({
            type: 'union',
            types: ['author', 'editor', 'translator', 'collaborator', '*'].map(a => ({ type: 'literal', value: a })),
          })
        case 'CreatorType':
          return 'Creator'
        case 'CreatorTypeArray':
          return makeType(CreatorTypeArray(creatorType))
        case 'CreatorTypeCollection':
          return makeType(CreatorTypeCollection(creatorType))
        default:
          throw type
      }

    case 'reflection.':
      if (type.declaration.children) return `{ ${type.declaration.children.map(t => `${t.name}: ${makeType(t.type)}`).join('; ')} }`
      if (type.typeArguments?.length === 1) return makeType(type.typeArguments[0])

    case 'reference.zotero-types':
      switch (type.name) {
        case 'Collection':
          return type.name
        default:
          throw type
      }
  }
  throw type
}

function makeSchema(type) {
  type = flattenUnion(type)

  const creatorType = { enum: creatorTypes }

  if (type.enum) return type

  switch (`${type.type}.${type.package || ''}`) {
    case 'intrinsic.':
      return { type: type.name }
    case 'union.': {
      const oneOf = type.types.map(makeSchema)
      if (oneOf.find(t => !t.const)) return { oneOf }
      return { enum: oneOf.map(t => t.const) }
    }
    case 'literal.':
      return { const: type.value }

    case 'reference.typescript':
      switch (type.name) {
        case 'RegExp':
          return { instanceof: type.name }
        case 'Record':
          return {
            type: 'object',
            additionalProperties: makeSchema(type.typeArguments[1]),
          }
          return `Record<${type.typeArguments.map(makeType).join(', ')}>`
        default:
          throw type
      }

    case 'tuple.':
      return { type: 'array', prefixItems: type.elements.map(makeSchema), minItems: type.elements.length, maxItems: type.elements.length }

    case 'array.':
      return { type: 'array', items: makeSchema(type.elementType) }

    case 'reference.zotero-better-bibtex':
      switch (type.name) {
        case 'Template': {
          switch (type.typeArguments[0].value) {
            case 'creator':
              return { sprintf: '%fs%gs%is' }
            case 'postfix':
              return { sprintf: '%as%As%ns' }
          }
          throw type
        }

        case 'AuthorType':
          return { enum: ['author', 'editor', 'translator', 'collaborator', '*'] }
        case 'CreatorType':
          return creatorType
        case 'CreatorTypeArray':
          return makeSchema(CreatorTypeArray(creatorType))
        case 'CreatorTypeCollection':
          return makeSchema(CreatorTypeCollection(creatorType))
      }

    case 'reflection.':
      return {
        type: 'object',
        properties: type.declaration.children.reduce((acc, p) => ({ ...acc, [p.name]: makeSchema(p.type) }), {}),
      }
      if (type.typeArguments?.length === 1) return makeSchema(type.typeArguments[0])
  }
  throw type
}

const Validators = {}
function makeValidator(schema) {
  if (!fs.existsSync('gen/api/ajv')) fs.mkdirSync('gen/api/ajv', { recursive: true })

  const _schema = stringify(schema)
  const hash = crypto.createHash('sha256').update(_schema, 'utf8').digest('hex')
  if (Validators[hash] && Validators[hash] !== _schema) throw new Error('hash clash')
  Validators[hash] = _schema

  const filename = path.join('gen/api/ajv', hash + '.js')
  const validate = ajv.compile(schema)
  fs.writeFileSync(filename, `// ${_schema}\n\n${standaloneCode(ajv, validate)}`)
  return hash
}
function linkValidators(code) {
  for (const schema of Object.keys(Validators)) {
    code = code.replace(new RegExp(`'${schema}'`, 'g'), `require('./ajv/${schema}')`)
  }
  return code
}

function escapeHTML(str) {
  const escapeChars = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '`': '&#96;',
  }
  return str.replace(/[&<>"'`]/g, char => escapeChars[char])
}

const formatter = ast(path.join(root, 'content/key-manager/formatter.ts')).children.find(child => child.name === 'PatternFormatter')
const methods = formatter.children.filter(child => child.variant === 'declaration' && child.name.match(/^[$_]/))

const zotero = require(path.join(root, 'schema/zotero.json'))
let creatorTypes = new Set()
for (const itemType of zotero.itemTypes) {
  for (const creatorType of itemType.creatorTypes) {
    creatorTypes.add(creatorType.creatorType)
  }
}
creatorTypes = [...creatorTypes].sort()
const fields = new Set()
const fieldLookup = {}
for (const itemType of zotero.itemTypes) {
  for (const field of itemType.fields) {
    for (const name of ['field', 'baseField']) {
      if (field[name]) {
        fields.add(field[name])
        fieldLookup[field[name].toLowerCase()] = field[name]
      }
    }
  }
}

function KeyManager() {
  const section = {
    $: [],
    _: [],
  }
  const apispec = {}

  const babel = require('../gen/babel/tag.json')
  const babelLanguages = [...(new Set([...Object.keys(babel), ...Object.values(babel)]))].sort()
  const typeOverrides = {
    $language: {
      name: {
        type: 'array',
        elementType: {
          type: 'union',
          types: babelLanguages.map(l => ({ type: 'literal', value: l })),
        },
      },
    },
    $type: {
      allowed: {
        type: 'array',
        elementType: {
          type: 'union',
          types: zotero.itemTypes.map(t => ({ type: 'literal', value: t.itemType })),
        },
      },
    },
    $field: {
      name: {
        type: 'union',
        types: [...fields].sort().map(f => ({ type: 'literal', value: f })),
      },
    },
  }

  for (const method of methods) {
    if (method.name.match(/^[_$][_$]/)) continue

    const signature = method.signatures[0]
    if (!signature.comment) continue

    if (method.name[0] === '_') {
      if (signature.parameters[0].name !== 'input') throw new Error(`filter ${method.name} does not have an input argument`)
      signature.parameters.shift()
    }

    if ((signature.parameters || []).find(p => p.flags.isRest)) {
      if (signature.parameters.length !== 1) throw new Error(`API ${method.name} has rest parameters and can have only one argument`)
    }

    const _name = method.name.toLowerCase()
    apispec[_name] = {
      name: method.name,
      parameters: (signature.parameters || []).map(p => p.name),
      defaults: (signature.parameters || []).map(p => typeof p.defaultValue === 'undefined' ? undefined : eval(p.defaultValue)),
      required: [],
      validate: {},
    }

    const parameters = (signature.parameters || []).map(p => {
      let schema = makeSchema(typeOverrides[method.name]?.[p.name] || p.type)
      if (p.flags.isRest) {
        schema = schema.items // so that we can give sensible, per-argument errors
        apispec[_name].rest = p.name
      }
      apispec[_name].validate[p.name] = makeValidator(schema)

      if (!p.flags.isOptional && !p.defaultValue) apispec[_name].required.push(p.name)

      const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
      const type = makeType(p.type)
      const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`
      return `${name}: ${type}${dflt}`
    }).join(', ')

    let description = signature.comment.summary.map(s => {
      if (!s.kind.match(/^(code|text)$/)) throw s
      return s.text
    }).join('')

    if (parameters.includes('Creator')) {
      description += `\n\nCreator is one of: ${creatorTypes.join(', ')}`
    }

    const kind = method.name[0]
    const func = `${method.name.substring(1)}(${parameters})`

    section[kind].push(`<description><summary>${escapeHTML(func)}</summary>\n\n${showdown.makeHtml(description || '')}</description>\n`)
    section[kind].sort()

    const testname = `${kind}${method.name}`
    const test = methods.find(m => m.name === testname)
    if (test) apispec[_name].test = test.name
  }

  fs.writeFileSync(path.join(root, 'site/data/citekeyformatters/functions.json'), JSON.stringify(section.$, null, 2))
  fs.writeFileSync(path.join(root, 'site/data/citekeyformatters/filters.json'), JSON.stringify(section._, null, 2))

  fs.writeFileSync(
    'gen/api/key-formatter.js',
    linkValidators(
      `/* eslint-disable quote-props, comma-dangle */
module.exports.methods = ${jsesc(apispec, { compact: false, indent: '  ' })}
module.exports.fields = ${jsesc(fieldLookup, { compact: false, indent: '  ' })}
`,
    ),
  )
}

function JSONRPC() {
  const jsonrpc = ast(path.join(root, 'content/json-rpc.ts')).children.filter(child => child.name.startsWith('NS'))
  fs.writeFileSync(
    'json-rpc.json',
    JSON.stringify(jsonrpc.map(cls => cls.children.filter(method => method.flags.isPublic)), function(k, v) {
      switch (k) {
        case 'sources':
        case 'target':
          return undefined
          break
        default:
          return v
      }
    }, 2),
  )

  const apispec = {}
  const page = []
  for (const api of jsonrpc.flat()) {
    const namespace = api.name.substring(2).toLowerCase()
    const validate = {}
    const required = []

    for (const method of api.children) {
      if (method.name === 'constructor') continue
      const signature = method.signatures[0]
      const parameters = (signature.parameters || []).map(p => {
        if (!p.flags.isOptional) required.push(p.name)
        makeValidator(validate[p.name] = makeSchema(p.type))

        const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
        const type = makeType(p.type)
        const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`
        return `${name}: ${type}${dflt}`
      }).join(', ')
      const returnType = `: ${makeType(signature.type.typeArguments[0])}`.replace(': void', '')

      const description = signature.comment.summary.map(s => {
        if (!s.kind.match(/^(code|text)$/)) throw s
        return s.text
      }).join('')

      page.push(`## ${namespace}.${method.name}(${parameters})${returnType}\n\n${description}\n\n`)

      apispec[`${namespace}.${method.name}`] = {
        parameters: (signature.parameters || []).map(p => p.name),
        validate,
        required,
      }
    }
  }

  fs.writeFileSync(
    'gen/api/json-rpc.js',
    linkValidators(
      `/* eslint-disable quote-props, comma-dangle */
module.exports.methods = ${jsesc(apispec, { compact: false, indent: '  ' })}
`,
    ),
  )

  fs.writeFileSync(path.join(root, 'site/layouts/shortcodes/json-rpc.md'), page.sort().join('\n'))
}

KeyManager()
JSONRPC()
