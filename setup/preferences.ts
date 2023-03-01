#!/usr/bin/env npx ts-node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-magic-numbers, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

import * as pug from 'pug'
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob-promise'
import * as peggy from 'peggy'
import * as matter from 'gray-matter'
import * as eta from 'eta'
import * as _ from 'lodash'

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

const src = process.argv[2] || 'content/Preferences/main.pug'
const tgt = process.argv[3] || 'build/content/preferences.xhtml'

const l10n = new class {
  private strings = peggy.generate(fs.readFileSync('setup/dtd-file.peggy', 'utf-8')).parse(fs.readFileSync('locale/en-US/zotero-better-bibtex.dtd', 'utf-8')) as Record<string, string>

  tr(txt: string): string {
    if (!txt) return txt
    return txt.replace(/&([^;]+);/g, (entity, id) => this.strings[id] || (error(id, 'not in dtd')) as unknown as string)
  }
}

class ASTWalker {
  walk(node, history?) {
    if (history) history = [node, ...history]

    if (this[node.type]) return this[node.type](node, history)

    error('No handler for', node.type)
  }

  attr(node, name: string, required=false): string {
    const attr = node.attrs.find(attr => attr.name === name)
    if (!attr && required) error(`could not find ${node.name}.${name} in`, node.attrs.map(a => a.name))
    return attr ? l10n.tr(eval(attr.val)) : null
  }

  text(node) {
    switch (node.type) {
      case 'Text': return l10n.tr(node.val)
      case 'Tag': return this.attr(node, 'label') || this.text(node.block)
      case 'Block': return node.nodes.map(n => this.text(n)).join('')
      default: return ''
    }
  }

  Block(node, history) {
    for (const sub of node.nodes) {
      this.walk(sub, history)
    }
  }

  Text(_node) {
  }

  Comment(_node) {
  }

  BlockComment(_node) {
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

class StripConfig extends ASTWalker {
  Tag(node) {
    node.attrs = node.attrs.filter(attr => !attr.name.startsWith('bbt:'))
    this.walk(node.block)
  }

  Block(node) {
    node.nodes = node.nodes.filter(n => !n.name || !n.name.startsWith('bbt:'))
    for (const n of node.nodes) {
      this.walk(n)
    }
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
        return

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
      page.matter.content = eta.render(`\n\n{{% preferences/header %}}\n\n${page.content}`, prefs)
      fs.writeFileSync(page.path, page.matter.stringify())
    }
  }

  savePrefs(prefs) {
    function replacer(key, value) {
      if (value instanceof Map) {
        if (!value.size) return undefined
        return Array.from(value.entries()).reduce((acc, [k, v]) => { acc[k] = v; return acc }, {})
      }
      else if (key === 'description') {
        return undefined
      }
      else if (key === 'name') {
        return this.shortName
      }
      else if (key === 'shortName') {
        return undefined
      }
      else {
        return value
      }
    }

    fs.writeFileSync(prefs, JSON.stringify(Object.values(this.preferences), replacer, 2))
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

    fs.writeFileSync('gen/preferences.ts', eta.render(fs.readFileSync('setup/templates/preferences/preferences.ts.eta', 'utf-8'), { preferences }))
    fs.writeFileSync('gen/preferences/meta.ts', eta.render(fs.readFileSync('setup/templates/preferences/meta.ts.eta', 'utf-8'), { preferences, translators }))
  }
}

const options = {
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      const walker = new Docs
      walker.walk(ast, [])
      walker.savePages('site/content/installation/preferences')
      walker.savePrefs('test/features/steps/preferences.json')
      walker.saveDefaults('build/defaults/preferences/defaults.js')
      walker.saveDefaults('build/prefs.js')
      walker.saveTypescript();

      (new StripConfig).walk(ast)

      return ast
    },
  }],
}

const xul = pug.renderFile(src, options)
const build = path.dirname(tgt)
if (!fs.existsSync(build)) fs.mkdirSync(build, { recursive: true })
fs.writeFileSync(tgt, xul.replace(/&amp;/g, '&').trim())
