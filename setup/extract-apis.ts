#!/usr/bin/env npx ts-node
/* eslint-disable no-underscore-dangle, prefer-template, @typescript-eslint/no-unsafe-return */

import { Method, API } from './api-extractor'
import * as fs from 'fs'
import stringify from 'fast-safe-stringify'
import _ from 'lodash'
import jsesc from 'jsesc'
import { parseScript } from 'meriyah'

import Showdown from 'showdown'
const showdown = new Showdown.Converter()

class FormatterAPI {
  private formatter: Record<string, Method>
  public signature: Record<string, any> = {}
  public doc: { function: Record<string, string>, filter: Record<string, string> } = { function: {}, filter: {} }

  constructor(source: string) {
    this.formatter = new API(source).classes.PatternFormatter
    for (const [name, method] of Object.entries(this.formatter)) {
      const kind = {$: 'function', _: 'filter'}[name[0]]
      if (!kind) continue

      const key = name.toLowerCase()

      if (this.signature[key]) throw new Error(`duplicate ${kind} ${key}`)
      this.signature[key] = _.cloneDeep({
        name,
        parameters: method.parameters.map(p => p.name),
        defaults: method.parameters.map(p => p.default),
        rest: method.parameters.find(p => p.rest)?.name,
        schema: method.schema,
      })
      if (!this.signature[key].rest) delete this.signature[key].rest
      const defaults = parseScript(jsesc(this.signature[key].defaults)).body[0]
      // always the case, but typescript demands the check to allow access to defaults.expression.elements
      if (defaults.type === 'ExpressionStatement' && defaults.expression.type === 'ArrayExpression') {
        this.signature[key].ast = {
          defaults: defaults.expression.elements,
        }
      }
      else {
        throw new Error(jsesc(this.signature[key].defaults))
      }

      const description = method.parameters.find(param => param.doc)
      let params = method.parameters.map(p => {
        let doc = '<tr>'
        doc += '<td><code>' + p.name + '</code>' + (!method.schema.required.includes(p.name) && p.default === 'undefined' ? '?' : '') + '</td>'
        doc += `<td>${this.typedoc(method.schema.properties[p.name])}</td><td>`
        if (description) doc += `${showdown.makeHtml(p.doc || '')}</td><td>`
        if (typeof p.default !== 'undefined') doc += `<code>${JSON.stringify(p.default)}</code> `
        doc += '</td></tr>'
        return doc
      }).join('\n')
      if (params) {
        params = `
          <details class="details"><summary class="summary">parameters:</summary>
          <table>
            <thead><tr><th>parameter</th><th>type</th>${description ? '<th>description</th>' : ''}<th>default</th></tr></thead>
            <tbody>
              ${params}
            </tbody>
          </table>
          </details>
        `
      }

      if (! key.match(/^[$](text|getfield|field)$/i)) this.doc[kind][`<code>${name.substr(1)}</code>`] = `${params}${showdown.makeHtml(method.doc)}`
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
    if (type.enum) return type.enum.map(t => this.typedoc({ const: t })).join(' / ')
    if (['boolean', 'string', 'number'].includes(type.type)) return `<i>${type.type}</i>`
    if (type.oneOf) return type.oneOf.map(t => this.typedoc(t)).join(' / ')
    if (type.anyOf) return type.anyOf.map(t => this.typedoc(t)).join(' / ')
    if (type.const) return `<code>${type.const}</code>`
    if (type.instanceof) return `<i>${type.instanceof}</i>`
    if (type.type === 'array' && type.prefixItems) return `[${type.prefixItems.map(t => this.typedoc(t)).join(', ')}]`
    if (type.type === 'array' && typeof type.items !== 'boolean') return `${this.typedoc(type.items)}`
    if (type.type === 'template') {
      const vars: string[] = []
      for (const [v, desc] of Object.entries(type.variables)) {
        vars.push(`<code>${v}</code> (${desc})`) // eslint-disable-line @typescript-eslint/no-base-to-string
      }
      return `a ${type.kind} sprintf template with one or more of the variables ${vars.join(' / ')}`
    }
    throw new Error(`no rule for ${JSON.stringify(type)}`)
  }
}

if (!fs.existsSync('gen/api')) fs.mkdirSync('gen/api', { recursive: true })

const formatters = new FormatterAPI('content/key-manager/formatter.ts')
fs.writeFileSync('site/data/citekeyformatters/functions.json', stringify.stable(formatters.doc.function, null, 2))
fs.writeFileSync('site/data/citekeyformatters/filters.json', stringify.stable(formatters.doc.filter, null, 2))

fs.writeFileSync('gen/api/key-formatter.ts', `/* eslint-disable quote-props, comma-dangle */
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
