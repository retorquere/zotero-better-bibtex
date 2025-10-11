#!/usr/bin/env node

/* eslint-disable @typescript-eslint/no-unsafe-return, no-console, @typescript-eslint/no-shadow, no-eval, @typescript-eslint/no-empty-function, id-blacklist */

console.log('pre-processing preferences')

import * as pug from 'pug'
import * as fs from 'fs'
import * as path from 'path'
import * as glob from 'glob'
import frontmatter from 'gray-matter'
import _ from 'lodash'
// import { walk, Lint, SelfClosing, ASTWalker as BaseASTWalker } from './pug-ast-walker.js'
import { walk, Lint, ASTWalker as BaseASTWalker } from './pug-ast-walker.js'
import { FluentBundle, FluentResource } from '@fluent/bundle'
import * as yaml from 'js-yaml'

import { Eta } from 'eta'
const eta = new Eta

function error(...args) {
  console.log(...args)
  console.log((new Error).stack)
  process.exit(1)
}

function ensureDir(file) {
  const parent = path.dirname(file)
  if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true })
}

const translators = glob.globSync('translators/*.json')
  .map(file => {
    const tr = JSON.parse(fs.readFileSync(file, 'utf-8'))
    tr.keepUpdated = typeof tr.displayOptions?.keepUpdated === 'boolean'
    tr.cached = tr.label.startsWith('Better ') && !tr.label.includes('Quick')
    tr.affectedBy = []
    return tr
  })

const l10n = new class {
  params = {
    entries: '{entries}',
    error: '{error}',
    limit: '{limit}',
    n: '{n}',
    path: '{path}',
    preference: '{preference}',
    running: '{running}',
    seconds: '{seconds}',
    total: '{total}',
    translator: '{translator}',
    treshold: '{treshold}',
    type: '{type}',
    version: '{version}',
  }

  constructor() {
    const resource = new FluentResource(fs.readFileSync('locale/en-US/better-bibtex.ftl', 'utf-8'))
    this.bundle = new FluentBundle("en-US")
    const errors = this.bundle.addResource(resource)
    if (errors.length) console.log(errors)
  }

  find(id, softfail=false) {
    if (!id) return ''
    if (id.startsWith('zotero.general.')) return `&${ id };`
    if (id.startsWith('zotero.errorReport.')) return `&${ id };`
    if (id.includes('.')) error(id, 'may not have periods')

    const msg = this.bundle.getMessage(id)
    if (msg?.value) return this.bundle.formatPattern(msg.value, this.params).replace(/[\u2068\u2069]/g, '')

    if (msg?.attributes) {
      const label = msg.attributes.label
      if (label) return this.bundle.formatPattern(label, this.params).replace(/[\u2068\u2069]/g, '')
    }

    if (!softfail) error(id, 'not in localization')
    return ''
  }

  tr(txt) {
    return this.find(txt, true) || txt
  }
}

class ASTWalker extends BaseASTWalker {
  text(node) {
    switch (node.type) {
      case 'Text': return l10n.tr(node.val)
      case 'Tag': return this.l10n(node) || this.attr(node, 'label') || this.text(node.block)
      case 'Block': return node.nodes.map(n => this.text(n)).join('')
      default: return ''
    }
  }

  l10n(node) {
    return l10n.find(super.attr(node, 'data-l10n-id'))
  }

  attr(node, name, required = false) {
    const val = super.attr(node, name, required)
    switch (typeof val) {
      case 'object':
        return null
      case 'string':
      case 'number':
      case 'boolean':
        return val
      default:
        error('unexpected type', typeof val)
    }
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

/*
type Preference = {
  name: string
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
*/

const prefprefix = 'extensions.zotero.translators.better-bibtex.'

class Docs extends ASTWalker {
  preferences = {}
  preference = null
  pages = {}
  page = null

  constructor() {
    super()
    for (const [name, pref] of Object.entries(yaml.load(fs.readFileSync('content/Preferences/preferences.yaml', 'utf-8')))) {
      pref.description = pref.description || ''
      this.preferences[`${prefprefix}${name}`] = { name, affects: [], type: typeof pref.default, ...pref }
    }
  }

  option(pref, label, value) {
    if (!this.preferences[pref]) error('option for unregistered', pref)

    switch (this.preferences[pref].type) {
      case 'number': {
        const v = parseInt(value)
        if (isNaN(v)) error('non-integer option', value, 'for', this.preferences[pref].type, pref)
        value = v
        break
      }

      case 'string':
        break

      default:
        error('option for', this.preferences[pref].type, pref)
    }

    this.preferences[pref].options = this.preferences[pref].options || new Map
    this.preferences[pref].options.set(value, label)
  }

  label(doc, pref) {
    this.doc(doc, pref, 'label')
  }

  description(doc, pref) {
    this.doc(doc.replace(/</g, '&lt;').replace(/>/g, '&gt;'), pref, 'description')
  }

  doc(doc, pref, kind) {
    pref = pref || this.preference
    if (!pref) error('doc for no pref')
    if (!this.preferences[pref]) error(`doc ${JSON.stringify(doc)} for unregistered`, pref)
    if (this.preferences[pref][kind]) error('re-doc for', pref, '\n**old**:', this.preferences[pref][kind], '\n**new**:', doc)
    this.preferences[pref][kind] = doc
  }

  groupboxlabel(node) {
    for (const label of node.block.nodes) {
      if (label.name === 'label') {
        for (const h2 of label.block.nodes) {
          if (h2.name === 'html:h2') return this.text(h2)
        }
      }
    }
    return ''
  }

  section(label, history, offset = 0) {
    const level = history.filter(n => n.$section).length + 1 + offset
    if (label.includes('<%') && this.pages[this.page].content.includes(label)) error('duplicate', label)
    this.pages[this.page].content += `${ '#'.repeat(level) } ${ label }\n\n`
  }

  Tag(node, history) {
    let bbt, pref, id, label, page

    const hidden = history.find(parent => parent.name && this.attr(parent, 'hidden'))

    switch (node.name) {
      case 'groupbox':
        page = this.attr(node, 'bbt:page')
        label = this.groupboxlabel(node)

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

      case 'tooltip': {
        if (id = this.attr(node, 'id', true)) {
          const pref = id.replace('bbt-tooltip-', prefprefix)
          if (!this.preferences[pref]) error('tooltip:', pref, 'does not exist')
          this.description(this.text(node), pref)
        }
        break
      }

      case 'bbt:doc':
        this.description(this.text(node))
        break

      case 'menuitem': break
      case 'menulist':
        pref = this.attr(node, 'preference')
        if (pref && !hidden) {
          const menupopup = node.block.nodes.find(mp => mp.name === 'menupopup')
          for (const menuitem of menupopup.block.nodes) {
            this.option(pref, this.attr(menuitem, 'label') || l10n.find(this.attr(menuitem, 'data-l10n-id', true)), this.attr(menuitem, 'value', true))
          }
        }
        break

      case 'radio': break
      case 'radiogroup':
        pref = this.attr(node, 'preference')
        if (pref && !hidden) {
          for (const radio of node.block.nodes) {
            this.option(pref, this.attr(radio, 'label') || l10n.find(this.attr(radio, 'data-l10n-id', true)), this.attr(radio, 'value', true))
          }
        }
        break

      default:
        pref = (bbt = this.attr(node, 'bbt:preference')) || this.attr(node, 'preference')
        if (pref) {
          if (!this.preferences[pref]) error(pref, 'does not exist')
          pref = this.preferences[pref]

          label = l10n.tr(this.attr(node, 'data-l10n-id')) || (node.name === 'label' && this.text(node))
          if (!hidden && label && (bbt || !pref.label)) {
            if (!pref.label && pref.description) this.section(`<%~ it.${ pref.name } %>\n`, history, 1)
            this.label(label, `${prefprefix}${pref.name}`)
          }
        }
        break
    }

    const field = this.attr(node, 'data-ae-field')
    if (field) {
      pref = Object.values(this.preferences).find(p => p.name === field)
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
          dflt = pref.options ? pref.options.get(pref.default) : (pref.default || '<not set>')
          break
        case 'boolean':
          dflt = pref.default ? 'yes' : 'no'
          break
      }
      if (typeof dflt === 'undefined') error('unsupported pref default', pref.type)
      prefs[pref.name] = `${ pref.label || pref.name }\n\ndefault: \`${ dflt }\`\n\n${ pref.description }\n`
      if (pref.options) prefs[pref.name] += `\nOptions:\n\n${ [...pref.options.values()].map(o => `* ${ o }`).join('\n') }\n`
    }

    const hidden = `
You can edit most Better BibTeX preferences through the Preferences window in Zotero. However, Better BibTeX supports additional hidden preferences. These settings are intended for more advanced use.

## Zotero

To view the full list of Better BibTeX's preferences, including many hidden preferences, go to the Advanced pane of the Zotero preferences and click “Config Editor”. Enter “better-bibtex” into the Filter field at the top of the list that comes up. Preferences that can be safely changed by users are described below.

The Better BibTeX hidden preferences are preceded by “extensions.zotero.translators.better-bibtex.”

`
    this.pages['hidden-preferences'] = {
      content: hidden + Object.values(this.preferences).filter(p => !p.label && p.description).map(p => `## <%~ it.${ p.name } %>`).sort().join('\n'),
    }

    for (const page of glob.sync(path.join(dir, '*.md'))) {
      const slug = path.basename(page, '.md')
      if (!this.pages[slug]) error('no page data for', path.basename(page))
      this.pages[slug].path = page
      this.pages[slug].matter = frontmatter(page)
      if (this.pages[slug].title) this.pages[slug].matter.data.title = this.pages[slug].title
    }

    for (const [ slug, page ] of Object.entries(this.pages)) {
      if (!page.path) error('no template for', slug)
      page.matter.content = eta.renderString(`\n\n{{% preferences/header %}}\n\n${ page.content }`, prefs)
      ensureDir(page.path)
      fs.writeFileSync(page.path, page.matter.stringify())
    }
  }

  saveDefaults(defaults) {
    ensureDir(defaults)
    fs.writeFileSync(defaults, Object.values(this.preferences).map(p => `pref(${ JSON.stringify(p.name) }, ${ JSON.stringify(p.default) })\n`).join(''))
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

    const displayOptions = JSON.parse(fs.readFileSync('setup/templates/auto-export-displayOptions.json', 'utf-8'))
    ensureDir('gen/preferences/meta.ts')
    fs.writeFileSync('gen/preferences.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/preferences.ts.eta', 'utf-8'), { preferences }))
    fs.writeFileSync('gen/preferences/meta.ts', eta.renderString(fs.readFileSync('setup/templates/preferences/meta.ts.eta', 'utf-8'), {
      displayOptions,
      preferences,
      translators,
    }))
    fs.writeFileSync('gen/auto-export-schema.json', this.schema({ displayOptions, preferences, translators }))
  }

  schema({ displayOptions, preferences, translators }) {
    const schema = {}
    for (const tr of translators) {
      if (!tr.displayOptions || typeof tr.displayOptions.keepUpdated !== 'boolean') continue

      schema[tr.label] = {
        path: { type: 'string', minLength: 1 },
        translatorID: { const: tr.translatorID },
        type: { type: 'string', enum: [ 'library', 'collection' ]},
        id: { type: 'number' },
        recursive: { type: 'boolean' },
        enabled: { type: 'boolean' },
        status: { enum: [ 'scheduled', 'running', 'done', 'error' ]},
        error: { type: 'string' },
        updated: { type: 'number' },
      }

      for (const option of displayOptions) {
        if (tr.displayOptions && typeof tr.displayOptions[option] === 'boolean') schema[tr.label][option] = { type: 'boolean' }
      }
    }

    for (const pref of preferences) {
      if (!pref.label || !pref.override || !pref.affects.length) continue

      for (const label of pref.affects) {
        switch (pref.type) {
          case 'boolean':
            schema[label][pref.name] = { type: 'boolean' }
            break
          case 'string':
            schema[label][pref.name] = { type: 'string' }
            if (pref.options) schema[label][pref.name].enum = [...pref.options.keys()]
            break
          case 'number':
            schema[label][pref.name] = { type: 'number' }
            break
          default:
            throw new Error(`Don't know what to do with ${ pref.type }`)
        }
      }
    }
    return JSON.stringify(schema, null, 2)
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
    const [ , pre, id, post ] = m
    if (pre || post) throw new Error(`unexpected data around translation id in ${ val }`)
    return id
  }

  Tag(node, history) {
    const cls = this.attr(node, 'class')
    if (cls && cls.split(' ').includes('bbt-prefs-2col-span')) {
      const pcls = this.attr(history.slice(1).find(n => n.type === 'Tag'), 'class')
      if (!pcls?.includes('bbt-prefs-2col')) throw new Error('2-col span not in a 2-col parent')
    }
    if (node.name === 'script') throw new Error('scripts don\'t work in preference panes')

    let l10n_id = ''
    for (const attr of node.attrs) {
      const id = this.l10n(this.attr(node, attr.name))
      if (id) {
        if (!id.match(/^[^.]+[.][^.]+$/)) throw new Error(`no '.' in l10n attribute ${ attr.name }`)
        const [ base, a ] = id.split('.')
        l10n_id = l10n_id || base
        if (base !== l10n_id) throw new Error(`unexpected l10n base in ${ id }, expected ${ l10n_id }`)
        if (a !== attr.name) throw new Error(`unexpected l10n attribute in ${ id }, expected ${ attr.name }`)
        attr.val = '""'
      }
    }
    if (l10n_id) node.attrs = [ ...node.attrs, { name: 'data-l10n-id', val: JSON.stringify(l10n_id), mustEscape: false } ]

    node.block = this.walk(node.block, history)

    const duplicate = {}
    for (const attr of node.attrs) {
      if (attr.name === 'class') continue
      if (attr.name in duplicate) {
        throw new Error(`${ node.name }.${ attr.name }= ${duplicate[attr.name]} => ${ attr.val }`)
      }
      else {
        duplicate[attr.name] = attr.val
      }
    }

    return node
  }

  Block(block, history) {
    block.nodes = block.nodes
      .map(node => this.walk(node, history))
      .filter(node => node)
    return block
  }

  Text(node, history) {
    const id = this.l10n(node.val)
    if (!id) return node

    if (!id.match(/^[^.]+$/)) throw new Error(`not a valid l10n id ${ id }`)
    const parent = history.find(n => n.type === 'Tag')
    const existing = parent.attrs?.find(a => a.name === 'data-l10n-id')
    if (existing) {
      if (existing.val !== JSON.stringify(id)) throw new Error(`expected ${ existing.val }, found ${ JSON.stringify(id) }`)
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

render('content/Preferences/preferences.pug', 'build/content/preferences.xhtml', {
  is7: true,
  pretty: true,
  plugins: [{
    preCodeGen(ast, _options) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
      const docs = walk(Docs, ast, true)

      docs.savePages('site/content/installation/preferences')
      docs.saveDefaults('build/defaults/preferences/defaults.js')
      docs.saveDefaults('build/prefs.js')
      docs.saveTypescript()
      walk(StripConfig, ast)
      walk(XHTML, ast)
      // walk(SelfClosing, ast)
      walk(Lint, ast)

      /*
      let onload = ast.nodes[0].attrs.filter(attr => attr.name === 'onload')
      const ns = ast.nodes[0].attrs.filter(attr => attr.name !== 'onload')

      for (const node of ast.nodes) {
        if (node.type === 'Comment') continue
        const nodes = node.type === 'Block' ? node.nodes : [ node ]

        for (const n of nodes) {
          if (n.type === 'Comment') continue
          n.attrs = [...n.attrs, ...onload, ...ns]
          onload = []
        }
      }
      */

      return ast
    },
  }],
})

for (const xul of glob.sync('content/*.xul')) {
  const source = fs.readFileSync(xul, 'utf-8')
  l10n.tr(source)
}
