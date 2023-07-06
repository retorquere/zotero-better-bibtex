#!/usr/bin/env npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob-promise'
import * as peggy from 'peggy'
import * as matter from 'gray-matter'
import * as _ from 'lodash'
import { ASTWalker as BaseASTWalker } from './pug-ast-walker'

import { Eta } from 'eta'
const eta = new Eta

function error(...args) {
  console.log(...args)
  process.exit(1)
}

const translators = glob.sync('translators/*.json')
  .map(file => {
    const tr = require(`../${file}`)
    tr.keepUpdated = typeof tr.displayOptions?.keepUpdated === 'boolean'
    tr.cached = tr.label.startsWith('Better ') && !tr.label.includes('Quick')
    tr.affectedBy = []
    return tr
  })

const src = process.argv[2] || 'content/Preferences.pug'
const tgt = process.argv[3] || 'build/content/Preferences.xul'

const l10n = new class {
  private strings = peggy.generate(fs.readFileSync('content/dtd-file.peggy', 'utf-8')).parse(fs.readFileSync('locale/en-US/zotero-better-bibtex.dtd', 'utf-8')) as Record<string, string>

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
    switch (node.name) {
      case 'vbox':
      case 'hbox':
      case 'grid':
      case 'columns':
      case 'column':
      case 'rows':
      case 'row':
      case 'radiogroup':
      case 'groupbox':
      case 'textbox':
      case 'tabbox':
      case 'tabpanels':
      case 'tabpanel':
      case 'deck':
      case 'prefpane':
        if (!flex) node.attrs.push({ name: 'flex', val: "'1'", mustEscape: false })
        break
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
      case 'html:input':
      case 'html:select':
      case 'html:option':
      case 'html:linkset':
      case 'html:link':
        if (flex) throw new Error(`${node.name} has flex ${flex}`)
        break
      default:
        throw `no flex on ${node.name}` // eslint-disable-line no-throw-literal
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

    const pref: Preference = {
      name,
      shortName: name.replace(/^([^.]+[.])*/, ''),
      label: '',
      description: '',
      // @ts-ignore
      type: { int: 'number', string: 'string', bool: 'boolean' }[this.attr(node, 'type', true)] || error('unsupported type', this.attr(node, 'type')),
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
    this.doc(doc, pref, 'description')
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
          pref = id.replace('tooltip-', 'extensions.zotero.translators.better-bibtex.')
          if (!this.preferences[pref]) error(pref, 'does not exist')
          this.description(this.text(node), pref)
        }
        break

      case 'bbt:doc':
        this.description(this.text(node))
        break

      case 'html:option':
        if (!hidden) {
          pref = this.attr(history.find(n => n.name === 'html:select'), 'preference')
          if (pref) this.option(pref, this.text(node), this.attr(node, 'value', true))
        }
        break

      case 'menuitem':
        error('menulists are deprecated')
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

To view the the full list of Better BibTeX's preferences, including many hidden preferences, go to the Advanced pane of the Zotero preferences and click “Config Editor”. Enter “better-bibtex” into the Filter field at the top of the list that comes up. Preferences that can be safely changed by users are described below.

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
      fs.writeFileSync(page.path, page.matter.stringify())
    }
  }

  saveDefaults(defaults) {
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

    fs.writeFileSync('gen/preferences.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/preferences.ts.eta', 'utf-8'), { preferences }))
    fs.writeFileSync('gen/preferences/meta.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/meta.ts.eta', 'utf-8'), { preferences, translators }))
  }
}

class XHTML extends ASTWalker {
  children(node) {
    if (node.block.nodes.find(node => node.type !== 'Tag')) error('unexpected', node.block.nodes.find(node => node.type !== 'Tag').type)
    return node.block.nodes.map(node => node.name).join(',')
  }

  Tag(node, history) {
    switch (node.name) {
      case 'menulist':
        node.name = 'html:select'
        if (this.children(node) !== 'menupopup') error('unexpected menulist content', this.children(node))
        node.block = node.block.nodes[0].block
        break
      case 'menupopup':
        error('should not find menupopups')
        break
      case 'menuitem':
        node.name = 'html:option'
        node.block.nodes = [{
          type: 'Text',
          val: eval(node.attrs.find(attr => attr.name === 'label').val),
        }]
        node.attrs = node.attrs.filter(attr => attr.name !== 'label')
        break
    }

    this.walk(node.block, history)
    return node
  }

  Text(node) {
    if (node.val.startsWith('<?xml')) node.val = ''
    if (node.val.startsWith('<!DOCTYPE')) node.val = ''
    return node
  }
}

const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })

function walk(cls, ast) {
  (new cls).walk(ast)
}

let options = {
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      const walker = new Docs
      walker.walk(ast, [])
      walker.savePages('site/content/installation/preferences')
      walker.saveDefaults('build/defaults/preferences/defaults.js')
      walker.saveDefaults('build/prefs.js')
      walker.saveTypescript()

      walk(StripConfig, ast)
      walk(Flex, ast)

      return ast
    },
  }],
}
let xul = pug.renderFile(src, options)
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())

options = {
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      walk(StripConfig, ast)
      walk(Flex, ast)
      walk(XHTML, ast)

      return ast
    },
  }],
}
xul = pug.renderFile(src, options)
fs.writeFileSync(tgt.replace(/[^/]+[.]xul$/, 'preferences.xhtml'), xul.replace(/&amp;/g, '&').trim())

for (const xul of glob.sync('content/*.xul')) {
  const source = fs.readFileSync(xul, 'utf-8')
  l10n.tr(source)
}
