#!/usr/bin/env node

import crypto from 'crypto'
import fs from 'fs'
import { generateSchema } from 'json-schema-it'
import path from 'path'
import ts from 'typescript'
import { inspect } from 'util'
import { parse as parseComment } from 'comment-parser'

import Showdown from 'showdown'
const Markdown = new class {
  constructor() {
    this.showdown = new Showdown.Converter()
  }

  render(md) {
    return this.showdown.makeHtml(md).replace(/^<p>/, '').replace(/<\/p>$/, '')
  }
}()

const TSDoc = new class {
  extract(comment) {
    if (!comment) return { body: '', parameters: {} }

    const parsedBlocks = parseComment(comment, { spacing: 'preserve' })

    const body = parsedBlocks[0].description
    const parameters = {}
    let m
    for (const tag of parsedBlocks[0].tags) {
      if (tag.tag === 'param') {
        if (m = tag.name.match(/^([^.]+)[.](.+)/)) {
          const [, name, member ] = m
          parameters[name] += `\n * .${member}: ${tag.description}`
        }
        else {
          parameters[tag.name] = tag.description
        }
      }
    }

    return { body, parameters }
  }
}()

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

function stringify(obj, sorted) {
  return inspect(obj, {
    depth: null,
    maxArrayLength: null,
    maxStringLength: null,
    // breakLength: Infinity,
    sorted,
  })
}

const stringSort = (a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' })

const compilerOptions = {
  target: ts.ScriptTarget.ESNext,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.NodeNext,
}

function unique(words) {
  return [...(new Set(words))].sort(stringSort)
}

const Zotero = new class {
  constructor() {
    const schema = JSON.parse(fs.readFileSync('schema/zotero.json', 'utf-8'))
    Object.assign(this, {
      itemTypes: unique(schema.itemTypes.map(it => it.itemType)),
      itemFields: unique([
        ...schema.itemTypes.flatMap(it => it.fields.flatMap(fields => Object.values(fields))),
        'dateAdded',
        'dateModified',
      ]),
      creatorTypes: unique(schema.itemTypes.flatMap(it => it.creatorTypes.map(ct => ct.creatorType))),
    })
  }
}()

const Babel = new class {
  constructor() {
    const tags = JSON.parse(fs.readFileSync('gen/babel/tag.json', 'utf-8'))
    this.languages = unique([Object.keys(tags), ...Object.values(tags)])
  }
}()
export function printed(schema, parenthesize) {
  const parens = s => s.includes(' | ') ? `(${s})` : s
  const wordlist = (words, sep = ' | ') => words.map(_ => `'${_}'`).join(sep)

  switch (schema.type) {
    case 'object':
      if (schema.additionalProperties) return `{ [string]: ${printed(schema.additionalProperties)} }`
      if (schema.properties) return `{ ${Object.entries(schema.properties).map(([k, t]) => `${k}: ${printed(t)}`).join('; ')} }`
      console.error('Unexpected object schema:', schema)
      process.exit(1)

    case 'string':
      if (schema.format === 'item-type') return wordlist(Zotero.itemTypes)
      if (schema.format === 'item-field') return wordlist(Zotero.itemFields)
      if (schema.format === 'creator-type') return wordlist(Zotero.creatorTypes)

      if (schema.format === 'babel-language') return wordlist(Babel.languages)

      if (Object.keys(schema).length === 1) return 'string'
      if (schema.enum) return wordlist(unique(schema.enum))
      if (typeof schema.const === 'string') return `'${schema.const}'`
      console.error('Unexpected string schema:', schema)
      process.exit(1)

    case 'number':
    case 'boolean':
      return schema.type

    case 'integer':
      return 'number'

    case 'regexp':
      return 'RegExp'

    case 'array':
      return schema.prefixItems
        ? `[ ${schema.prefixItems.map(printed).join(', ')} ]`
        : `${parens(printed(schema.items))}[]`

    default:
      if (!Object.keys(schema).length) return 'any'
      if (schema.instanceof) return schema.instanceof
      if (schema.oneOf) return schema.oneOf.map(subtype => printed(subtype)).join(' | ')
      if (schema.sprintf) return `string containing at least one of ${wordlist([...(schema.sprintf.matchAll(/%(.*?)s/g))].flatMap(r => `%(${r[1]})s`), ', ')}`

      console.error('Unexpected schema:', schema)
      process.exit(1)
  }
}

const compilerHost = {
  fileExists: ts.sys.fileExists,
  readFile: ts.sys.readFile,

  getSourceFile: (file, languageVersion) => {
    const content = ts.sys.readFile(file)
    if (content) {
      return ts.createSourceFile(file, content, languageVersion, true)
    }
    return undefined
  },
  getDefaultLibFileName: () => ts.getDefaultLibFileName(compilerOptions),
  writeFile: () => {}, // No-op
  getCurrentDirectory: ts.sys.getCurrentDirectory,
  getDirectories: ts.sys.getDirectories,
  getCanonicalFileName: f => f,
  useCaseSensitiveFileNames: () => ts.sys.useCaseSensitiveFileNames,
  getNewLine: () => ts.sys.newLine,
  getCompilerOptions: () => compilerOptions,
}

function simplifySchema(schema) {
  if (typeof schema !== 'object' || schema === null || Array.isArray(schema)) {
    return schema
  }

  if (schema.oneOf && !schema.oneOf.find(subtype => !subtype.oneOf)) {
    schema.oneOf = schema.oneOf.flatMap(subtype => subtype.oneOf)
  }

  // Helper function to check if a new type is compatible with the current base type,
  // potentially broadening the base type (e.g., 'integer' and 'number' broaden to 'number').
  const checkCompatibility = (currentBase, newType) => {
    // 1. Initial state (first item)
    if (currentBase === null) return newType

    // 2. Exact match
    if (currentBase === newType) return currentBase

    // 3. Handle number/integer compatibility: always broaden to 'number'
    if (
      (currentBase === 'integer' && newType === 'number')
      || (currentBase === 'number' && newType === 'integer')
    ) {
      return 'number'
    }

    // 4. All other mismatches (e.g., string vs. boolean, string vs. number) are incompatible
    return false
  }

  // 1. Process nested properties recursively
  for (const key in schema) {
    if (Object.prototype.hasOwnProperty.call(schema, key)) {
      // Recurse into objects (like 'properties', 'items', 'definitions')
      if (typeof schema[key] === 'object' && !Array.isArray(schema[key])) {
        schema[key] = simplifySchema(schema[key])
      }
      // Recurse into arrays (like 'oneOf', 'allOf', 'items' for tuples)
      else if (Array.isArray(schema[key])) {
        schema[key] = schema[key].map(item => simplifySchema(item))
      }
    }
  }

  // 2. Simplification Logic: Convert single-item 'enum' to 'const'
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length === 1) {
    // Keep the 'type' property if it exists
    const type = schema.type

    // Replace enum with const
    schema.const = schema.enum[0]
    delete schema.enum

    // Ensure 'type' is present for the 'const' value if it wasn't there
    if (!schema.type && type) {
      schema.type = type
    }
    else if (!schema.type) {
      // Infer type from the const value's JavaScript type
      schema.type = typeof schema.const === 'number'
        ? (Number.isInteger(schema.const) ? 'integer' : 'number')
        : typeof schema.const
    }
  }

  // 3. Simplification Logic: Check for 'oneOf' merge potential (Union simplification)
  if (schema.oneOf && Array.isArray(schema.oneOf)) {
    let allEnums = []
    let isMergeable = true
    let baseType = null

    // Check every sub-schema in the oneOf array
    for (const subSchema of schema.oneOf) {
      let typeForMerge = null
      let values = []

      // Removed the aggressive check for complex schemas here.
      // Complexity checks now rely on the final 'else' block.

      // --- Attempt to extract type and value(s) ---
      if (subSchema.type && subSchema.enum && Array.isArray(subSchema.enum)) {
        // CASE 1: Sub-schema is an enum
        typeForMerge = subSchema.type
        values.push(...subSchema.enum)
      }
      else if (subSchema.const !== undefined) {
        // CASE 2: Sub-schema is a const

        // Use explicit type if present, otherwise infer.
        if (subSchema.type) {
          typeForMerge = subSchema.type
        }
        else {
          const inferredType = typeof subSchema.const
          typeForMerge = inferredType === 'number'
            ? (Number.isInteger(subSchema.const) ? 'integer' : 'number')
            : inferredType
        }
        values.push(subSchema.const)
      }
      else {
        // Fallthrough: Not a simple const/enum (e.g., just 'type: "string"' without const/enum, or a complex schema)
        isMergeable = false
        break
      }

      // --- Validation and Merge Check ---
      if (typeForMerge && values.length > 0) {
        // Check 1: Consistency
        const newBaseType = checkCompatibility(baseType, typeForMerge)
        if (newBaseType === false) {
          isMergeable = false
          break
        }
        baseType = newBaseType

        // Check 2: Collect values
        allEnums.push(...values)
      }
      else {
        // Should only be hit if extraction failed in a non-obvious way
        isMergeable = false
        break
      }
    }

    // 4. If mergeable, replace the 'oneOf' block with the consolidated 'type' and 'enum'
    if (isMergeable && allEnums.length > 0) {
      // Remove the 'oneOf' key
      delete schema.oneOf

      // Set the consolidated type
      if (baseType && baseType !== 'object') {
        schema.type = baseType
      }

      // Add the simplified enum property
      schema.enum = [...new Set(allEnums)] // Use Set to remove duplicates
    }
  }

  return schema
}

function sortObject(obj) {
  if (obj === null || typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(sortObject)
  return Object.keys(obj).sort(stringSort).reduce((acc, key) => {
    acc[key] = sortObject(obj[key])
    return acc
  }, {})
}

class APIReader {
  constructor(sourcePath, className, methodName) {
    this.className = className
    this.methodName = methodName
    this.source = sourcePath

    const program = ts.createProgram([sourcePath], compilerOptions, compilerHost)
    this.parsedSourceFile = program.getSourceFile(sourcePath)
    if (!this.parsedSourceFile) {
      console.error(`ERROR: Could not load source file: ${sourcePath}. Please ensure the file exists and is readable.`)
      process.exit(1)
    }

    this.currentClassName = null
    this.typeDeclaration = {}
    this.api = {}
    this.traverse(this.parsedSourceFile)
    this.api = sortObject(this.api)
  }

  traverse(node) {
    if (ts.isClassDeclaration(node) && node.name) {
      this.currentClassName = node.name.getText(this.parsedSourceFile)
    }
    else if (this.currentClassName?.match(this.className) && ts.isMethodDeclaration(node)) {
      this.templateDoc = ''
      const methodName = node.name.getText(this.parsedSourceFile)

      if (methodName.match(this.methodName)) {
        if (!this.api[this.currentClassName]) this.api[this.currentClassName] = {}

        const doc = TSDoc.extract(this.getTSDoc(node))

        if (!node.type) throw node.getText()
        const returnType = simplifySchema(this.resolveType(node.type))

        const parameters = node.parameters.map(param => {
          const paramName = param.name.getText(this.parsedSourceFile)

          const isOptional = !!param.questionToken || !!param.initializer
          const defaultValue = param.initializer ? eval(param.initializer.getText(this.parsedSourceFile)) : undefined
          // const originalParamTypeString = param.type ? param.type.getText(this.parsedSourceFile) : defaultValue

          let paramType
          if (param.type) {
            paramType = this.resolveType(param.type)
          }
          else if (typeof defaultValue !== 'undefined') {
            paramType = generateSchema(defaultValue)
          }
          else {
            console.error(`[${this.source}] ${this.currentClassName}.${methodName}.${paramName} has no type`)
            process.exit(1)
          }

          return {
            name: paramName,
            type: simplifySchema(paramType),
            doc: (doc.parameters[paramName] || '').trim(),
            isOptional,
            isRest: !!param.dotDotDotToken,
            defaultValue,
          }
        })

        this.api[this.currentClassName][methodName] = {
          doc: (doc.body + this.templateDoc).trim(),
          name: methodName,
          parameters,
          returns: returnType,
        }
      }
    }
    else if (ts.isTypeAliasDeclaration(node)) {
      this.typeDeclaration[node.name.text] = node.type
    }

    ts.forEachChild(node, child => this.traverse(child))

    if (ts.isClassDeclaration(node)) this.currentClassName = null
  }

  resolveType(type) {
    let name
    switch (ts.SyntaxKind[type.kind] || '') {
      case 'AnyKeyword':
      case 'VoidKeyword':
        return {}

      case 'ArrayType':
        return { type: 'array', items: this.resolveType(type.elementType) }

      case 'TypeLiteral':
        return {
          type: 'object',
          properties: type.members.reduce((acc, m) => {
            if (!ts.isPropertySignature(m)) throw m.getText()
            acc[m.name.getText()] = this.resolveType(m.type)
            return acc
          }, {}),
          required: type.members.filter(m => m.questionToken !== undefined).map(m => m.name.getText()),
          additionalProperties: false,
        }

      case 'TypeReference':
        if (ts.SyntaxKind[type.typeName.kind] === 'Identifier') {
          name = type.typeName.text
          switch (name) {
            case 'Record':
              return {
                type: 'object',
                additionalProperties: this.resolveType(type.typeArguments[1]),
              }
            case 'Promise':
              if (type.typeArguments.length !== 1) throw type.getText()
              return this.resolveType(type.typeArguments[0])
            case 'ZoteroItemType':
              return { type: 'string', format: 'item-type' }
            case 'ZoteroFieldName':
              return { type: 'string', format: 'item-field' }
            case 'BabelLanguage':
              return { type: 'string', format: 'babel-language' }
            case 'CreatorType':
              return { type: 'string', format: 'creator-type' }
            case 'Template':
              switch (type.typeArguments[0].literal.text) {
                case 'creator':
                  this.templateDoc += [
                    '',
                    'in the creator template, you can use:',
                    '* `%(f)s`: family ("last") name',
                    '* `%(F)s`: family ("last") name without dropping particles',
                    '* `%(f_zh)s`: family ("last") name extracted from chinese compound names. Need `jieba` to be enabled',
                    '* `%(g)s`: given ("first") name',
                    '* `%(g_zh)s`: given ("first") name extracted from chinese compound names. Need `jieba` to be enabled',
                    '* `%(i)s`: given-name initials',
                    '* `%(I)s`: given-name initials, upper-case',
                    '',
                  ].join('\n')
                  return { sprintf: '%Fs%fs%gs%is%Is%g_zhs%f_zhs' }
                case 'postfix':
                  this.templateDoc += [
                    '',
                    'in the template, you can use:',
                    '* `%(a)s`: lower-case alphabetic disambiguator',
                    '* `%(A)s`: upper-case alphabetic disambiguator',
                    '* `%(n)s`: numeric disambiguator',
                  ].join('\n')
                  return { sprintf: '%as%As%ns' }
              }
              break

            case 'RegExp':
              return { instanceof: name }
          }

          if (!this.typeDeclaration[name]) {
            throw new Error(`could not resolve ${name}`)
          }
          return this.resolveType(this.typeDeclaration[name])
        }
        else {
          throw new Error(`Unexpected TypeReference to ${ts.SyntaxKind[type.typeName.kind]}`)
        }

        break
      case 'ParenthesizedType':
        return this.resolveType(type.type)

      case 'UnionType':
        return { oneOf: type.types.map(subType => this.resolveType(subType)) }

      case 'LiteralType':
        switch (type.literal.kind) {
          case ts.SyntaxKind.StringLiteral:
            if (ts.isStringLiteral(type.literal)) return { const: type.literal.text, type: 'string' }
            break

          case ts.SyntaxKind.NumericLiteral:
            if (ts.isNumericLiteral(type.literal)) {
              const value = Number(type.literal.text)
              return { const: value, type: Number.isInteger(value) ? 'integer' : 'number' }
            }
            break

          case ts.SyntaxKind.TrueKeyword:
            return { const: true, type: 'boolean' }

          case ts.SyntaxKind.FalseKeyword:
            return { const: false, type: 'boolean' }

          case ts.SyntaxKind.NullKeyword:
            return { const: null, type: 'null' }

          case ts.SyntaxKind.PrefixUnaryExpression:
            // Handles unary minus for negative numbers (e.g., type T = -5;)
            if (ts.isPrefixUnaryExpression(type.literal) && type.literal.operator === ts.SyntaxKind.MinusToken) {
              const operand = type.literal.operand
              if (ts.isNumericLiteral(operand)) {
                const value = -Number(operand.text)
                return { const: value, type: Number.isInteger(value) ? 'integer' : 'number' }
              }
            }
            break
        }
        throw new Error(`Unexpected literal ${ts.SyntaxKind[type.literal.kind]}`)

      case 'StringKeyword':
        return { type: 'string' }
      case 'NumberKeyword':
        return { type: 'number' }
      case 'BooleanKeyword':
        return { type: 'boolean' }

      case 'TupleType':
        return {
          type: 'array',
          prefixItems: type.elements.map(subType => this.resolveType(subType)),
          minItems: type.elements.length,
          maxItems: type.elements.length,
          items: false,
        }

      default:
        throw new Error(`Unexpected ${ts.SyntaxKind[type.kind]}`)
    }
  }

  getTSDoc(node) {
    const leadingCommentRanges = ts.getLeadingCommentRanges(this.parsedSourceFile.text, node.pos)
    if (!leadingCommentRanges) {
      return null
    }

    for (const range of leadingCommentRanges) {
      const commentText = this.parsedSourceFile.text.substring(range.pos, range.end)
      if (commentText.trim().startsWith('/**')) return commentText
    }
    return null
  }
}

import Ajv, { _ as code } from 'ajv/dist/2020.js'
const ajv = new Ajv({
  code: {
    source: true,
    esm: true,
  },
})

import standaloneCode from 'ajv/dist/standalone/index.js'
const Validator = new class {
  constructor() {
    this.validators = {}
    if (!fs.existsSync('gen/api/ajv')) fs.mkdirSync('gen/api/ajv', { recursive: true })
  }

  make(schema) {
    schema = {
      // $schema: 'https://json-schema.org/draft/2020-12/schema#',
      ...schema,
    }
    const normalized = stringify(schema, true)
    let hash = crypto
      .createHash('sha256')
      .update(normalized, 'utf8')
      .digest()
      .toString('base64')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20)
    if (this.validators[hash] && this.validators[hash] !== normalized) throw new Error('hash clash')
    this.validators[hash] = normalized

    const filename = path.join('gen/api/ajv', hash + '.js')
    const validate = ajv.compile(schema)
    const prefix = normalized.includes('\n')
      ? `/*\n${normalized}\n*/`
      : `// ${normalized}`
    fs.writeFileSync(filename, `${prefix}\n\n${standaloneCode(ajv, validate)}`)
    return hash
  }

  link(code) {
    let imports = new Set
    for (const hash of Object.keys(this.validators)) {
      code = code.replace(new RegExp(`'${hash}'`, 'g'), () => {
        imports.add(hash)
        return `_${hash}`
      })
    }
    imports = [...imports].map(hash => `import { validate as _${hash} } from './ajv/${hash}'`).join('\n')
    return `${imports}\n${code}`
  }
}()

ajv.addKeyword({
  keyword: 'instanceof',
  schemaType: 'string',
  code(cxt) {
    const { data, schema } = cxt
    cxt.fail(code`!(${data} instanceof ` + `${schema})`)
  },
})
ajv.addKeyword({
  keyword: 'sprintf',
  schemaType: 'string',
  code(cxt) {
    const { data, schema } = cxt
    cxt.fail(code`typeof ${data} !== 'string' || !(${data}.replace(/%(?:(\\d*)[$]|\\(([_a-zA-Z]+)\\))[+]?(?:0|'.)?-?\\d*(?:[.]\\d+)?([bcdieufgostTvxXj])/g, ((m, num, name, mod) => {
      if (typeof num === 'string') return '\\x15'
      return ${schema}.includes('%' + name + mod) ? '\\x06' : '\\x15'
    })).match(/^(?=.*\\x06)(?!.*\\x15)/))`)
  },
})
ajv.addFormat('item-type', new RegExp(`^(${Zotero.itemTypes.join('|')})$`, 'i'))
ajv.addFormat('creator-type', new RegExp(`^(${Zotero.creatorTypes.join('|')})$`, 'i'))
ajv.addFormat('babel-language', new RegExp(`^(${Babel.languages.join('|')})$`, 'i'))
ajv.addFormat('item-field', new RegExp(`^(${Zotero.itemFields.join('|')})$`, 'i'))

function printParameters(method, brace) {
  let doc = method.parameters.map(p => `${p.name}${p.isOptional && typeof p.defaultValue === 'undefined' ? '?' : ''}${p.isRest ? '...' : ''}: ${printed(p.type)}${typeof p.defaultValue !== 'undefined' ? '=' : ''}${typeof p.defaultValue !== 'undefined' ? stringify(p.defaultValue) : ''}`).join(', ')
  if (brace || method.parameters.length) doc = `(${doc})`
  return doc
}

function compile(method) {
  const rest = method.parameters.find(p => p.isRest)
  return {
    parameters: method.parameters.map(p => p.name),
    ...(rest ? { rest: rest.name } : {}),
      defaults: method.parameters.map(p => p.defaultValue === null ? undefined : p.defaultValue),
      required: method.parameters.filter(p => !p.isOptional && typeof p.defaultValue === 'undefined').map(p => p.name),
      validate: method.parameters.reduce((parameters, p) => ({
        ...parameters,
        [p.name]: Validator.make(p.type),
      }), {}),
    }
}

(function KeyFormula() {
  const formatter = new APIReader('content/key-manager/formatter.ts', /^PatternFormatter$/, /^[$_]/)
  const methods = {}
  const doc = { $: [], _: [] }

  for (const [name, declaration] of Object.entries(formatter.api.PatternFormatter)) {
    if (name.match(/^[$_]{2}/)) continue

    if (name.startsWith('_') && declaration.parameters.shift()?.name !== 'input') {
      console.error(`PatternFormatter.${name} does not have 'input' as its first parameter`)
      process.exit(1)
    }

    const section = name[0]
    const test = `${section}${name}`
    methods[name.toLowerCase()] = {
      name,
      ...compile(declaration),
      ...(formatter.api.PatternFormatter[test] ? { test } : {}),
    }

    if (name !== '$field') {
      doc[section].push({
        summary: `<b>${section === '_' ? '.' : ''}${escapeHTML(name.substring(1))}</b>${escapeHTML(printParameters(declaration))}`,
        description: declaration.doc ? Markdown.render(declaration.doc) : '',
        parameters: declaration.parameters.length
          ? `<table>
              <tr>
                <th><b>parameter</b></th>
                <th/>
                <th>value assumed when not provided</th>
                <th>valid values</th>
              </tr>${
            declaration.parameters.map(p => `
              <tr>
                <td><code>${p.name}${p.isRest ? '...' : ''}</code></td>
                <td>${Markdown.render(p.doc)}</td>
                <td>${!p.isOptional && typeof p.defaultValue === 'undefined' ? 'none; must be provided' : stringify(p.DefaultValue)}</td>
                <td>${printed(p.isRest ? p.type.items : p.type)}</td>
              </tr>`).join('')
          }</table>`
          : '',
      })
    }
  }

  const fields = Zotero.itemFields.reduce((acc, field) => ({...acc, [field.toLowerCase()]: field }), {})
  const js = [
    '/* eslint-disable quote-props, comma-dangle */',
    `export const methods = ${stringify(methods)}`,
    `export const fields = ${stringify(fields)}`,
  ].join('\n')
  fs.writeFileSync('gen/api/key-formatter.js', Validator.link(js))

  fs.writeFileSync('site/data/citekeyformatters/functions.json', JSON.stringify(doc.$, null, 2))
  fs.writeFileSync('site/data/citekeyformatters/filters.json', JSON.stringify(doc._, null, 2))
})()

;(function JSONRPC() {
  const jsonrpc = new APIReader('content/json-rpc.ts', /^NS/, /./)
  const api = {}
  let page = []
  for (let [ns, methods] of Object.entries(jsonrpc.api)) {
    ns = ns.substring(2).toLowerCase()
    for (let [method, declaration] of Object.entries(methods)) {
      method = `${ns}.${method}`
      let returnType = `returns: ${printed(declaration.returns)}`
      if (returnType === 'returns: any') returnType = ''
      page.push([
        `**${method}**${printParameters(declaration, true)}`,
        '',
        returnType,
        '',
        declaration.parameters.filter(p => p.doc).map(p => `* ${p.name}: ${p.doc}`).join('\n'),
        '',
        declaration.doc,
        '',
        '',
      ].join('\n'))

      api[method] = compile(declaration)
    }
  }
  fs.writeFileSync('site/layouts/shortcodes/json-rpc.md', page.sort().join('\n'))
  const js = [
    '/* eslint-disable quote-props, comma-dangle */',
    `export const methods = ${stringify(api)}`,
  ].join('\n')
  fs.writeFileSync('gen/api/json-rpc.js', Validator.link(js))
})()
