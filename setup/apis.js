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
    cxt.fail(_`typeof ${data} !== 'string' || !(${data}.replace(/%(?:(\\d*)[$]|\\(([_a-zA-Z]+)\\))[+]?(?:0|'.)?-?\\d*(?:[.]\\d+)?([bcdieufgostTvxXj])/g, ((m, num, name, mod) => {
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

Zotero.fields = new Set(['dateAdded', 'dateModified'])
Zotero.fieldLookup = { dateadded: 'dateAdded', datemodified: 'dateModified' }
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

class TypePrinter {
  #source = null

  constructor(source) {
    this.#source = source
  }

  print(type) {
    type = flattenUnion(patch(type))

    switch (typeName(type)) {
      case 'number':
      case 'string':
      case 'boolean':
      case 'any':
      case 'void':
        return type.name

      case 'union':
        return `(${type.types.map(t => this.print(t)).join(' | ')})`

      case 'literal':
        return typeof type.value === 'string' ? `'${jsesc(type.value)}'` : JSON.stringify(type.value)

      case 'reference.typescript.RegExp':
        return type.name

      case 'reference.typescript.Record':
        return `Record<${type.typeArguments.map(t => this.print(t)).join(', ')}>`

      case 'tuple':
        return `[ ${type.elements.map(t => this.print(t)).join(', ')} ]`

      case 'array':
        return `${this.print(type.elementType)}[]`

      case 'reference.zotero-better-bibtex.Template':
        return '`sprintf-style format template`'

      case 'reference.zotero-better-bibtex.AuthorType':
        return this.print({
          type: 'union',
          types: ['author', 'editor', 'translator', 'collaborator', '*'].map(a => ({ type: 'literal', value: a })),
        })

      case 'reference.zotero-better-bibtex.CreatorType':
        return 'Creator'

      case 'reflection':
        if (type.declaration.children) return `{ ${type.declaration.children.map(t => `${t.name}: ${this.print(t.type)}`).join('; ')} }`
        if (type.typeArguments?.length === 1) return this.print(type.typeArguments[0])
        throw type

      case 'reference.zotero-types.Collection':
        return type.name

      case 'reference.zotero-better-bibtex.TransliterateMode':
        return this.print(this.#source.children.find(node => node.name == 'TransliterateMode' && node.variant == 'declaration').type)
      case 'reference.zotero-better-bibtex.TransliterateModeAlias':
        return this.print(this.#source.children.find(node => node.name == 'TransliterateModeAlias' && node.variant == 'declaration').type)

      default:
        throw new Error(JSON.stringify(type))
    }
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

class SchemaBuilder {
  #description = {}
  #source = null

  constructor(source) {
    this.#source = source
  }

  make(type) {
    type = flattenUnion(patch(type))

    if (type.enum) throw type

    switch (typeName(type)) {
      case 'number':
      case 'string':
      case 'boolean':
        return { type: type.name }

      case 'union': {
        const oneOf = type.types.map(t => this.make(t))
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
          additionalProperties: this.make(type.typeArguments[1]),
        }

      case 'tuple':
        return { type: 'array', prefixItems: type.elements.map(t => this.make(t)), minItems: type.elements.length, maxItems: type.elements.length }

      case 'array':
        return { type: 'array', items: this.make(type.elementType) }

      case 'reference.zotero-better-bibtex.Template':
        switch (type.typeArguments[0].value) {
          case 'creator':
            this.#description.creatorTemplate = [
              '',
              'in the creator template, you can use:',
              '* `%(f)s`: family ("last") name',
              '* `%(f_zh)s`: family ("last") name extracted from chinese compound names. Need `jieba` to be enabled',
              '* `%(g)s`: given ("first") name',
              '* `%(g_zh)s`: given ("first") name extracted from chinese compound names. Need `jieba` to be enabled',
              '* `%(i)s`: given-name initials',
              '* `%(I)s`: given-name initials, upper-case',
              '',
            ].join('\n')
            return { sprintf: '%fs%gs%is%Is%g_zhs%f_zhs' }
          case 'postfix':
            this.#description.postfixTemplate = [
              '',
              'in the template, you can use:',
              '* `%(a)s`: lower-case alphabetic disambiguator',
              '* `%(A)s`: upper-case alphabetic disambiguator',
              '* `%(n)s`: numeric disambiguator',
              '',
            ].join('\n')
            return { sprintf: '%as%As%ns' }
          default:
            throw type
        }

      case 'reference.zotero-better-bibtex.AuthorType':
        return { enum: ['author', 'editor', 'translator', 'collaborator', '*'] }

      case 'reference.zotero-better-bibtex.CreatorType':
        this.#description.creatorType = `\ncreator type can be one of ${Zotero.creatorTypes.map(t => '`' + t + '`').join(', ')}\n`
        return { type: 'string', format: 'creator-type' }

      case 'reference.zotero-better-bibtex.ItemType':
        this.#description.itemType = `\ncreator type can be one of ${Zotero.itemTypes.map(t => '`' + t + '`').join(', ')}\n`
        return { type: 'string', format: 'item-type' }

      case 'reference.zotero-better-bibtex.ItemField':
        this.#description.itemField = `\nfield can be one of ${Zotero.fields.map(t => '`' + t + '`').join(', ')}\n`
        return { type: 'string', format: 'item-field' }

      case 'reference.zotero-better-bibtex.BabelLanguage':
        this.#description.babelLanguage = `\nlanguage can be one of ${Babel.languages.map(t => '`' + t + '`').join(', ')}\n`
        return { type: 'string', format: 'babel-language' }

      case 'reference.zotero-better-bibtex.TransliterateMode':
        return this.make(this.#source.children.find(node => node.name == 'TransliterateMode' && node.variant == 'declaration').type)
      case 'reference.zotero-better-bibtex.TransliterateModeAlias':
        return this.make(this.#source.children.find(node => node.name == 'TransliterateModeAlias' && node.variant == 'declaration').type)

      case 'reflection':
        if (type.typeArguments?.length === 1) return this.make(type.typeArguments[0])
        return {
          type: 'object',
          properties: type.declaration.children.reduce((acc, p) => ({ ...acc, [p.name]: this.make(p.type) }), {}),
        }

      default:
        console.log(type.declaration)
        throw new Error(JSON.stringify({ name: typeName(type), type }, null, 2))
    }
  }

  get description() {
    return Object.values(this.#description).join('\n')
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

const Formatter = ast(path.join(root, 'content/key-manager/formatter.ts'))
const formatter = Formatter.children.find(child => child.name === 'PatternFormatter')
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

  const typePrinter = new TypePrinter(Formatter)
  for (const method of methods.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))) {
    const builder = new SchemaBuilder(Formatter)

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

    let parameters = []
    let summary = (signature.parameters || []).map(p => {
      let schema = typescriptType[method.name]?.[p.name] || p.type
      schema = builder.make(schema)
      if (p.flags.isRest) {
        schema = schema.items // so that we can give sensible, per-argument errors
        apispec[_name].rest = p.name
      }
      apispec[_name].validate[p.name] = makeValidator(schema)

      if (!p.flags.isOptional && !p.defaultValue) apispec[_name].required.push(p.name)

      const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
      const type = typePrinter.print(p.type)
      const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`

      parameters.push({
        name: `<code>${showdown.makeHtml(p.name)}</code>`,
        type: showdown.makeHtml(type),
        doc: showdown.makeHtml(p.comment.summary.map(c => c.text).join('')),
      })

      return `${name}: ${type}${dflt}`
    }).join(', ')
    summary = summary ? `(${summary})` : ''
    summary = `<b>${escapeHTML(method.name.substring(1))}</b>${escapeHTML(summary)}`

    let description = signature.comment.summary.map(s => {
      if (!s.kind.match(/^(code|text)$/)) throw s
      return s.text
    }).join('') + '\n' + builder.description
    description = showdown.makeHtml(description || '')

    parameters = parameters.length
      ? `<table><tr><th><b>parameter</b></th><th>type</th><th/></tr>${parameters.map(p => `<tr><td>${p.name}</td><td>${p.type}</td><td>${p.doc}</td></tr>`).join('')}</table>`
      : ''

    const kind = method.name[0]
    section[kind].push({ summary, parameters, description })

    const testname = `${kind}${method.name}`
    const test = methods.find(m => m.name === testname)
    if (test) apispec[_name].test = test.name
  }

  section.$ = section.$.filter(s => !s.summary.startsWith('<b>field</b>'))
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
  const JsonRpc = ast(path.join(root, 'content/json-rpc.ts'))
  const jsonrpc = JsonRpc.children.filter(child => child.name.startsWith('NS'))
  const typePrinter = new TypePrinter(JsonRpc)

  const apispec = {}
  const page = []
  for (const api of jsonrpc.flat()) {
    const builder = new SchemaBuilder
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

      let description = ''
      const parameters = (signature.parameters || []).map(p => {
        if (p.comment?.summary?.length) {
          description += `* ${p.name}: `
          description += p.comment.summary.map(s => {
            if (!s.kind.match(/^(code|text)$/)) throw s
            return s.text
          }).join('')
          description += '\n'
        }

        apispec[methodname].parameters.push(p.name)
        if (!p.flags.isOptional) apispec[methodname].required.push(p.name)
        apispec[methodname].validate[p.name] = makeValidator(builder.make(p.type))

        const name = (p.flags.isRest ? `...${p.name}` : p.name) + (p.flags.isOptional ? '?' : '')
        const type = typePrinter.print(p.type)
        const dflt = typeof p.defaultValue === 'undefined' ? '' : ` = ${p.defaultValue}`
        return `${name}: ${type}${dflt}`
      }).join(', ')
      const returnType = `: ${typePrinter.print(signature.type.typeArguments[0])}`.replace(': void', '')

      description += signature.comment.summary.map(s => {
        if (!s.kind.match(/^(code|text)$/)) throw s
        return s.text
      }).join('') + '\n' + builder.description

      page.push(`**${namespace}.${method.name}**(${parameters})${returnType}\n\n${description}\n\n`)
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
