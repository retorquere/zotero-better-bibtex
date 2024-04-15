#!/usr/bin/env -S npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob-promise'
import * as peggy from 'peggy'
import * as matter from 'gray-matter'
import * as _ from 'lodash'
import { walk, Lint, SelfClosing, ASTWalker as BaseASTWalker } from './pug-ast-walker'

import { Eta } from 'eta'
const eta = new Eta

function error(...args) {
  console.log(...args)
  process.exit(1)
}


function ensureDir(file) {
  const parent = path.dirname(file)
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true })
}

const translators = glob.sync('translators/*.json')
  .map(file => {
    const tr = require(`../${file}`)
    tr.keepUpdated = typeof tr.displayOptions?.keepUpdated === 'boolean'
    tr.cached = tr.label.startsWith('Better ') && !tr.label.includes('Quick')
    tr.affectedBy = []
    return tr
  })


const l10n = new class {
  private strings = peggy
    .generate(fs.readFileSync('content/dtd-file.peggy', 'utf-8'))
    .parse(fs.readFileSync('build/locale/en-US/zotero-better-bibtex.dtd', 'utf-8')) as Record<string, string>

  private find(id: string): string {
    if (id.startsWith('zotero.general.')) return `&${id};`
    if (id.startsWith('zotero.errorReport.')) return `&${id};`
    if (this.strings[id]) return this.strings[id]
    error(id, 'not in dtd')
    return ''
  }
  tr(txt: string): string {
    if (!txt) return txt
    return txt.replace(/&([^;]+);/g, (entity, id) => this.find(id))
  }
}

class ASTWalker extends BaseASTWalker {
  text(node) {
    switch (node.type) {
      case 'Text': return l10n.tr(node.val)
      case 'Tag': return this.attr(node, 'label') || this.text(node.block)
      case 'Block': return node.nodes.map(n => this.text(n)).join('')
      default: return ''
    }
  }

  attr(node, name: string, required=false): string {
    const val = super.attr(node, name, required)
    switch (typeof val) {
      case 'object':
        return null
      case 'string':
        return l10n.tr(val)
      case 'number':
        return val
      default:
        error('unexpected type', typeof val)
    }
  }
}

/*
class Swap extends ASTWalker {
  Tag(node) {
    // make html the default namespace
    if (node.name.startsWith('html:')) {
      node.name = node.name.replace('html:', '')
    }
    else {
      node.name = `xul:${node.name}`
    }

    this.walk(node.block)
  }
}
*/

class Flex extends ASTWalker {
  flex(node): string {
    const flex = node.attrs.find(attr => attr.name === 'flex')
    if (!flex) return ''
    if (typeof flex.val === 'number') return `${flex.val}`
    return flex.mustEscape ? flex.val : eval(flex.val)
  }

  Tag(node) {
    const flex = this.flex(node)
    if (!node.name.startsWith('html:')) {
      switch (node.name) {
        case 'vbox':
        case 'hbox':
        case 'radiogroup':
        case 'textbox':
        case 'tabbox':
        case 'tabpanels':
        case 'tabpanel':
        case 'deck':
          if (!flex) node.attrs.push({ name: 'flex', val: "'1'", mustEscape: false })
          break
        case 'prefpane':
        case 'groupbox':
        case 'prefwindow':
        case 'tabs':
        case 'tab':
        case 'caption':
        case 'preferences':
        case 'preference':
        case 'popupset':
        case 'tooltip':
        case 'description':
        case 'label':
        case 'checkbox':
        case 'radio':
        case 'button':
        case 'image':
        case 'separator':
        case 'script':
        case 'menupopup':
        case 'menuitem':
        case 'menulist':
          if (flex) throw new Error(`${node.name} has flex ${flex}`)
          break
        default:
          throw `no flex on ${node.name}` // eslint-disable-line no-throw-literal
      }
    }
    node.block = this.walk(node.block)
    return node
  }
}

class StripConfig extends ASTWalker {
  Tag(node) {
    node.attrs = node.attrs.filter(attr => !attr.name.startsWith('bbt:'))
    node.block = this.walk(node.block)
    return node
  }

  Block(node) {
    node.nodes = node.nodes.filter(n => !n.name || !n.name.startsWith('bbt:')).map(n => this.walk(n)).filter(n => n)
    return node
  }
}

type Preference = {
  name: string
  shortName: string
  label: string
  description: string
  type: 'number' | 'boolean' | 'string'
  default: number | boolean | string
  options?: Map<string | number, string>
  affects: string[]
}
type Page = {
  title?: string
  content: string
  path?: string
  matter?: any
}

class Docs extends ASTWalker {
  public preferences: Record<string, Preference> = {}
  public preference: string = null
  public pages: Record<string, Page> = {}
  public page: string = null

  register(node) {
    const name = this.attr(node, 'name', true)
    const id = this.attr(node, 'id')
    if (id) error('obsolete preference id', id)

    const affects = this.attr(node, 'bbt:affects', true)
      .split(/\s+/)
      .reduce((acc, affects) => {
        switch(affects) {
          case '':
            break

          case '*':
            acc.push(...translators.filter(tr => tr.cached).map(tr => tr.label))
            break

          case 'tex':
          case 'bibtex':
          case 'biblatex':
          case 'csl':
            acc.push(...translators.filter(tr => tr.cached).map(tr => tr.label).filter(tr => tr.toLowerCase().includes(affects)))
            break

          default:
            error('Unexpected affects', affects, 'in', pref.affects, name)
        }
        return acc
      }, [])
      .sort()

    let type: 'string' | 'number' | 'boolean' = 'string'
    switch (this.attr(node, 'type', true)) {
      case 'int':
        type = 'number'
        break
      case 'string':
        type = 'string'
        break
      case 'bool':
        type = 'boolean'
        break
      default:
        error('unsupported type', this.attr(node, 'type'))
    }
    const pref: Preference = {
      name,
      shortName: name.replace(/^([^.]+[.])*/, ''),
      label: '',
      description: '',
      type,
      default: this.attr(node, 'default', true),
      affects,
    }

    switch (pref.type) {
      case 'boolean':
      case 'number':
        pref.default = eval(pref.default as string)
      case 'string':
        if (typeof pref.default !== pref.type) error(this.attr(node, 'default'), 'is not', pref.type)
        break
      default:
        error('Unexpected type', pref.type)
    }

    for (const affected of pref.affects) {
      for (const tr of translators) {
        if (tr.cached && tr.label === affected) {
          tr.affectedBy.push(pref.shortName)
        }
      }
    }

    this.preferences[this.preference = name] = pref
  }

  option(pref, label, value) {
    if (!this.preferences[pref]) error('option for unregistered', pref)

    let v: number
    switch (this.preferences[pref].type) {
      case 'number':
        v = parseInt(value)
        if (isNaN(v)) error('non-integer option', value, 'for', this.preferences[pref].type, pref)
        value = v
        break

      case 'string':
        break

      default:
        error('option for', this.preferences[pref].type, pref)
    }
    this.preferences[pref].options = this.preferences[pref].options || new Map
    this.preferences[pref].options.set(value, label)
  }

  label(doc, pref?) {
    this.doc(doc, pref, 'label')
  }
  description(doc, pref?) {
    this.doc(doc.replace(/</g, '&lt;').replace(/>/g, '&gt;'), pref, 'description')
  }
  doc(doc, pref, kind) {
    pref = pref || this.preference
    if (!pref) error('doc for no pref')
    if (!this.preferences[pref]) error('doc for unregistered', pref)
    if (this.preferences[pref][kind]) error('re-doc for', pref, '\n**old**:', this.preferences[pref][kind], '\n**new**:', doc)
    this.preferences[pref][kind] = doc
  }

  section(label, history: any[], offset=0) {
    const level = history.filter(n => n.$section).length + 1 + offset
    if (label.includes('<%') && this.pages[this.page].content.includes(label)) error('duplicate', label)
    this.pages[this.page].content += `${'#'.repeat(level)} ${label}\n\n`
  }

  Tag(node, history) {
    let bbt, pref, id, label, page

    const hidden = history.find(parent => parent.name && this.attr(parent, 'hidden'))

    switch (node.name) {
      case 'caption':
        if (!hidden) {
          pref = this.attr(node, 'bbt:preference')
          label = this.attr(node, 'label') || this.text(node)
          if (pref) {
            this.label(label, pref)
            this.section(`<%~ it.${this.preferences[pref].shortName} %>\n`, history, 1)
          }
          else {
            history.find(n => n.name === 'groupbox').$section = label
            this.section(label, history)
          }
        }
        break

      case 'tabbox':
        node.$labels = []
        break

      case 'tab':
        history.find(n => n.name === 'tabbox').$labels.push(this.text(node))
        break

      case 'tabpanel':
        label = history.find(n => n.name === 'tabbox').$labels.shift()
        page = this.attr(node, 'bbt:page')
        if (page) {
          this.page = page
          this.pages[page] = {
            title: label,
            content: '',
          }
        }
        else if (!hidden) {
          node.$section = label
          this.section(label, history)
        }
        break

      case 'script':
        return node

      case 'preference':
        this.register(node)
        // clone name to id
        pref = node.attrs.find(attr => attr.name === 'name')
        node.attrs.push({...pref, name: 'id'})
        break

      case 'tooltip':
        if (id = this.attr(node, 'id', true)) {
          pref = id.replace('bbt-tooltip-', 'extensions.zotero.translators.better-bibtex.')
          if (!this.preferences[pref]) error(pref, 'does not exist')
          this.description(this.text(node), pref)
        }
        break

      case 'bbt:doc':
        this.description(this.text(node))
        break

      case 'menuitem':
        if (!hidden) {
          pref = this.attr(history.find(n => n.name === 'menulist'), 'preference')
          if (pref) this.option(pref, this.attr(node, 'label', true), this.attr(node, 'value', true))
        }
        break

      case 'radio':
        if (!hidden) {
          pref = this.attr(history.find(n => n.name === 'radiogroup'), 'preference', true)
          this.option(pref, this.attr(node, 'label', true), this.attr(node, 'value', true))
        }
        break

      default:
        pref = (bbt = this.attr(node, 'bbt:preference')) || this.attr(node, 'preference')
        if (pref) {
          if (!this.preferences[pref]) error(pref, 'does not exist')
          pref = this.preferences[pref]

          label = this.attr(node, 'label') || (node.name === 'label' && this.text(node))
          if (!hidden && label && (bbt || !pref.label)) {
            if (!pref.label && pref.description) this.section(`<%~ it.${pref.shortName} %>\n`, history, 1)
            this.label(label, pref.name)
          }
        }
        break
    }

    const field = this.attr(node, 'data-ae-field')
    if (field) {
      pref = Object.values(this.preferences).find(p => p.shortName === field)
      if (pref) pref.override = true
    }

    this.walk(node.block, history)
    return node
  }

  savePages(dir) {
    const prefs = {}
    for (const pref of Object.values(this.preferences)) {
      let dflt
      switch (pref.type) {
        case 'number':
          dflt = pref.default
          break
        case 'string':
          dflt = pref.options ? pref.options.get(pref.default as string) : (pref.default || '<not set>')
          break
        case 'boolean':
          dflt = pref.default ? 'yes' : 'no'
          break
      }
      if (typeof dflt === 'undefined') error('unsupported pref default', pref.type)
      prefs[pref.shortName] = `${pref.label || pref.shortName}\n\ndefault: \`${dflt}\`\n\n${pref.description}\n`
      if (pref.options) prefs[pref.shortName] += `\nOptions:\n\n${[...pref.options.values()].map(o => `* ${o}`).join('\n')}\n`
    }

    const hidden = `
You can edit most Better BibTeX preferences through the Preferences window in Zotero. However, Better BibTeX supports additional hidden preferences. These settings are intended for more advanced use.

## Zotero

To view the full list of Better BibTeX's preferences, including many hidden preferences, go to the Advanced pane of the Zotero preferences and click “Config Editor”. Enter “better-bibtex” into the Filter field at the top of the list that comes up. Preferences that can be safely changed by users are described below.

The Better BibTeX hidden preferences are preceded by “extensions.zotero.translators.better-bibtex.”

`
    this.pages['hidden-preferences'] = {
      content: hidden + Object.values(this.preferences).filter(p => !p.label && p.description).map(p => `## <%~ it.${p.shortName} %>`).sort().join('\n'),
    }

    for (const page of glob.sync(path.join(dir, '*.md'))) {
      const slug = path.basename(page, '.md')
      if (!this.pages[slug]) error('no page data for', path.basename(page))
      this.pages[slug].path = page
      this.pages[slug].matter = matter.read(page)
      if (this.pages[slug].title) this.pages[slug].matter.data.title = this.pages[slug].title
    }

    for (const [slug, page] of Object.entries(this.pages)) {
      if (!page.path) error('no template for', slug)
      page.matter.content = eta.renderString(`\n\n{{% preferences/header %}}\n\n${page.content}`, prefs)
      ensureDir(page.path)
      fs.writeFileSync(page.path, page.matter.stringify())
    }
  }

  saveDefaults(defaults) {
    ensureDir(defaults)
    fs.writeFileSync(defaults, Object.values(this.preferences).map(p => `pref(${JSON.stringify(p.name)}, ${JSON.stringify(p.default)})\n`).join(''))
  }

  saveTypescript() {
    const preferences = _.cloneDeep(Object.values(this.preferences).sort((a, b) => a.name.localeCompare(b.name)))
    for (const pref of preferences) {
      if (pref.options) {
        const options = [...pref.options.keys()]
        pref.valid = options.map(option => JSON.stringify(option)).join(' | ')
        pref.quoted_options = JSON.stringify(options)
      }
      else {
        pref.valid = pref.type
      }
    }

    const displayOptions = require('./templates/auto-export-displayOptions.json')
    ensureDir('gen/preferences/meta.ts')
    fs.writeFileSync('gen/preferences.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/preferences.ts.eta', 'utf-8'), { preferences }))
    fs.writeFileSync('gen/preferences/meta.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/meta.ts.eta', 'utf-8'), {
      displayOptions,
      preferences,
      translators,
    }))
    fs.writeFileSync('gen/auto-export-triggers.sql', this.triggers({ displayOptions, preferences, translators }))
  }

  triggers({ displayOptions, preferences, translators}) {
    const set = options => options.map(option => typeof option === 'number' ? `${option}` : `'${option}'`).join(',')

    const check = (name, schema, isSetting = false) => {
      if (schema.type === 'boolean') schema = { enum: [0, 1] }
      let test = ''
      if (schema.enum) {
        test += `  SELECT RAISE(FAIL, "${name} must be one of ${schema.enum.join(' / ')}")\n`
        if (isSetting) {
          test += `  WHERE NEW.setting = '${name}' AND NEW.value NOT IN (${set(schema.enum)});\n`
        }
        else {
          test += `  WHERE NEW.${name} NOT IN (${set(schema.enum)});\n`
        }
      }
      else if (schema.type === 'string' && schema.minLength) {
        test += `  SELECT RAISE(FAIL, "${name} must be a string of minimum length ${schema.minLength}")\n`
        if (isSetting) {
          test += `  WHERE NEW.setting = '${name}' AND (TYPEOF(NEW.value) <> 'text' OR LENGTH(NEW.value) < ${schema.minLength});\n`
        }
        else {
          test += `  WHERE TYPEOF(NEW.${name}) <> 'text' OR LENGTH(NEW.${name}) < ${schema.minLength};\n`
        }
      }
      else if (schema.type === 'string') {
        test += `  SELECT RAISE(FAIL, "${name} must be a string")\n`
        if (isSetting) {
          test += `  WHERE NEW.setting = '${name}' AND TYPEOF(NEW.value) <> 'text';\n`
        }
        else {
          test += `  WHERE TYPEOF(NEW.${name}) <> 'text';\n`
        }
      }
      else if (schema.type === 'number') {
        test += `  SELECT RAISE(FAIL, "${name} must be a number")\n`
        if (isSetting) {
          test += `  WHERE NEW.setting = '${name}' AND TYPEOF(NEW.value) NOT IN ('integer', 'real');\n`
        }
        else {
          test += `  WHERE TYPEOF(NEW.${name}) NOT IN ('integer', 'real');\n`
        }
      }

      if (schema.affects) {
        test += `  SELECT RAISE(FAIL, "${name} is only applicable to ${schema.affects.map(tr => tr.label).join(' / ')}")\n`
        test += `  WHERE NEW.setting = '${name}' AND NOT EXISTS (SELECT * FROM betterbibtex.autoexport WHERE path = NEW.path and translatorID `
        const affects = schema.affects.map(tr => tr.translatorID)
        if (schema.affects.length === 1) {
          test += `= ${set(affects)}`
        }
        else {
          test += `IN (${set(affects)})`
        }
        test += ');\n'
      }
      return test
    }

    const triggers: string[] = []

    const fixate = name => `  SELECT RAISE(FAIL, "${name} may not be updated") WHERE NEW.${name} <> OLD.${name};`
    const fixated = [ 'path', 'translatorID', 'type', 'id']

    const autoexport = {
      path: { type: 'string', minLength: 1 },
      translatorID: { type: 'string', enum: translators.map(tr => tr.translatorID) },
      type: { type: 'string', enum: ['library', 'collection'] },
      id: { type: 'number' },
      recursive: { type: 'boolean' },
      enabled: { type: 'boolean' },
      status: { enum: [ 'scheduled', 'running', 'done', 'error' ] },
      error: { type: 'string' },
      updated: { type: 'number' },
    }
    let conditions: string = Object.entries(autoexport).map(([ setting, schema ]) => check(setting, schema)).join('\n')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex.autoexport_insert')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex_autoexport_insert')
    triggers.push([
      'CREATE TEMPORARY TRIGGER betterbibtex_autoexport_insert',
      'BEFORE INSERT ON betterbibtex.autoexport',
      'BEGIN',
      conditions,
      'END;',
    ].join('\n'))

    conditions = Object.entries(autoexport).filter(([ setting, _schema ]) => !fixated.includes(setting)).map(([ setting, schema ]) => check(setting, schema)).join('\n')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex.autoexport_update')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex_autoexport_update')
    triggers.push([
      'CREATE TEMPORARY TRIGGER betterbibtex_autoexport_update',
      'BEFORE UPDATE ON betterbibtex.autoexport',
      'BEGIN',
      ...fixated.map(setting => fixate(setting)),
      '',
      conditions,
      'END;',
    ].join('\n'))

    const settings = Object.fromEntries(
      preferences
        .filter(pref => pref.label && pref.override && pref.affects.length)
        .map(pref => {
          const affects = pref.affects ? pref.affects.map(label => translators.find(tr => tr.label === label)) : []
          switch (pref.type) {
            case 'boolean':
              return [ pref.shortName, { type: 'number', enum: [ 0, 1 ], affects } ]
            case 'string':
              return [ pref.shortName, { type: 'string', enum: pref.options ? [...pref.options.keys()] : undefined, affects } ]
            case 'number':
              return [ pref.shortName, { type: 'number', affects } ]
            default:
              throw new Error(`Don't know what to do with ${pref.type}`)
          }
        })
        .concat(
          displayOptions.map(option => [ option, { type: 'boolean', affects: translators.filter(tr => typeof tr.displayOptions?.[option] === 'boolean') } ])
        )
    )

    const unsupported = `  SELECT RAISE(FAIL, "unsupported auto-export setting")\n  WHERE NEW.setting NOT IN (${set(Object.keys(settings))});\n`
    conditions = Object.entries(settings).map(([ setting, schema ]) => check(setting, schema, true)).join('\n')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex.autoexport_setting_insert')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex_autoexport_setting_insert')
    triggers.push([
      'CREATE TEMPORARY TRIGGER betterbibtex_autoexport_setting_insert',
      'BEFORE INSERT ON betterbibtex.autoexport_setting',
      'BEGIN',
      unsupported,
      conditions,
      'END;',
    ].join('\n'))

    triggers.push('DROP TRIGGER IF EXISTS betterbibtex.autoexport_setting_update')
    triggers.push('DROP TRIGGER IF EXISTS betterbibtex_autoexport_setting_update')
    triggers.push([
      'CREATE TEMPORARY TRIGGER betterbibtex_autoexport_setting_update',
      'BEFORE UPDATE ON betterbibtex.autoexport_setting',
      'BEGIN',
      fixate('path'),
      fixate('setting'),
      unsupported,
      conditions,
      'END;',
    ].join('\n'))

    return triggers.join('\n--\n')
  }
}

class XHTML extends BaseASTWalker {
  children(node) {
    if (node.block.nodes.find(node => node.type !== 'Tag')) error('unexpected', node.block.nodes.find(node => node.type !== 'Tag').type)
    return node.block.nodes.map(node => node.name).join(',')
  }

  l10n(val) {
    if (typeof val !== 'string') return ''
    const m = val.match(/(.*)&([^;]+);(.*)/)
    if (!m) return ''
    const [, pre, id, post ] = m
    if (pre || post) throw new Error(`unexpected data around translation id in ${val}`)
    return id
  }

  tabbox(node, indent) {
    const tabs = node.block.nodes.find(n => n.name === 'tabs').block.nodes
    const tabpanels = node.block.nodes.find(n => n.name === 'tabpanels').block.nodes

    const nodes = []
    tabs.forEach((tab, i) => {
      const tabpanel = tabpanels[i]

      const label = this.attr(tab, 'label', true)
      const l10n = label.includes('&') ? { 'data-l10n-id': label.replace(/&([^;.]+).label;/, '$1') }: {}
      nodes.push(this.tag('groupbox', { class: indent ? 'bbt-prefs-group-main' : 'bbt-prefs-group-sub' }, [
        this.tag('label', {}, [
          this.tag('html:h2', l10n, label.includes('&') ? [] : [ { type: 'Text', val: label } ]),
        ]),
        ...tabpanel.block.nodes,
      ]))
    })
    return nodes
  }

  Tag(node, history) {
    const cls = this.attr(node, 'class')
    if (cls && cls.split(' ').includes('bbt-prefs-2col-span')) {
      const pcls = this.attr(history.slice(1).find(n => n.type === 'Tag'), 'class')
      if (! pcls?.includes('bbt-prefs-2col')) throw new Error('2-col span not in a 2-col parent')
    }
    if (node.name === 'script') throw new Error("scripts don't work in preference panes")

    let style: string
    switch (node.name) {
      case'image':
        style = node.attrs.filter(a => a.name === 'height' || a.name === 'width').map(a => `${a.name}:${a.val}`).join(';')
        if (style) node.attrs.push({ name: 'style', val: JSON.stringify(style), mustEscape: false })
        break

      case 'textbox':
        node.attrs = node.attrs.filter(a => a.name !== 'flex')

        if (node.attrs.find(a => a.name === 'multiline')) {
          node.name = 'html:textarea'
          node.attrs.forEach(a => {
            if (a.name === 'size') a.name = 'cols'
          })
          node.attrs = node.attrs.filter(a => a.name !== 'multiline')
          // arbitrary size
          for (const [name, val] of Object.entries({ cols: '80', rows: '5' })) {
            if (!node.attrs.find(a => a.name === name)) node.attrs.push({ name, val: JSON.stringify(val), mustEscape: false })
          }
        }
        else {
          node.name = 'html:input'
          node.attrs.push({ name: 'type', val: '"text"', mustEscape: false })
        }

        break
      case 'checkbox':
      case 'radio':
      case 'menulist':
        node.attrs.push({ name: 'native', val: '"true"', mustEscape: false })
        break
      case 'groupbox':
        node.block.nodes = node.block.nodes.map(child => {
          if (child.name === 'caption') {
            if (!node.attrs.find(a => a.name === 'class')) {
              node.attrs.push({
                name: 'class',
                val: JSON.stringify('bbt-prefs-group-main'),
                mustEscape: false,
              })
            }
            return this.tag('label', {}, [ {...child, name: 'html:h2' }])
          }
          else {
            return child
          }
        })
        break
    }

    let l10n_id = ''
    for (const attr of node.attrs) {
      const id = this.l10n(this.attr(node, attr.name))
      if (id) {
        if (!id.match(/^[^.]+[.][^.]+$/)) throw new Error(`no '.' in l10n attribute ${attr.name}`)
        const [base, a] = id.split('.')
        l10n_id = l10n_id || base
        if (base !== l10n_id) throw new Error(`unexpected l10n base in ${id}, expected ${l10n_id}`)
        if (a !== attr.name) throw new Error(`unexpected l10n attribute in ${id}, expected ${attr.name}`)
        attr.val = '""'
      }
    }
    if (l10n_id) node.attrs = [ ...node.attrs, { name: 'data-l10n-id', val: JSON.stringify(l10n_id), mustEscape: false } ]

    node.block = this.walk(node.block, history)

    const duplicate: Record<string, string> = {}
    for (const attr of node.attrs) {
      if (attr.name !== 'class' && duplicate[attr.name]) {
        throw new Error(`${node.name}.${attr.name}=${attr.val}`)
      }
      else {
        duplicate[attr.name] = attr.val
      }
    }

    return node
  }

  Block(block, history) {
    let nodes = []
    for (let node of block.nodes) {
      if (node.type === 'Tag' && node.name === 'deck' && this.attr(node, 'id') === 'bbt-prefs-deck') {
        node = node.block.nodes.find(n => n.type === 'Tag' && n.name === 'tabbox')
      }

      if (node.type === 'Tag' && node.name === 'tabbox') {
        const indent = history.filter(n => n.name === 'groupbox' && n.attrs.find(a => a.name === 'class')).length
        nodes = [...nodes, ...(this.tabbox(node, indent).map(n => this.walk(n, history))) ]
      }
      else {
        nodes.push(this.walk(node, history))
      }
    }
    block.nodes = nodes.filter(n => n)
    return block
  }

  Text(node, history) {
    const id = this.l10n(node.val)
    if (!id) return node

    if (!id.match(/^[^.]+$/)) throw new Error(`not a valid l10n id ${id}`)
    const parent = history.find(n => n.type === 'Tag')
    const existing = parent.attrs?.find(a => a.name === 'data-l10n-id')
    if (existing) {
      if (existing.val !== JSON.stringify(id)) throw new Error(`expected ${existing.val}, found ${JSON.stringify(id)}`)
    }
    else {
      parent.attrs = parent.attrs || []
      parent.attrs.push({ name: 'data-l10n-id', val: JSON.stringify(id), mustEscape: false })
    }

    return undefined
  }
}

function render(src, tgt, options) {
  const xul = pug.renderFile(src, options)
  ensureDir(tgt)
  fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
}

render('content/Preferences/xul.pug', 'build/content/preferences.xul', {
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      const docs = walk(Docs, ast)
      docs.savePages('site/content/installation/preferences')
      docs.saveDefaults('build/defaults/preferences/defaults.js')
      docs.saveDefaults('build/prefs.js')
      docs.saveTypescript()

      walk(StripConfig, ast)
      walk(Flex, ast)
      walk(SelfClosing, ast)
      walk(Lint, ast)

      return ast
    },
  }],
})

render('content/Preferences/xhtml.pug', 'build/content/preferences.xhtml', {
  is7: true,
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      walk(StripConfig, ast)
      walk(XHTML, ast)
      walk(SelfClosing, ast)
      walk(Lint, ast)

      return ast
    },
  }],
})

for (const xul of glob.sync('content/*.xul')) {
  const source = fs.readFileSync(xul, 'utf-8')
  l10n.tr(source)
}
