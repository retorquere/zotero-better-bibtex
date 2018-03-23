// tslint:disable:no-console

import * as fs from 'fs-extra'
import * as yaml from 'js-yaml'
import parseXML = require('@rgrove/parse-xml')
import dedent = require('dedent-js')
import path = require('path')

import root from 'zotero-plugin/root'

console.log('Generating preferences documentation')

class DocFinder {
  private strings: { [key: string]: string }
  private tab: number
  private tabs: string[]
  private tablevel: number = 0
  private preference: string
  private preferences: {
    [key: string]: {
      id: string
      type: string
      preference: string
      tab?: string
      label?: string
      description?: string
      default?: any,
      options?: { [key: string]: string },
    }
  }
  private header: string
  private errors: number
  private defaults: { [key: string]: any }

  public parse() {
    this.strings = {}
    const dtd = fs.readFileSync(path.join(root, 'locale/en-US/zotero-better-bibtex.dtd'), 'utf8')
    dtd.replace(/<!ENTITY\s+([^\s]+)\s+"([^"]+)"\s*/g, (decl, entity, str) => { this.strings[`&${entity};`] = str; return '' })

    this.preferences = {}
    this.tabs = []
    this.tab = -1
    this.errors = 0
    this.defaults = {
      debug: false,
      rawLaTag: '#LaTeX',
      testing: false,
    }

    const prefsPane = parseXML(fs.readFileSync(path.join(root, 'content/Preferences.xul'), 'utf8'), {
      resolveUndefinedEntity: entity => this.strings[entity] || entity,
      preserveComments: true,
    })

    this.walk(prefsPane)

    for (const pref of Object.values(this.preferences)) {
      this.defaults[pref.preference.replace(/.*\./, '')] = pref.default

      if (pref.label) pref.label = pref.label.trim()
      if (pref.tab && !pref.label) this.report(`${pref.preference} has no label`)

      if (pref.description) pref.description = pref.description.trim()
      if (!pref.description) this.report(`${pref.preference} has no description`)
      if (!pref.tab && pref.id) this.report(`${pref.preference} should be hidden`)

      if (pref.options && pref.options[pref.default]) {
        pref.default = pref.options[pref.default]
      } else if (typeof pref.default === 'boolean') {
        pref.default = pref.default ? 'on' : 'off'
      } else {
        pref.default = JSON.stringify(pref.default)
      }
    }

    if (this.errors) process.exit(1)

    fs.writeFileSync(path.join(root, 'gen/preferences.json'), JSON.stringify(this.defaults, null, 2))

    fs.ensureDirSync(path.join(root, 'build/defaults/preferences'))
    fs.ensureDirSync(path.join(root, 'docs/_data'))
    const js = Object.keys(this.defaults)
    js.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))
    fs.writeFileSync(
      path.join(root, 'build/defaults/preferences/defaults.js'),
      js.map(key => `pref(${JSON.stringify('extensions.zotero.translators.better-bibtex.' + key)}, ${JSON.stringify(this.defaults[key])});`).join('\n') + '\n',
      'utf8'
    )
  }

  private ungfm(str) {
    return str.replace(/\r/g, '').replace(/\n+/g, newlines => newlines.length === 1 ? ' ' : newlines)
  }

  private walk(node) {
    let label, pref, type, dflt

    switch (node.type) {
      case 'document':
      case 'text':
        break

      case 'comment':
        if (node.content[0] === '!') {
          if (this.tab !== -1) throw new Error('Doc block outside the prefs section')

          const text = this.ungfm(dedent(node.content.substring(1)))
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
          case 'tabbox':
            this.tablevel += 1
            break

          case 'preference':
            this.preference = node.attributes.id || `#${node.attributes.name}`
            type = ({bool: 'boolean', int: 'number'}[node.attributes.type]) || node.attributes.type
            if (typeof node.attributes.default === 'undefined') throw new Error(`No default value for ${this.preference}`)
            switch (type) {
              case 'boolean':
                switch (node.attributes.default) {
                  case 'true':
                    dflt = true
                    break
                  case 'false':
                    dflt = false
                    break
                  default:
                    throw new Error(`Unexpected boolean value ${node.attributes.default} for ${this.preference}`)
                }
                break

              case 'number':
                dflt = parseInt(node.attributes.default)
                if (isNaN(dflt)) throw new Error(`Unexpected int value ${node.attributes.default} for ${this.preference}`)
                break

              case 'string':
                dflt = node.attributes.default
                break

              default:
                throw new Error(`Unexpected ${type} value ${node.attributes.default} for ${this.preference}`)
            }

            this.preferences[this.preference] = {
              id: node.attributes.id,
              type,
              preference: node.attributes.name,
              default: dflt,
            }

            break

          case 'tab':
            if (this.tablevel === 1) {
              this.tabs.push(node.attributes.label)
            } else {
              if (pref = node.attributes.label && node.attributes.forpreference) {
                if (!this.preferences[pref]) throw new Error(`There's an UI element for non-existent preference ${pref}`)
                this.preferences[pref].label = node.attributes.label
                this.preferences[pref].tab = this.tabs[this.tab]
              }
            }
            break

          case 'tabpanel':
            if (this.tablevel === 1) this.tab++
            break

          default:
            if (pref = node.attributes.preference || node.attributes.forpreference) {
              if (!this.preferences[pref]) throw new Error(`There's an UI element for non-existent preference ${pref}`)

              this.preferences[pref].options = {}
              if (node.name === 'radiogroup') {
                for (const option of node.children.filter(child => child.name === 'radio'))  {
                  this.preferences[pref].options[option.attributes.value] = option.attributes.label.trim()
                }
              }
              if (node.name === 'menulist') {
                const menupopup = node.children.find(child => child.name === 'menupopup')
                for (const option of menupopup.children.filter(child => child.name === 'menuitem'))  {
                  this.preferences[pref].options[option.attributes.value] = option.attributes.label.trim()
                }
              }

              if (node.attributes.label) label = node.attributes.label.trim()
              else if (node.attributes.value) label = node.attributes.value.trim()
              else if (label = node.children.find(child => child.type === 'text')) label = label.text.trim()

              if (label) {
                this.preferences[pref].label = label
                this.preferences[pref].tab = this.tabs[this.tab]
              }
            }
            break
        }
        break

      default:
        throw new Error(node.type + (node.type === 'element' ? `.${node.name}` : ''))
    }

    for (const child of node.children || []) { this.walk(child) }

    if (node.type === 'element' && node.name === 'tabbox') this.tablevel += 1
  }

  private report(msg) {
    console.log(msg) // tslint:disable-line:no-console
    this.errors += 1
  }
}

(new DocFinder).parse()
