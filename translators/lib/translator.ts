declare const Zotero: any
declare const __estrace: any // eslint-disable-line no-underscore-dangle

import { Shim } from '../../content/os'
import * as client from '../../content/client'
const $OS = client.is7 ? Shim : OS

import * as Prefs from '../../gen/preferences/meta'
const PrefNames: Set<string> = new Set(Object.keys(Prefs.defaults))
import { DisplayOptions } from '../../gen/translators'
import { regex as escapeRE } from '../../content/escape'
import { Collection, Attachment } from '../../gen/typings/serialized-item'
import type { Exporter as BibTeXExporter } from '../bibtex/exporter'
import type { CharMap } from 'unicode2latex'
import { log } from '../../content/logger/simple'
import type { Collected } from './collect'

export type Output = {
  body: string
  attachments: Attachment[]
}

class Override {
  private orig: Prefs.Preferences
  private exportPath: string
  private exportDir: string

  constructor(private collected: Collected) {
    this.orig = { ...this.collected.preferences }
    this.exportPath = this.collected.displayOptions.exportPath
    this.exportDir = this.collected.displayOptions.exportDir
  }

  public override(preference: string, extension: string): boolean {
    const override: string = this.orig[`${ preference }Override`]
    if (!this.exportPath || !override) {
      return false
    }

    const candidates = [
      $OS.Path.basename(this.exportPath).replace(/\.[^.]+$/, '') + extension,
      override,
    ].map(filename => <string>$OS.Path.join(this.exportDir, filename))

    for (const candidate of candidates) {
      try {
        const content: string = Zotero.BetterBibTeX.getContents(candidate)
        if (content === null) continue

        let prefs: Partial<Prefs.Preferences>
        if (preference === 'preferences') {
          prefs = JSON.parse(content).override?.preferences
          if (!prefs) continue
        }
        else {
          prefs = { [preference]: content }
        }

        for (const [ pref, value ] of Object.entries(prefs)) {
          if (!PrefNames.has(pref as unknown as Prefs.PreferenceName)) {
            log.error(`better-bibtex: unexpected preference override for ${ pref }`)
          }
          else if (typeof value !== typeof Prefs.defaults[pref]) {
            log.error(`better-bibtex: preference override for ${ pref }: expected ${ typeof Prefs.defaults[pref] }, got ${ typeof value }`)
          }
          else if (Prefs.options[pref] && !Prefs.options[pref][value]) {
            // eslint-disable-next-line @typescript-eslint/no-base-to-string
            log.error(`better-bibtex: preference override for ${ pref }: expected ${ Object.keys(Prefs.options[pref]).join(' / ') }, got ${ value }`)
          }
          else {
            this.collected.preferences[pref] = value
          }
        }

        return true
      }
      catch (err) {
        log.error(`better-bibtex: failed to load override ${ candidate }: ${ err }`)
      }
    }

    return false
  }
}

export class Translation { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public importToExtra: Record<string, 'plain' | 'force'>
  public skipFields: string[]
  public skipField: RegExp
  public verbatimFields?: (string | RegExp)[]
  public csquotes: { open: string; close: string }
  public export: { dir: string; path: string } = {
    dir: undefined,
    path: undefined,
  }

  public charmap: CharMap

  /* eslint-disable @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match */
  public BetterBibLaTeX?: boolean
  public BetterBibTeX?: boolean
  public BetterTeX: boolean
  public BetterCSLJSON?: boolean
  public BetterCSLYAML?: boolean
  public BetterCSL?: boolean
  public BetterBibTeXCitationKeyQuickCopy?: boolean
  public BetterBibTeXJSON?: boolean
  public Citationgraph?: boolean
  public Collectednotes?: boolean
  /* eslint-enable */
  // public TeX: boolean
  // public CSL: boolean

  public bibtex: BibTeXExporter

  public collections: Record<string, Collection> = {} // keep because it is being used in postscripts
  public output: Output = {
    body: '',
    attachments: [],
  }

  private cacheable = true

  public preferences: Prefs.Preferences
  public options: DisplayOptions

  public isJurisM: boolean
  public isZotero: boolean
  public unicode: boolean
  public paths: {
    caseSensitive: boolean
    sep: string
  }

  public and: {
    list: {
      re: any
      repl: string
    }
    names: {
      re: any
      repl: string
    }
  }

  public get exportDir(): string {
    this.collected.items.current.$cacheable = false
    return this.export.dir
  }

  public get exportPath(): string {
    this.collected.items.current.$cacheable = false
    return this.export.path
  }

  private typefield(field: string): string {
    field = field.trim()
    if (field.startsWith('bibtex.')) return this.BetterBibTeX ? field.replace(/^bibtex\./, '') : ''
    // no input present => import => biblatex mode
    if (field.startsWith('biblatex.')) return this.mode === 'import' || this.BetterBibLaTeX ? field.replace(/^biblatex\./, '') : ''
    return field
  }

  static Import(collected: Collected): Translation {
    return new this(collected, 'import')
  }

  static Export(collected: Collected): Translation {
    const translation = new this(collected, 'export')
    collected.items.sort(collected.preferences.exportSort)

    translation.export = {
      dir: collected.displayOptions.exportDir,
      path: collected.displayOptions.exportPath,
    }
    if (translation.export.dir?.endsWith(translation.paths.sep)) translation.export.dir = translation.export.dir.slice(0, -1)

    translation.unicode = !collected.preferences[`ascii${ collected.translator.label.replace(/Better /, '') }`] || false

    if (collected.preferences.baseAttachmentPath && (translation.export.dir === collected.preferences.baseAttachmentPath || translation.export.dir?.startsWith(collected.preferences.baseAttachmentPath + translation.paths.sep))) {
      collected.preferences.relativeFilePaths = true
    }

    // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
    // relative file paths are going to be different based on the file being exported to
    translation.cacheable = translation.cacheable && collected.preferences.cache && !(
      collected.displayOptions.exportFileData
      || collected.preferences.relativeFilePaths
      || (collected.preferences.baseAttachmentPath && translation.export.dir?.startsWith(collected.preferences.baseAttachmentPath))
    )

    if (translation.BetterTeX) {
      collected.preferences.separatorList = collected.preferences.separatorList.trim()
      collected.preferences.separatorNames = collected.preferences.separatorNames.trim()
      translation.and = {
        list: {
          re: new RegExp(escapeRE(collected.preferences.separatorList), 'g'),
          repl: ` {${ collected.preferences.separatorList }} `,
        },
        names: {
          re: new RegExp(` ${ escapeRE(collected.preferences.separatorNames) } `, 'g'),
          repl: ` {${ collected.preferences.separatorNames }} `,
        },
      }
      collected.preferences.separatorList = ` ${ collected.preferences.separatorList } `
      collected.preferences.separatorNames = ` ${ collected.preferences.separatorNames } `
    }

    if (collected.preferences.testing && typeof __estrace === 'undefined' && collected.translator.configOptions?.cached) {
      const allowedPreferences: Prefs.Preferences = (collected.translator.label === 'BetterBibTeX JSON' ? Object.keys(Prefs.defaults) : Prefs.affectedBy[collected.translator.label])
        .concat(['testing'])
        .reduce((acc: any, pref: Prefs.PreferenceName) => {
          acc[pref] = collected.preferences[pref]
          return acc as Prefs.Preferences
        }, {}) as unknown as Prefs.Preferences

      collected.preferences = new Proxy(allowedPreferences, {
        set: (object, property, _value) => {
          throw new TypeError(`Unexpected set of preference ${ String(property) }`)
        },
        get: (object, property: Prefs.PreferenceName) => {
          // JSON.stringify will attempt to get this
          if (property as unknown as string === 'toJSON') return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
          if (!(property in allowedPreferences)) new TypeError(`Preference ${ property } claims not to affect ${ collected.translator.label }`)
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }

    collected.items.cacheable(translation.cacheable)
    translation.collections = collected.collections.byKey

    return translation
  }

  private constructor(public collected: Collected, private mode: 'import' | 'export') {
    this[collected.translator.label.replace(/[^a-z]/ig, '')] = true
    this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX
    this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML

    this.options = { ...collected.displayOptions } // for backwards compat
    this.preferences = { ...collected.preferences } // for backwards compat

    this.isJurisM = client.slug === 'jurism'
    this.isZotero = !this.isJurisM

    this.paths = {
      caseSensitive: this.collected.platform !== 'mac' && this.collected.platform !== 'win',
      sep: this.collected.platform === 'win' ? '\\' : '/',
    }

    try {
      if (collected.displayOptions.cache === false) this.cacheable = false
    }
    catch {
    }

    // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
    if (this.collected.displayOptions.exportFileData) this.cacheable = false
    // jabref 4 stores collection info inside the entry, and collection info depends on which part of your library you're exporting
    if (this.BetterTeX && this.collected.preferences.jabrefFormat >= 4) this.cacheable = false
    // relative file paths are going to be different based on the file being exported to
    if (this.collected.preferences.relativeFilePaths) this.cacheable = false

    const override = new Override(this.collected)
    if (override.override('preferences', '.json')) this.cacheable = false
    if (override.override('postscript', '.js')) this.cacheable = false
    if (override.override('strings', '.bib')) this.cacheable = false

    // special handling
    try {
      this.charmap = this.charmap ? JSON.parse(this.collected.preferences.charmap) : {}
    }
    catch (err) {
      log.error('could not parse charmap', err)
      this.charmap = {}
    }

    this.importToExtra = {}
    this.collected.preferences.importNoteToExtra
      .toLowerCase()
      .split(/\s*,\s*/)
      .filter(field => field)
      .forEach(field => {
        this.importToExtra[field.replace(/\s*=.*/, '')] = field.match(/\s*=\s*force$/) ? 'force' : 'plain'
      })
    this.skipFields = this.collected.preferences.skipFields.toLowerCase().split(',').map(field => this.typefield(field)).filter((s: string) => s)

    let m: RegExpMatchArray
    if (this.skipFields.length) {
      this.skipField = new RegExp('^(' + this.skipFields.map(field => {
        if (m = field.match(/^(csl|tex|bibtex|biblatex)[.]([-a-z]+)[.]([-a-z]+)$/)) {
          return `(${ m[1] === 'tex' ? 'bib(la)?' : '' }[.]${ m[2] }[.]${ m[3] })`
        }
        if (m = field.match(/^(tex|bibtex|biblatex)[.]([-a-z]+)$/)) {
          return `(${ m[1] === 'tex' ? 'bib(la)?' : '' }[.][-a-z]+[.]${ m[2] })`
        }
        if (m = field.match(/^([-a-z]+)[.]([-a-z]+)$/)) {
          return `(${ this.BetterTeX ? 'bib(la)?tex' : 'csl' }[.]${ m[1] }[.]${ m[2] })`
        }
        if (m = field.match(/^[-a-z]+$/)) {
          return `(${ this.BetterTeX ? 'bib(la)?tex' : 'csl' }[.][-a-z]+[.]${ field })`
        }
        return ''
      }).filter(field => field).join('|') + ')$')
    }

    this.verbatimFields = this.collected.preferences.verbatimFields
      .toLowerCase()
      .split(',')
      .map(field => (m = field.trim().match(/^[/](.+)[/]$/)) ? new RegExp(m[1], 'i') : this.typefield(field))
      .filter((s: string | RegExp) => s)

    if (!this.verbatimFields.length) this.verbatimFields = null
    this.csquotes = this.collected.preferences.csquotes ? { open: this.collected.preferences.csquotes[0], close: this.collected.preferences.csquotes[1] } : null
  }

  saveAttachments(): void {
    if (!this.output?.attachments.length) return
    for (const attachment of this.output.attachments) {
      attachment.saveFile(attachment.defaultPath, true)
    }
  }

  isVerbatimField(field: string): boolean {
    return !!this.verbatimFields.find(v => typeof v === 'string' ? v === field : field.match(v))
  }
}
