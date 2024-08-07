declare const Zotero: any
declare const __estrace: any // eslint-disable-line no-underscore-dangle

import { Shim } from '../../content/os'
import { is7 } from '../../content/client'
const $OS = is7 ? Shim : OS

import * as Prefs from '../../gen/preferences/meta'
const PrefNames: Set<string> = new Set(Object.keys(Prefs.defaults))
import { client } from '../../content/client'
import { regex as escapeRE } from '../../content/escape'
import { RegularItem, Item, Collection, Attachment } from '../../gen/typings/serialized-item'
import type { Exporter as BibTeXExporter } from '../bibtex/exporter'
import type { ZoteroItem } from '../bibtex/bibtex'
import type { Translators } from '../../typings/translators.d.ts'
import type { CharMap } from 'unicode2latex'
import { simple as log } from '../../content/logger'

type CacheableItem = Item & { $cacheable: boolean }
type CacheableRegularItem = RegularItem & { $cacheable: boolean }

type NestedCollection = {
  key: string
  name: string
  items: CacheableItem[]
  collections: NestedCollection[]
  parent?: NestedCollection
}

export class Items {
  private items: CacheableItem[] = []
  public map: Record<number | string, CacheableItem> = {}
  public current: CacheableItem

  constructor(items?: CacheableItem[]) {
    if (items) {
      // trace('items: preloaded')
      this.items = items
      for (const item of items) {
        this.map[item.itemID] = this.map[item.itemKey] = item
      }
    }
    else {
      // trace('items: loading')
      let item: CacheableItem
      while (item = Zotero.nextItem()) {
        this.items.push(this.map[item.itemID] = this.map[item.itemKey] = item)
      }
      // trace('items: loaded')
    }
  }

  private sortkey(item) {
    return `${ item.itemID === 'number' ? 'a' : 'b' }\t${ item.citationKey || '' }\t${ item.itemID === 'number' ? item.itemID : '' }`
  }

  public sort(sort: 'off' | 'id' | 'citekey'): void {
    switch (sort) {
      case 'id':
        this.items.sort((a: any, b: any) => {
          if (typeof a.itemID !== 'number') return 1
          if (typeof b.itemID !== 'number') return -1
          return a.itemID - b.itemID
        })
        break
      case 'citekey':
        this.items.sort((a: any, b: any) => this.sortkey(a).localeCompare(this.sortkey(b)))
        break
    }
  }

  public erase(): void {
    this.items = []
    this.map = {}
    this.current = null
  }

  public cacheable(cacheable: boolean): void {
    for (const item of this.items) {
      item.$cacheable = cacheable
    }
  }

  *[Symbol.iterator](): Generator<CacheableItem, void, unknown> {
    // trace('items: start item delivery')
    for (const item of this.items) {
      yield item
    }
    // trace('items: end item delivery')
  }

  public get regular(): Generator<CacheableRegularItem, void, unknown> {
    return this._regular()
  }

  private *_regular(): Generator<CacheableRegularItem, void, unknown> {
    // trace('items: start item delivery')
    for (const item of this.items) {
      switch (item.itemType) {
        case 'annotation':
        case 'note':
        case 'attachment':
          break

        default:
          yield (this.current = item) as unknown as CacheableRegularItem
      }
    }
    // trace('items: end item delivery')
  }
}

export class Collections {
  public byKey: Record<string, Collection> = {}

  constructor(private items: Items, collections?: Record<string, Collection>) {
    if (collections) {
      this.byKey = collections
    }
    else if (Zotero.nextCollection) {
      let collection: any
      while (collection = Zotero.nextCollection()) {
        this.registerCollection(collection, '')
      }
    }
  }

  public erase(): void {
    this.byKey = {}
  }

  private registerCollection(collection, parent: string) {
    const key = (collection.primary ? collection.primary : collection).key
    if (this.byKey[key]) return // why does JM send collections twice?!

    this.byKey[key] = {
      key,
      parent,
      name: collection.name,
      collections: [],
      items: [],
    }

    for (const child of (collection.descendents || collection.children)) {
      switch (child.type) {
        case 'collection':
          this.byKey[key].collections.push(child.key as string)
          this.registerCollection(child, key)
          break
        case 'item':
          this.byKey[key].items.push(child.id as number)
          break
      }
    }
  }

  public get collectionTree(): NestedCollection[] {
    return Object.values(this.byKey).filter(coll => !coll.parent).map(coll => this.nestedCollection(coll))
  }

  private nestedCollection(collection: Collection): NestedCollection {
    const nested: NestedCollection = {
      key: collection.key,
      name: collection.name,
      items: collection.items.map((itemID: number) => this.items.map[itemID]).filter((item: Item) => item),
      collections: collection.collections.map((key: string) => this.nestedCollection(this.byKey[key])).filter((coll: NestedCollection) => coll),
    }

    for (const coll of nested.collections) {
      coll.parent = nested
    }
    return nested
  }
}

export type Input = {
  items: Items
  collections: Collections
}

export type Output = {
  body: string
  attachments: Attachment[]
}

export function collect(): Input {
  const items = new Items
  return { items, collections: new Collections(items) }
}

class Override {
  private orig: Prefs.Preferences
  private exportPath: string
  private exportDir: string

  constructor(private preferences: Prefs.Preferences) {
    this.orig = { ...this.preferences }
    this.exportPath = Zotero.getOption('exportPath')
    this.exportDir = Zotero.getOption('exportDir')
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
            this.preferences[pref] = value
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
  public preferences: Prefs.Preferences
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

  public options: {
    quickCopyMode?: string
    dropAttachments?: boolean
    exportNotes?: boolean
    biblatexAPA?: boolean
    biblatexChicago?: boolean
    markdown?: boolean
    exportFileData?: boolean
    useJournalAbbreviation?: boolean
    keepUpdated?: boolean
    Title?: boolean
    Authors?: boolean
    Year?: boolean
    Normalize?: boolean
    Preferences?: boolean
    Items?: boolean
    worker?: boolean
    custom?: boolean // for pandoc-filter CSL
  }

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
  public ZoteroItem: typeof ZoteroItem

  public input: {
    items: Items
    collections: Collections
  }

  public collections: Record<string, Collection> = {} // keep because it is being used in postscripts
  public output: Output = {
    body: '',
    attachments: [],
  }

  private cacheable = true

  public isJurisM: boolean
  public isZotero: boolean
  public unicode: boolean
  public platform: string
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
    this.input.items.current.$cacheable = false
    return this.export.dir
  }

  public get exportPath(): string {
    this.input.items.current.$cacheable = false
    return this.export.path
  }

  private typefield(field: string): string {
    field = field.trim()
    if (field.startsWith('bibtex.')) return this.BetterBibTeX ? field.replace(/^bibtex\./, '') : ''
    // no input present => import => biblatex mode
    if (field.startsWith('biblatex.')) return this.mode === 'import' || this.BetterBibLaTeX ? field.replace(/^biblatex\./, '') : ''
    return field
  }

  static Import(translator: Translators.Header): Translation {
    return new this(translator, 'import')
  }

  static Export(translator: Translators.Header, input: Input): Translation {
    const translation = new this(translator, 'export')

    translation.input = input
    translation.input.items.sort(translation.preferences.exportSort)

    translation.export = {
      dir: (Zotero.getOption('exportDir') as string),
      path: (Zotero.getOption('exportPath') as string),
    }
    if (translation.export.dir?.endsWith(translation.paths.sep)) translation.export.dir = translation.export.dir.slice(0, -1)

    translation.unicode = !translation.preferences[`ascii${ translator.label.replace(/Better /, '') }`] || false

    if (translation.preferences.baseAttachmentPath && (translation.export.dir === translation.preferences.baseAttachmentPath || translation.export.dir?.startsWith(translation.preferences.baseAttachmentPath + translation.paths.sep))) {
      translation.preferences.relativeFilePaths = true
    }

    // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
    // relative file paths are going to be different based on the file being exported to
    translation.cacheable = translation.cacheable && translation.preferences.cache && !(
      translation.options.exportFileData
      || translation.preferences.relativeFilePaths
      || (translation.preferences.baseAttachmentPath && translation.export.dir?.startsWith(translation.preferences.baseAttachmentPath))
    )

    if (translation.BetterTeX) {
      translation.preferences.separatorList = translation.preferences.separatorList.trim()
      translation.preferences.separatorNames = translation.preferences.separatorNames.trim()
      translation.and = {
        list: {
          re: new RegExp(escapeRE(translation.preferences.separatorList), 'g'),
          repl: ` {${ translation.preferences.separatorList }} `,
        },
        names: {
          re: new RegExp(` ${ escapeRE(translation.preferences.separatorNames) } `, 'g'),
          repl: ` {${ translation.preferences.separatorNames }} `,
        },
      }
      translation.preferences.separatorList = ` ${ translation.preferences.separatorList } `
      translation.preferences.separatorNames = ` ${ translation.preferences.separatorNames } `
    }

    if (translation.preferences.testing && typeof __estrace === 'undefined' && translator.configOptions?.cached) {
      const allowedPreferences: Prefs.Preferences = (translator.label === 'BetterBibTeX JSON' ? Object.keys(Prefs.defaults) : Prefs.affectedBy[translator.label])
        .concat(['testing'])
        .reduce((acc: any, pref: Prefs.PreferenceName) => {
          acc[pref] = translation.preferences[pref]
          return acc as Prefs.Preferences
        }, {}) as unknown as Prefs.Preferences

      translation.preferences = new Proxy(allowedPreferences, {
        set: (object, property, _value) => {
          throw new TypeError(`Unexpected set of preference ${ String(property) }`)
        },
        get: (object, property: Prefs.PreferenceName) => {
          // JSON.stringify will attempt to get this
          if (property as unknown as string === 'toJSON') return object[property]
          if (!(property in allowedPreferences)) new TypeError(`Preference ${ property } claims not to affect ${ translator.label }`)
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }

    translation.input.items.cacheable(translation.cacheable)
    translation.collections = translation.input.collections.byKey

    return translation
  }

  private constructor(public translator: Translators.Header, private mode: 'import' | 'export') {
    this[translator.label.replace(/[^a-z]/ig, '')] = true
    this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX
    this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML
    this.options = { ...(translator.displayOptions || {}) }

    this.platform = Zotero.getHiddenPref('better-bibtex.platform') as string
    this.isJurisM = client === 'jurism'
    this.isZotero = !this.isJurisM

    this.paths = {
      caseSensitive: this.platform !== 'mac' && this.platform !== 'win',
      sep: this.platform === 'win' ? '\\' : '/',
    }

    try {
      if (Zotero.getOption('cache') === false) this.cacheable = false
    }
    catch {
    }

    for (const key in this.options) { // eslint-disable-line guard-for-in
      this.options[key] = !!Zotero.getOption(key)
    }
    this.options.custom = Zotero.getOption('custom') // for pandoc-filter CSL

    this.preferences = Object.entries(Prefs.defaults).reduce((acc, [ pref, dflt ]) => {
      acc[pref] = Zotero.getHiddenPref(`better-bibtex.${ pref }`) ?? dflt
      return acc
    }, {} as unknown as Prefs.Preferences)

    // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
    if (this.options.exportFileData) this.cacheable = false
    // jabref 4 stores collection info inside the entry, and collection info depends on which part of your library you're exporting
    if (this.BetterTeX && this.preferences.jabrefFormat >= 4) this.cacheable = false
    // relative file paths are going to be different based on the file being exported to
    if (this.preferences.relativeFilePaths) this.cacheable = false

    const override = new Override(this.preferences)
    if (override.override('preferences', '.json')) this.cacheable = false
    if (override.override('postscript', '.js')) this.cacheable = false
    if (override.override('strings', '.bib')) this.cacheable = false

    // special handling
    try {
      this.charmap = this.charmap ? JSON.parse(this.preferences.charmap) : {}
    }
    catch (err) {
      log.error('could not parse charmap', err)
      this.charmap = {}
    }

    this.importToExtra = {}
    this.preferences.importNoteToExtra
      .toLowerCase()
      .split(/\s*,\s*/)
      .filter(field => field)
      .forEach(field => {
        this.importToExtra[field.replace(/\s*=.*/, '')] = field.match(/\s*=\s*force$/) ? 'force' : 'plain'
      })
    this.skipFields = this.preferences.skipFields.toLowerCase().split(',').map(field => this.typefield(field)).filter((s: string) => s)

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

    this.verbatimFields = this.preferences.verbatimFields
      .toLowerCase()
      .split(',')
      .map(field => (m = field.trim().match(/^[/](.+)[/]$/)) ? new RegExp(m[1], 'i') : this.typefield(field))
      .filter((s: string | RegExp) => s)

    if (!this.verbatimFields.length) this.verbatimFields = null
    this.csquotes = this.preferences.csquotes ? { open: this.preferences.csquotes[0], close: this.preferences.csquotes[1] } : null

    this.preferences.testing = (Zotero.getHiddenPref('better-bibtex.testing') as boolean)
  }

  public erase(): void {
    this.input.items.erase()
    this.input.collections.erase()
    this.output.body = ''
    this.output.attachments = []
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
