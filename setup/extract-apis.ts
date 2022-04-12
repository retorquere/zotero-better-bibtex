#!/usr/bin/env npx ts-node
/* eslint-disable prefer-template, @typescript-eslint/no-unsafe-return */

import { Method, API } from './api-extractor'
import * as fs from 'fs'
import stringify from 'fast-safe-stringify'
import jsesc from 'jsesc'
import _ from 'lodash'

class FormatterAPI {
  private formatter: Record<string, Method>
  public signature: Record<string, any> = {}
  public doc: { function: Record<string, string>, filter: Record<string, string> } = { function: {}, filter: {} }

  constructor(source: string) {
    this.formatter = new API(source).classes.PatternFormatter
    for (let [name, method] of Object.entries(this.formatter)) {
      const kind = {$: 'function', _: 'filter'}[name[0]]
      if (!kind) continue

      const lcName = name.toLowerCase()
      if (this.signature[lcName]) throw new Error(`duplicate ${kind} ${lcName}`)
      this.signature[lcName] = _.cloneDeep({
        name,
        parameters: method.parameters.map(p => p.name),
        defaults: method.parameters.map(p => p.default),
        rest: method.parameters.find(p => p.rest)?.name,
        schema: method.schema,
      })
      if (!this.signature[lcName].rest) delete this.signature[lcName].rest

      /*
      let names = [ name.substr(1) ]
      let name_edtr = ''
      if (kind === 'function' && method.parameters.find(p => p.name === 'onlyEditors')) { // auth function
        for (const [author, editor] of [['authors', 'editors'], ['author', 'editor'], ['auth.auth', 'edtr.edtr'], [ 'auth', 'edtr' ]]) {
          if (names[0].startsWith(author)) {
            names.push(name_edtr = names[0].replace(author, editor))
            break
          }
        }
      }
      if (name_edtr) {
        name_edtr = `$${name_edtr}`
        this.signature[name_edtr] = _.cloneDeep(this.signature[name])

        for (const mname of [name, name_edtr]) {
          this.signature[mname].schema.properties.onlyEditors = { const: mname === name_edtr }
        }
      }
      */

      if (kind === 'function') {
        if (method.parameters.find(p => p.name === 'n')) name = `${name}N`
        if (method.parameters.find(p => p.name === 'm')) name = `${name}_M`
      }
      let quoted = '`' + name + '`'

      switch (kind) {
        case 'function':
          if (method.parameters.find(p => p.name === 'withInitials')) quoted += ', `+initials`'
          if (method.parameters.find(p => p.name === 'joiner')) quoted += ', `+<joinchar>`'
          break
        case 'filter':
          if (method.parameters.length) quoted += '=' + method.parameters.map(p => `${p.name}${method.schema.required.includes(p.name) ? '' : '?'} (${this.typedoc(method.schema.properties[p.name])})`).join(', ')
          break
      }

      this.doc[kind][quoted] = method.doc
    }

    /* re-enable this after the formatter migration
    for (const signature of Object.values(this.signature)) {
      for (const [ property, type ] of Object.entries(signature.schema.properties)) {
        signature.schema.properties[property] = this.upgrade(type)
      }
    }
    */
  }

  private typedoc(type): string {
    if (['boolean', 'string', 'number'].includes(type.type)) return type.type
    if (type.oneOf) return type.oneOf.map(t => this.typedoc(t)).join(' | ')
    if (type.anyOf) return type.anyOf.map(t => this.typedoc(t)).join(' | ')
    if (type.const) return JSON.stringify(type.const)
    if (type.enum) return type.enum.map(t => this.typedoc({ const: t })).join(' | ')
    if (type.instanceof) return type.instanceof
    throw new Error(`no rule for ${JSON.stringify(type)}`)
  }
}

if (!fs.existsSync('gen/api')) fs.mkdirSync('gen/api', { recursive: true })

const formatters = new FormatterAPI('content/key-manager/formatter.ts')
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify.stable(formatters.doc.function, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify.stable(formatters.doc.filter, null, 2))

fs.writeFileSync('gen/api/key-formatter.ts', `/* eslint-disable quote-props, comma-dangle, no-magic-numbers */
export const methods = ${jsesc(formatters.signature, { compact: false, indent: '  ' })} as const
`)

class JSONRPCAPI {
  private classes: Record<string, Record<string, Method>>
  public signature: Record<string, any> = {}
  public doc: Record<string, string> = {}

  constructor(source: string) {
    this.classes = new API(source).classes

    for (const [className, methods] of Object.entries(this.classes)) {
      if (className.startsWith('NS')) {
        const namespace = className.substr(2).toLowerCase()
        for (const [methodName, method] of Object.entries(methods)) {
          this.signature[`${namespace}.${methodName}`] = {
            parameters: method.parameters.map(p => p.name),
            schema: method.schema,
          }
        }
      }
    }
  }
}

const jsonrpc = new JSONRPCAPI('content/json-rpc.ts')
fs.writeFileSync('gen/api/json-rpc.json', JSON.stringify(jsonrpc.signature, null, 2))
