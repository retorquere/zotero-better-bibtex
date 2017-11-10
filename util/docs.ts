import fs = require('fs')
import parseXML = require('@rgrove/parse-xml')
import dedent = require('dedent-js')
import path = require('path')

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
      default?: any
    }
  }
  private header: string
  private errors: number
  private defaults: { [key: string]: any }

  constructor() {
    this.strings = {}
    const dtd = fs.readFileSync('locale/en-US/zotero-better-bibtex.dtd', 'utf8')
    dtd.replace(/<!ENTITY\s+([^\s]+)\s+"([^"]+)"\s*/g, (decl, entity, str) => { this.strings[entity] = str; return '' })

    this.preferences = {}
    this.tabs = []
    this.tab = -1
    this.errors = 0
    this.defaults = {
      debug: false,
      rawLaTag: '#LaTeX',
      testing: false,
    }

    const prefsPane = parseXML(fs.readFileSync('content/Preferences.xul', 'utf8'), {
      resolveUndefinedEntity: entity => this.strings[entity] || entity,
      preserveComments: true,
    })

    this.walk(prefsPane)

    for (const [id, pref] of Object.entries(this.preferences)) {
      this.defaults[pref.preference.replace(/.*\./, '')] = pref.default
      if (pref.tab && !pref.label) this.report(`${pref.preference} has no label`)
      if (!pref.description) this.report(`${pref.preference} has no description`)
    }

    if (this.errors) process.exit(1)

    fs.writeFileSync(path.join(__dirname, '../gen/defaults.json'), JSON.stringify(this.defaults, null, 2))
  }

  private walk(node) {
    let label, pref, type, dflt;

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
            this.preference = node.attributes.id || `#${node.attributes.name}`;
            type = ({bool: 'boolean', int: 'number'}[node.attributes.type]) || node.attributes.type;
            if (typeof node.attributes.default === 'undefined') throw new Error(`No default value for ${this.preference}`)
            switch (type) {
              case 'boolean':
                switch (node.attributes.default) {
                  case 'true':
                    dflt = true;
                    break
                  case 'false':
                    dflt = false;
                    break
                  default:
                    throw new Error(`Unexpected boolean value ${node.attributes.default} for ${this.preference}`)
                }
                break;

              case 'number':
                dflt = parseInt(node.attributes.default);
                if (isNaN(dflt)) throw new Error(`Unexpected int value ${node.attributes.default} for ${this.preference}`)
                break;

              case 'string':
                dflt = node.attributes.default;
                break;

              default:
                throw new Error(`Unexpected ${type} value ${node.attributes.default} for ${this.preference}`)
            }

            this.preferences[this.preference] = {
              id: node.attributes.id,
              type: type,
              preference: node.attributes.name,
              default: dflt
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
