#!/usr/bin/env npx ts-node
/* eslint-disable prefer-template, @typescript-eslint/no-unsafe-return */

import { Method, API } from './api-extractor'
import * as fs from 'fs'
import stringify from 'fast-safe-stringify'

class FormatterAPI {
  private formatter: Record<string, Method>
  public signature: Record<string, any> = {}
  public doc: { function: Record<string, string>, filter: Record<string, string> } = { function: {}, filter: {} }

  constructor(source: string) {
    this.formatter = new API(source).classes.PatternFormatter
    for (const [name, method] of Object.entries(this.formatter)) {
      const kind = {$: 'function', _: 'filter'}[name[0]]
      if (!kind) continue

      this.signature[name] = JSON.parse(JSON.stringify({
        parameters: method.parameters.map(p => p.name),
        schema: method.schema,
      }))

      let names = [ name.substr(1) ]
      let name_edtr = ''
      if (kind === 'function' && method.parameters.find(p => p.name === 'onlyEditors')) { // auth function
        for (const [author, editor] of [['authors', 'editors'], ['auth.auth', 'edtr.edtr'], [ 'auth', 'edtr' ]]) {
          if (names[0].startsWith(author)) {
            names.push(name_edtr = names[0].replace(author, editor))
            break
          }
        }
      }
      if (name_edtr) {
        this.signature[name_edtr] = JSON.parse(JSON.stringify(this.signature[name]))

        for (const mname of [name, name_edtr]) {
          this.signature[mname].schema.properties.onlyEditors = { const: mname === name_edtr }
        }
      }

      names = names.map(n => n.replace(/__/g, '.').replace(/_/g, '-'))
      if (kind === 'function') {
        if (method.parameters.find(p => p.name === 'n')) names = names.map(n => `${n}N`)
        if (method.parameters.find(p => p.name === 'm')) names = names.map(n => `${n}_M`)
      }
      let quoted = names.map(n => '`' + n + '`').join(' / ')

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
  }

  private typedoc(type): string {
    if (['boolean', 'string', 'number'].includes(type.type)) return type.type
    if (type.oneOf) return type.oneOf.map(t => this.typedoc(t)).join(' | ')
    if (type.const) return JSON.stringify(type.const)
    if (type.enum) return type.enum.map(t => this.typedoc({ const: t })).join(' | ')
    throw new Error(`no rule for ${JSON.stringify(type)}`)
  }
}

if (!fs.existsSync('gen/api')) fs.mkdirSync('gen/api', { recursive: true })

const formatters = new FormatterAPI('content/key-manager/formatter.ts')
fs.writeFileSync('gen/api/key-formatter.json', JSON.stringify(formatters.signature, null, 2))
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify.stable(formatters.doc.function, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify.stable(formatters.doc.filter, null, 2))

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
