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

const Zotero = {
  schema: require(path.join(root, 'schema/zotero.json')),
}
Zotero.itemTypes = Zotero.schema.itemTypes.map(it => it.itemType)
Zotero.creatorTypes = new Set()
for (const itemType of Zotero.schema.itemTypes) {
  for (const creatorType of itemType.creatorTypes) {
    Zotero.creatorTypes.add(creatorType.creatorType)
  }
}
Zotero.creatorTypes = [...Zotero.creatorTypes].sort()
ajv.addFormat('item-type', new RegExp(`^(${Zotero.itemTypes.join('|')})$`, 'i'))
ajv.addFormat('creator-type', new RegExp(`^(${Zotero.creatorTypes.join('|')})$`, 'i'))

const Babel = {
  tags: require('../gen/babel/tag.json'),
}
Babel.languages = [...(new Set([...Object.keys(Babel.tags), ...Object.values(Babel.tags)]))].sort()
ajv.addFormat('babel-language', new RegExp(`^(${Babel.languages.join('|')})$`, 'i'))

Zotero.fields = new Set()
Zotero.fieldLookup = {}
for (const itemType of Zotero.schema.itemTypes) {
  for (const field of itemType.fields) {
    for (const name of ['field', 'baseField']) {
      if (field[name]) {
        Zotero.fields.add(field[name])
        Zotero.fieldLookup[field[name].toLowerCase()] = field[name]
      }
    }
  }
}
Zotero.fields = [...Zotero.fields].sort()
ajv.addFormat('item-field', new RegExp(`^(${Zotero.fields.join('|')})$`, 'i'))

function flattenUnion(type) {
  if (type.type !== 'union') return type
  if (type.types.find(t => t.type !== 'union' && t.type !== 'literal')) return type
  return {
    ...type,
    types: type.types.reduce((acc, t) => [...acc, ...(t.type === 'union' ? t.types : [t])], []),
  }
}

function printType(type) {
  type = flattenUnion(patch(type))

  switch (typeName(type)) {
    case 'number':
    case 'string':
    case 'boolean':
    case 'any':
    case 'void':
      return type.name

    case 'union':
      return `(${type.types.map(printType).join(' | ')})`

    case 'literal':
      return JSON.stringify(type.value)

    case 'reference.typescript.RegExp':
      return type.name

    case 'reference.typescript.Record':
      return `Record<${type.typeArguments.map(printType).join(', ')}>`

    case 'tuple':
      return `[ ${type.elements.map(printType).join(', ')} ]`

    case 'array':
      return `${printType(type.elementType)}[]`

    case 'reference.zotero-better-bibtex.Template':
      return '`sprintf-style format template`'

    case 'reference.zotero-better-bibtex.AuthorType':
      return printType({
        type: 'union',
        types: ['author', 'editor', 'translator', 'collaborator', '*'].map(a => ({ type: 'literal', value: a })),
      })

    case 'reference.zotero-better-bibtex.CreatorType':
      return 'Creator'

    case 'reflection':
      if (type.declaration.children) return `{ ${type.declaration.children.map(t => `${t.name}: ${printType(t.type)}`).join('; ')} }`
      if (type.typeArguments?.length === 1) return printType(type.typeArguments[0])
      throw type

    case 'reference.zotero-types.Collection':
      return type.name

    default:
      throw new Error(JSON.stringify(type))
  }
}

function typeName(type) {
  if (type.type === 'intrinsic') return [type.name, type.format].filter(_ => _).join('.')
  if (type.type.match(/^(union|literal|tuple|array|reflection)$/)) return type.type
  if (type.type === 'reference') return [type.type, type.package, type.name].join('.')
  throw type
}

function patch(type) {
  return JSON.parse(JSON.stringify(type, function(k, v) {
    if (v.type === 'reference' && v.package === 'zotero-better-bibtex' && v.name === 'CreatorTypeArray') {
      return {
        type: 'array',
        elementType: { ...v, name: 'CreatorType' }
      }
    }
    else if (v.type === 'reference' && v.package === 'zotero-better-bibtex' && v.name === 'CreatorTypeCollection') {
      return {
        type: 'array',
        elementType: {
          type: 'array',
          elementType: {
            type: 'union',
            types: [
              { ...v, name: 'CreatorType' },
              { type: 'literal', value: '*' },
            ],
          },
        },
      }
    }
    else {
      return v
    }
  }))
}

function makeSchema(type) {
  type = flattenUnion(patch(type))

  if (type.enum) throw type

  switch (typeName(type)) {
    case 'number':
    case 'string':
    case 'boolean':
      return { type: type.name }

    case 'union': {
      const oneOf = type.types.map(makeSchema)
      if (oneOf.find(t => !t.const)) return { oneOf }
      return { enum: oneOf.map(t => t.const) }
    }

    case 'literal':
      return { const: type.value }

    case 'reference.typescript.RegExp':
      return { instanceof: type.name }

    case 'reference.typescript.Record':
      return {
        type: 'object',
        additionalProperties: makeSchema(type.typeArguments[1]),
      }

    case 'tuple':
      return { type: 'array', prefixItems: type.elements.map(makeSchema), minItems: type.elements.length, maxItems: type.elements.length }

    case 'array':
      return { type: 'array', items: makeSchema(type.elementType) }

    case 'reference.zotero-better-bibtex.Template':
      switch (type.typeArguments[0].value) {
        case 'creator':
          return { sprintf: '%fs%gs%is' }
        case 'postfix':
          return { sprintf: '%as%As%ns' }
        default:
          throw type
      }

    case 'reference.zotero-better-bibtex.AuthorType':
      return { enum: ['author', 'editor', 'translator', 'collaborator', '*'] }

    case 'reference.zotero-better-bibtex.CreatorType':
      return { type: 'string', format: 'creator-type' }

    case 'reference.zotero-better-bibtex.ItemType':
      return { type: 'string', format: 'item-type' }

    case 'reference.zotero-better-bibtex.ItemField':
      return { type: 'string', format: 'item-field' }

    case 'reference.zotero-better-bibtex.BabelLanguage':
      return { type: 'string', format: 'babel-language' }

    case 'reflection':
      if (type.typeArguments?.length === 1) return makeSchema(type.typeArguments[0])
      return {
        type: 'object',
        properties: type.declaration.children.reduce((acc, p) => ({ ...acc, [p.name]: makeSchema(p.type) }), {}),
      }

    default:
      throw new Error(JSON.stringify({ name: typeName(type), type }, null, 2))
  }
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

function KeyManager() {
  const section = {
    $: [],
    _: [],
  }
  const apispec = {}

  const typescriptType = {
    $language: {
      name: {
        type: 'array',
        elementType: { type: 'reference', package: 'zotero-better-bibtex', name: 'BabelLanguage' },
      },
    },
    $type: {
      allowed: {
        type: 'array',
        elementType: { type: 'reference', package: 'zotero-better-bibtex', name: 'ItemType' },
      },
    },
    $field: {
      name: { type: 'reference', package: 'zotero-better-bibtex', name: 'ItemField' },
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
      let schema = typescriptType[method.name]?.[p.name] || p.type
      schema = makeSchema(schema)
      if (p.flags.isRest) {
        schema = schema.items // so that we can give sensible, per-argument errors
        apispec[_name].rest = p.name
      }
      apispec[_name].validate[p.name] = makeValidator(schema)

      if (!p.flags.isOptional && !p.defaultValue) apispec[_name].required.push(p.name)

      const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
      const type = printType(p.type)
      const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`
      return `${name}: ${type}${dflt}`
    }).join(', ')

    let description = signature.comment.summary.map(s => {
      if (!s.kind.match(/^(code|text)$/)) throw s
      return s.text
    }).join('')

    if (parameters.includes('Creator')) {
      description += `\n\nCreator is one of: ${Zotero.creatorTypes.join(', ')}`
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
module.exports.fields = ${jsesc(Zotero.fieldLookup, { compact: false, indent: '  ' })}
`,
    ),
  )
}

function JSONRPC() {
  const jsonrpc = ast(path.join(root, 'content/json-rpc.ts')).children.filter(child => child.name.startsWith('NS'))

  const apispec = {}
  const page = []
  for (const api of jsonrpc.flat()) {
    const namespace = api.name.substring(2).toLowerCase()

    for (const method of api.children) {
      if (method.name === 'constructor') continue

      const signature = method.signatures[0]

      const methodname = `${namespace}.${method.name}`
      apispec[methodname] = {
        parameters: [],
        validate: {},
        required: [],
      }

      const parameters = (signature.parameters || []).map(p => {
        apispec[methodname].parameters.push(p.name)
        if (!p.flags.isOptional) apispec[methodname].required.push(p.name)
        apispec[methodname].validate[p.name] = makeValidator(makeSchema(p.type))

        const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
        const type = printType(p.type)
        const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`
        return `${name}: ${type}${dflt}`
      }).join(', ')
      const returnType = `: ${printType(signature.type.typeArguments[0])}`.replace(': void', '')

      const description = signature.comment.summary.map(s => {
        if (!s.kind.match(/^(code|text)$/)) throw s
        return s.text
      }).join('')

      page.push(`## ${namespace}.${method.name}(${parameters})${returnType}\n\n${description}\n\n`)
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
