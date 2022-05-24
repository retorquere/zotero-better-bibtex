declare const Zotero: any
declare const __estrace: any // eslint-disable-line no-underscore-dangle

import { affects, names as preferences, defaults, PreferenceName, Preferences, schema } from '../../gen/preferences/meta'
import { client } from '../../content/client'
import { RegularItem, Item, Collection } from '../../gen/typings/serialized-item'
import { Pinger } from '../../content/ping'

type TranslatorMode = 'export' | 'import'

type CacheableItem = Item & { $cacheable: boolean }

const cacheDisabler = new class {
  get(target, property) {
    // if (typeof target.$unused === 'undefined') target.$unused = new Set(Object.keys(target).filter(field => !ignore_unused_fields.includes(field)))

    // collections: jabref 4 stores collection info inside the entry, and collection info depends on which part of your library you're exporting
    if (property === 'collections') {
      target.$cacheable = false
    }

    // use for the QR to highlight unused data
    // target.$unused.delete(property)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return target[property]
  }

  /*
  set(target, property, value): boolean {
    if (property === '$cacheable' && target.$cacheable && !value) log.debug('cache-rate: not for', target, (new Error).stack)
    target[property] = value
    return true
  }
  */
}

type NestedCollection = {
  key: string
  name: string
  items: CacheableItem[]
  collections: NestedCollection[]
  parent?: NestedCollection
}

export type TranslatorHeader = {
  translatorID: string
  translatorType: number
  label: string
  description: string
  creator: string
  target: string
  minVersion: string
  maxVersion: string
  priority: number
  inRepository: boolean
  lastUpdated: string
  browserSupport: string

  displayOptions: {
    exportNotes: boolean
    exportFileData: boolean
    useJournalAbbreviation: boolean
    keepUpdated: boolean
    quickCopyMode: string
    Title: boolean
    Authors: boolean
    Year: boolean
    Normalize: boolean
    markdown: boolean
    cacheUse: boolean
  }

  configOptions: {
    getCollections: boolean
    async: boolean
  }
}
declare var ZOTERO_TRANSLATOR_INFO: TranslatorHeader // eslint-disable-line no-var

class Items {
  public list: CacheableItem[] = []
  public map: Record<number | string, CacheableItem> = {}
  public current: CacheableItem

  private ping: Pinger

  constructor(cacheable: boolean) {
    let item: CacheableItem
    while (item = Zotero.nextItem()) {
      item.$cacheable = cacheable;
      (item as RegularItem).journalAbbreviation = (item as RegularItem).journalAbbreviation || (item as RegularItem).autoJournalAbbreviation
      this.list.push(this.map[item.itemID] = this.map[item.itemKey] = new Proxy(item, cacheDisabler))
    }
    // fallback to itemType.itemID for notes and attachments. And some items may have duplicate keys
    this.list.sort((a: any, b: any) => {
      const ka = [ a.citationKey || a.itemType, a.dateModified || a.dateAdded, a.itemID ].join('\t')
      const kb = [ b.citationKey || b.itemType, b.dateModified || b.dateAdded, b.itemID ].join('\t')
      return ka.localeCompare(kb, undefined, { sensitivity: 'base' })
    })

    this.ping = new Pinger({
      total: this.list.length,
      callback: pct => Zotero.worker ? Zotero.BetterBibTeX.setProgress(pct) : null, // eslint-disable-line @typescript-eslint/no-unsafe-return
    })
  }

  *items(): Generator<Item, void, unknown> {
    for (const item of this.list) {
      yield (this.current = item) as Item
      this.ping.update()
    }
    this.ping.done()
  }

  *regularitems(): Generator<RegularItem, void, unknown> {
    for (const item of this.list) {
      switch (item.itemType) {
        case 'annotation':
        case 'note':
        case 'attachment':
          break

        default:
          yield (this.current = item) as unknown as RegularItem
      }
      this.ping.update()
    }
    this.ping.done()
  }
}

function escapeRegExp(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
}

export class ITranslator { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public preferences: Preferences
  public skipFields: string[]
  public skipField: Record<string, boolean>
  public verbatimFields?: (string | RegExp)[]
  public csquotes: { open: string, close: string }
  public export: { dir: string, path: string } = {
    dir: undefined,
    path: undefined,
  }

  public options: {
    quickCopyMode?: string
    dropAttachments?: boolean
    exportNotes?: boolean
    markdown?: boolean
    exportFileData?: boolean
    useJournalAbbreviation?: boolean
    keepUpdated?: boolean
    cacheUse?: boolean
    Title?: boolean
    Authors?: boolean
    Year?: boolean
    Normalize?: boolean
  }

  public BetterBibLaTeX?: boolean                   // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterBibTeX?: boolean                     // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterTeX: boolean                         // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterCSLJSON?: boolean                    // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterCSLYAML?: boolean                    // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterCSL?: boolean                        // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterBibTeXCitationKeyQuickCopy?: boolean // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public BetterBibTeXJSON?: boolean                 // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public Citationgraph?: boolean                    // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public Collectednotes?: boolean                   // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  // public TeX: boolean
  // public CSL: boolean

  private cacheable = true
  private _items: Items

  public cache: {
    hits: number
    requests: number
  }

  public collections: Record<string, Collection>

  public isJurisM: boolean
  public isZotero: boolean
  public unicode: boolean
  public platform: string
  public paths: {
    caseSensitive: boolean
    sep: string
  }

  public stringCompare: (a: string, b: string) => number

  public and: { list: { re: any, repl: string }, names: { re: any, repl: string } }

  public initialized = false

  constructor() {
    const collator = new Intl.Collator('en')
    this.stringCompare = (collator.compare.bind(collator) as (left: string, right: string) => number)
  }

  public get exportDir(): string {
    this._items.current.$cacheable = false
    return this.export.dir
  }

  public get exportPath(): string {
    this._items.current.$cacheable = false
    return this.export.path
  }

  private typefield(field: string): string {
    field = field.trim()
    if (field.startsWith('bibtex.')) return this.BetterBibTeX ? field.replace(/^bibtex\./, '') : ''
    if (field.startsWith('biblatex.')) return this.BetterBibLaTeX ? field.replace(/^biblatex\./, '') : ''
    return field
  }

  public init(mode: TranslatorMode): void {
    this[ZOTERO_TRANSLATOR_INFO.label.replace(/[^a-z]/ig, '')] = true
    this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX
    this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML
    this.options = ZOTERO_TRANSLATOR_INFO.displayOptions || {}

    this.platform = (Zotero.getHiddenPref('better-bibtex.platform') as string)
    this.isJurisM = client === 'jurism'
    this.isZotero = !this.isJurisM

    this.paths = {
      caseSensitive: this.platform !== 'mac' && this.platform !== 'win',
      sep: this.platform === 'win' ? '\\' : '/',
    }

    try {
      if (Zotero.getOption('cache') === false) this.cacheable = false
    }
    catch (err) {
    }

    for (const key in this.options) {
      if (typeof this.options[key] === 'boolean') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.options[key] = Zotero.getOption(key)
      }
      else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.options[key] = !!Zotero.getOption(key)
      }
    }

    // special handling
    if (mode === 'export') {
      this.cache = {
        hits: 0,
        requests: 0,
      }
      this.export = {
        dir: (Zotero.getOption('exportDir') as string),
        path: (Zotero.getOption('exportPath') as string),
      }
      if (this.export.dir?.endsWith(this.paths.sep)) this.export.dir = this.export.dir.slice(0, -1)
      this.options.cacheUse = Zotero.getOption('cacheUse')
    }

    this.preferences = Object.entries(defaults).reduce((acc, [pref, dflt]) => {
      acc[pref] = this.getPreferenceOverride(pref) ?? Zotero.getHiddenPref(`better-bibtex.${pref}`) ?? dflt
      return acc
    }, {} as unknown as Preferences)

    // special handling
    this.skipFields = this.preferences.skipFields.toLowerCase().split(',').map(field => this.typefield(field)).filter((s: string) => s)
    this.skipField = this.skipFields.reduce((acc, field) => { acc[field] = true; return acc }, {})

    let m
    this.verbatimFields = this.preferences.verbatimFields
      .toLowerCase()
      .split(',')
      .map(field => (m = field.trim().match(/^[/](.+)[/]$/)) ? new RegExp(m[1], 'i') : this.typefield(field))
      .filter((s: string | RegExp) => s)

    if (!this.verbatimFields.length) this.verbatimFields = null
    this.csquotes = this.preferences.csquotes ? { open: this.preferences.csquotes[0], close: this.preferences.csquotes[1] } : null

    this.preferences.testing = (Zotero.getHiddenPref('better-bibtex.testing') as boolean)

    if (mode === 'export') {
      this.unicode = !this.preferences[`ascii${ZOTERO_TRANSLATOR_INFO.label.replace(/Better /, '')}`]

      if (this.preferences.baseAttachmentPath && (this.export.dir === this.preferences.baseAttachmentPath || this.export.dir?.startsWith(this.preferences.baseAttachmentPath + this.paths.sep))) {
        this.preferences.relativeFilePaths = true
      }

      // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
      // relative file paths are going to be different based on the file being exported to
      this.cacheable = this.cacheable && this.preferences.cache && !(
        this.options.exportFileData
        ||
        this.preferences.relativeFilePaths
        ||
        (this.preferences.baseAttachmentPath && this.export.dir?.startsWith(this.preferences.baseAttachmentPath))
      )

      if (this.BetterTeX) {
        this.preferences.separatorList = this.preferences.separatorList.trim()
        this.preferences.separatorNames = this.preferences.separatorNames.trim()
        this.and = {
          list: {
            re: new RegExp(escapeRegExp(this.preferences.separatorList), 'g'),
            repl: ` {${this.preferences.separatorList}} `,
          },
          names: {
            re: new RegExp(` ${escapeRegExp(this.preferences.separatorNames)} `, 'g'),
            repl: ` {${this.preferences.separatorNames}} `,
          },
        }
        this.preferences.separatorList = ` ${this.preferences.separatorList} `
        this.preferences.separatorNames = ` ${this.preferences.separatorNames} `
      }
    }

    this.collections = {}
    if (mode === 'export' && ZOTERO_TRANSLATOR_INFO.configOptions?.getCollections && Zotero.nextCollection) {
      let collection: any
      while (collection = Zotero.nextCollection()) {
        this.registerCollection(collection, '')
      }
    }

    if (!this.initialized && mode === 'export' && this.preferences.testing && typeof __estrace === 'undefined' && schema.translator[ZOTERO_TRANSLATOR_INFO.label]?.cached) {
      const ignored = ['testing']
      this.preferences = new Proxy(this.preferences, {
        set: (object, property, _value) => {
          throw new TypeError(`Unexpected set of preference ${String(property)}`)
        },
        get: (object, property: PreferenceName) => {
          // JSON.stringify will attempt to get this
          if (property as unknown as string === 'toJSON') return object[property]
          if (!preferences.includes(property)) throw new TypeError(`Unsupported preference ${property}`)
          if (!ignored.includes(property) && !affects[property]?.includes(ZOTERO_TRANSLATOR_INFO.label)) throw new TypeError(`Preference ${property} claims not to affect ${ZOTERO_TRANSLATOR_INFO.label}`)
          return object[property] // eslint-disable-line @typescript-eslint/no-unsafe-return
        },
      })
    }

    this.initialized = true
  }

  getPreferenceOverride(pref) { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    try {
      const override = Zotero.getOption(`preference_${pref}`)
      if (typeof override !== 'undefined') this.cacheable = false
      return override // eslint-disable-line @typescript-eslint/no-unsafe-return
    }
    catch (err) {
      return undefined
    }
  }

  private registerCollection(collection, parent: string) {
    const key = (collection.primary ? collection.primary : collection).key
    const children = collection.children || collection.descendents || []
    const collections = children.filter(coll => coll.type === 'collection')

    this.collections[key] = {
      key,
      parent,
      name: collection.name,
      collections: collections.map(coll => coll.key as string),
      items: children.filter(coll => coll.type === 'item').map(item => item.id as number),
    }

    for (collection of collections) {
      this.registerCollection(collection, key)
    }
  }

  get collectionTree(): NestedCollection[] {
    return Object.values(this.collections).filter(coll => !coll.parent).map(coll => this.nestedCollection(coll))
  }
  private nestedCollection(collection: Collection): NestedCollection {
    this._items = this._items || new Items(this.cacheable)
    const nested: NestedCollection = {
      key: collection.key,
      name: collection.name,
      items: collection.items.map((itemID: number) => this._items.map[itemID]).filter((item: Item) => item),
      collections: collection.collections.map((key: string) => this.nestedCollection(this.collections[key])).filter((coll: NestedCollection) => coll),
    }
    for (const coll of nested.collections) {
      coll.parent = nested
    }
    return nested
  }

  get items(): Generator<Item, void, unknown> {
    this._items = this._items || new Items(this.cacheable)
    return this._items.items()
  }
  get regularitems(): Generator<RegularItem, void, unknown> {
    this._items = this._items || new Items(this.cacheable)
    return this._items.regularitems()
  }
}
export const Translator = new ITranslator // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
