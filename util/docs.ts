import fs = require('fs')
import parseXML = require('@rgrove/parse-xml')
import dedent = require('dedent-js')
import path = require('path')

const defaults = JSON.parse(fs.readFileSync('defaults/preferences/defaults.json', 'utf8'))

class DocFinder {
  private strings: { [key: string]: string }
  private tab: number
  private tabs: string[]
  private preference: string
  private preferences: {
    [key: string]: {
      id: string
      type: string
      preference: string
      tab?: string
      label?: string
      description?: string
    }
  }
  private header: string
  private errors: number

  constructor() {
    this.strings = {}
    const dtd = fs.readFileSync('locale/en-US/zotero-better-bibtex.dtd', 'utf8')
    dtd.replace(/<!ENTITY\s+([^\s]+)\s+"([^"]+)"\s*/g, (decl, entity, str) => { this.strings[entity] = str; return '' })

    this.preferences = {}
    this.tabs = []
    this.tab = -1
    this.errors = 0

    const prefsPane = parseXML(fs.readFileSync('content/Preferences.xul', 'utf8'), {
      resolveUndefinedEntity: entity => this.strings[entity] || entity,
      preserveComments: true,
    })

    this.walk(prefsPane)

    const supported = {}
    const ignore = new Set(['rawLaTag', 'debug', 'testing'])
    for (const [id, dflt] of Object.entries(defaults)) {
      if (ignore.has(id)) continue
      supported[`extensions.zotero.translators.better-bibtex.${id}`] = typeof dflt
    }
    const documented = {}
    for (const [id, pref] of Object.entries(this.preferences)) {
      documented[pref.preference] = {bool: 'boolean', int: 'number'}[pref.type] || pref.type
      if (pref.tab && !pref.label) this.report(`${pref.preference} has no label`)
      if (!pref.description) this.report(`${pref.preference} has no description`)
    }

    for (const [pref, type] of Object.entries(supported)) { if (!documented[pref]) this.report(`Undocumented preference ${pref}`)}
    for (const [pref, type] of Object.entries(documented)) {
      if (supported[pref]) {
        if (supported[pref] !== type) this.report(`Preference ${pref} has unexpected type ${type}`)
      } else this.report(`Unsupported preference ${pref}`)
    }
    for (const [pref, type] of Object.entries(documented)) { if (!documented[pref]) this.report(`Undocumented preference ${pref}`)}

    if (this.errors) process.exit(1)
  }

  private walk(node) {
    let label, pref

    switch (node.type) {
      case 'document':
      case 'text':
        break

      case 'comment':
        if (node.content[0] === '!') {
          if (this.tab !== -1) throw new Error('Doc block outside the prefs section')

          const text = dedent(node.content.substring(1))
          if (this.preference) {
            if (this.preferences[this.preference].description) throw new Error(`Duplicate description for ${this.preference}`)
            this.preferences[this.preference].description = text
          } else {
            if (this.header) throw new Error(`Duplicate header block ${text}`)
            this.header = text
          }
        }
        break

      case 'element':
        switch (node.name) {
          case 'preference':
            this.preference = node.attributes.id || `#${node.attributes.name}`
            this.preferences[this.preference] = {
              id: node.attributes.id,
              type: node.attributes.type,
              preference: node.attributes.name,
            }
            break

          case 'tab':
            this.tabs.push(node.attributes.label)
            break

          case 'tabpanel':
            this.tab++
            break

          default:
            if (pref = node.attributes.preference || node.attributes.forpreference) {
              if (!this.preferences[pref]) throw new Error(`There's an UI element for non-existent preference ${pref}`)
              this.preferences[pref].tab = this.tabs[this.tab]

              if (node.attributes.label) this.preferences[pref].label = node.attributes.label
              else if (node.attributes.value) this.preferences[pref].label = node.attributes.value
              else if (label = node.children.find(child => child.type === 'text')) this.preferences[pref].label = label.text
            }
            break
        }
        break

      default:
        throw new Error(node.type + (node.type === 'element' ? `.${node.name}` : ''))
    }

    for (const child of node.children || []) { this.walk(child) }
  }

  private report(msg) {
    console.log(msg)
    this.errors += 1
  }
}

new DocFinder
