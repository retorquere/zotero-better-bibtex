declare const Zotero: any
declare const ZOTERO_TRANSLATOR_INFO: any

import { defaults } from '../../content/prefs-meta'
import { client } from '../../content/client'
import { ZoteroTranslator } from '../../gen/typings/serialized-item'
import type { Preferences } from '../../gen/preferences'
import { log } from '../../content/logger'

type TranslatorMode = 'export' | 'import'

const cacheDisabler = new class {
  get(target, property) {
    // collections: jabref 4 stores collection info inside the reference, and collection info depends on which part of your library you're exporting
    if (['collections'].includes(property)) target.cachable = false
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return target[property]
  }
}

type TranslatorHeader = {
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
  }

  configOptions: {
    getCollections: boolean
    async: boolean
  }
}

export const Translator = new class implements ITranslator { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public preferences: Preferences
  public skipFields: string[]
  public skipField: Record<string, boolean>
  public verbatimFields?: string[]
  public csquotes: { open: string, close: string }
  public export: { dir: string, path: string } = {
    dir: undefined,
    path: undefined,
  }

  public options: {
    quickCopyMode?: string
    dropAttachments?: boolean
    exportNotes?: boolean
    exportFileData?: boolean
    useJournalAbbreviation?: boolean
    keepUpdated?: boolean
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

  private cachable: boolean
  public cache: {
    hits: number
    misses: number
  }

  public header: TranslatorHeader

  public collections: Record<string, ZoteroTranslator.Collection>
  private sortedItems: ZoteroTranslator.Item[]
  private currentItem: ZoteroTranslator.Item

  public isJurisM: boolean
  public isZotero: boolean
  public unicode: boolean
  public platform: string
  public paths: {
    caseSensitive: boolean
    sep: string
  }

  public stringCompare: (a: string, b: string) => number

  public initialized = false

  constructor() {
    this.header = (ZOTERO_TRANSLATOR_INFO as TranslatorHeader)

    this[this.header.label.replace(/[^a-z]/ig, '')] = true
    this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX
    this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML
    this.preferences = defaults
    this.options = this.header.displayOptions || {}

    const collator = new Intl.Collator('en')
    this.stringCompare = (collator.compare.bind(collator) as (left: string, right: string) => number)
  }

  public get exportDir(): string {
    this.currentItem.cachable = false
    return this.export.dir
  }

  public get exportPath(): string {
    this.currentItem.cachable = false
    return this.export.path
  }

  private typefield(field: string): string {
    field = field.trim()
    if (field.startsWith('bibtex.')) return this.BetterBibTeX ? field.replace(/^bibtex\./, '') : ''
    if (field.startsWith('biblatex.')) return this.BetterBibLaTeX ? field.replace(/^biblatex\./, '') : ''
    return field
  }

  public init(mode: TranslatorMode) {
    this.platform = (Zotero.getHiddenPref('better-bibtex.platform') as string)
    this.isJurisM = client === 'jurism'
    this.isZotero = !this.isJurisM

    this.paths = {
      caseSensitive: this.platform !== 'mac' && this.platform !== 'win',
      sep: this.platform === 'win' ? '\\' : '/',
    }

    for (const key in this.options) {
      if (typeof this.options[key] === 'boolean') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.options[key] = !!Zotero.getOption(key)
      }
      else {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        this.options[key] = Zotero.getOption(key)
      }
    }

    // special handling
    if (mode === 'export') {
      this.cache = {
        hits: 0,
        misses: 0,
      }
      this.export = {
        dir: (Zotero.getOption('exportDir') as string),
        path: (Zotero.getOption('exportPath') as string),
      }
      if (this.export.dir?.endsWith(this.paths.sep)) this.export.dir = this.export.dir.slice(0, -1)
    }

    for (const pref of Object.keys(this.preferences)) {
      let value

      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        value = Zotero.getOption(`preference_${pref}`)
      }
      catch (err) {
        value = undefined
      }

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      if (typeof value === 'undefined') value = Zotero.getHiddenPref(`better-bibtex.${pref}`)

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      this.preferences[pref] = value
    }

    // special handling
    this.skipFields = this.preferences.skipFields.toLowerCase().split(',').map(field => this.typefield(field)).filter((s: string) => s)
    this.skipField = this.skipFields.reduce((acc, field) => { acc[field] = true; return acc }, {})

    this.verbatimFields = this.preferences.verbatimFields.toLowerCase().split(',').map(field => this.typefield(field)).filter((s: string) => s)

    if (!this.verbatimFields.length) this.verbatimFields = null
    this.csquotes = this.preferences.csquotes ? { open: this.preferences.csquotes[0], close: this.preferences.csquotes[1] } : null

    this.preferences.testing = (Zotero.getHiddenPref('better-bibtex.testing') as boolean)

    if (mode === 'export') {
      this.unicode = (this.BetterBibTeX && !Translator.preferences.asciiBibTeX) || (this.BetterBibLaTeX && !Translator.preferences.asciiBibLaTeX)

      if (this.preferences.baseAttachmentPath && (this.export.dir === this.preferences.baseAttachmentPath || this.export.dir?.startsWith(this.preferences.baseAttachmentPath + this.paths.sep))) {
        this.preferences.relativeFilePaths = true
      }

      // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
      // relative file paths are going to be different based on the file being exported to
      this.cachable = !(
        this.options.exportFileData
        ||
        this.preferences.relativeFilePaths
        ||
        (this.preferences.baseAttachmentPath && this.export.dir?.startsWith(this.preferences.baseAttachmentPath))
      )
    }

    this.collections = {}
    if (mode === 'export' && this.header.configOptions?.getCollections && Zotero.nextCollection) {
      let collection: any
      while (collection = Zotero.nextCollection()) {
        log.debug('getCollection:', collection)
        this.registerCollection(collection, '')
      }
    }

    this.initialized = true
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

  public items(): ZoteroTranslator.Item[] {
    if (!this.sortedItems) {
      this.sortedItems = []
      let item: ZoteroTranslator.Item
      while (item = (Zotero.nextItem() as ZoteroTranslator.Item)) {
        item.cachable = this.cachable
        item.journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation
        this.sortedItems.push(new Proxy(item, cacheDisabler))
      }
      // fallback to itemType.itemID for notes and attachments. And some items may have duplicate keys
      this.sortedItems.sort((a, b) => {
        const ka = [ a.citationKey || a.itemType, a.dateModified || a.dateAdded, a.itemID ].join('\t')
        const kb = [ b.citationKey || b.itemType, b.dateModified || b.dateAdded, b.itemID ].join('\t')
        return ka.localeCompare(kb, undefined, { sensitivity: 'base' })
      })
    }
    return this.sortedItems
  }

  public nextItem() {
    return (this.currentItem = this.items().shift())
  }
}
