declare const Zotero: any
declare const ZOTERO_TRANSLATOR_INFO: any

import * as preferences from '../../gen/preferences/defaults.json'
import { client } from '../../content/client'

type TranslatorMode = 'export' | 'import'

export let Translator = new class implements ITranslator { // tslint:disable-line:variable-name
  public preferences: IPreferences
  public skipFields: string[]
  public skipField: Record<string, boolean>
  public verbatimFields?: string[]
  public csquotes: { open: string, close: string }
  public exportDir: string
  public exportPath: string

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

  public BetterBibLaTeX?: boolean                   // tslint:disable-line:variable-name
  public BetterBibTeX?: boolean                     // tslint:disable-line:variable-name
  public BetterTeX: boolean                         // tslint:disable-line:variable-name
  public BetterCSLJSON?: boolean                    // tslint:disable-line:variable-name
  public BetterCSLYAML?: boolean                    // tslint:disable-line:variable-name
  public BetterCSL?: boolean                        // tslint:disable-line:variable-name
  public BetterBibTeXCitationKeyQuickCopy?: boolean // tslint:disable-line:variable-name
  public BetterBibTeXJSON?: boolean                 // tslint:disable-line:variable-name
  public Citationgraph?: boolean                    // tslint:disable-line:variable-name
  public Collectednotes?: boolean                   // tslint:disable-line:variable-name
  // public TeX: boolean
  // public CSL: boolean

  public caching: boolean
  public cache: {
    hits: number
    misses: number
  }

  public header: {
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

  public collections: Record<string, ZoteroCollection>
  private sortedItems: ISerializedItem[]

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
    this.header = ZOTERO_TRANSLATOR_INFO

    this[this.header.label.replace(/[^a-z]/ig, '')] = true
    this.BetterTeX = this.BetterBibTeX || this.BetterBibLaTeX
    this.BetterCSL = this.BetterCSLJSON || this.BetterCSLYAML
    this.preferences = preferences
    this.options = this.header.displayOptions || {}

    this.stringCompare = (new Intl.Collator('en')).compare
  }

  public init(mode: TranslatorMode) {
    this.platform = Zotero.getHiddenPref('better-bibtex.platform')
    this.isJurisM = client === 'jurism'
    this.isZotero = !this.isJurisM

    this.paths = {
      caseSensitive: this.platform !== 'mac' && this.platform !== 'win',
      sep: this.platform === 'win' ? '\\' : '/',
    }

    for (const key in this.options) {
      if (typeof this.options[key] === 'boolean') {
        this.options[key] = !!Zotero.getOption(key)
      } else {
        this.options[key] = Zotero.getOption(key)
      }
    }

    // special handling
    if (mode === 'export') {
      this.cache = {
        hits: 0,
        misses: 0,
      }
      this.exportDir = Zotero.getOption('exportDir')
      this.exportPath = Zotero.getOption('exportPath')
      if (this.exportDir && this.exportDir.endsWith(this.paths.sep)) this.exportDir = this.exportDir.slice(0, -1)
    }

    for (const pref of Object.keys(this.preferences)) {
      let value

      try {
        value = Zotero.getOption(`preference_${pref}`)
      } catch (err) {
        value = undefined
      }

      if (typeof value === 'undefined') value = Zotero.getHiddenPref(`better-bibtex.${pref}`)

      this.preferences[pref] = value
    }

    // special handling
    this.skipFields = this.preferences.skipFields.toLowerCase().trim().split(/\s*,\s*/).filter(s => s)
    this.skipField = this.skipFields.reduce((acc, field) => { acc[field] = true; return acc }, {})

    this.verbatimFields = this.preferences.verbatimFields.toLowerCase().trim().split(/\s*,\s*/).filter(s => s)

    if (!this.verbatimFields.length) this.verbatimFields = null
    this.csquotes = this.preferences.csquotes ? { open: this.preferences.csquotes[0], close: this.preferences.csquotes[1] } : null

    this.preferences.testing = Zotero.getHiddenPref('better-bibtex.testing')

    if (mode === 'export') {
      this.unicode = (this.BetterBibTeX && !Translator.preferences.asciiBibTeX) || (this.BetterBibLaTeX && !Translator.preferences.asciiBibLaTeX)

      this.caching = !(
        // when exporting file data you get relative paths, when not, you get absolute paths, only one version can go into the cache
        this.options.exportFileData

        // jabref 4 stores collection info inside the reference, and collection info depends on which part of your library you're exporting
        || (this.BetterTeX && this.preferences.jabrefFormat === 4) // tslint:disable-line:no-magic-numbers

        // if you're looking at this.exportPath or this.exportDir in the postscript you're probably outputting something different based on it
        || ((this.preferences.postscript || '').indexOf('Translator.exportPath') >= 0)
        || ((this.preferences.postscript || '').indexOf('Translator.exportDir') >= 0)

        // relative file paths are going to be different based on the file being exported to
        || this.preferences.relativeFilePaths
      )
    }

    this.collections = {}
    if (mode === 'export' && this.header.configOptions?.getCollections && Zotero.nextCollection) {
      let collection
      while (collection = Zotero.nextCollection()) {
        const children = collection.children || collection.descendents || []
        const key = (collection.primary ? collection.primary : collection).key

        this.collections[key] = {
          // id: collection.id,
          key,
          parent: collection.fields.parentKey,
          name: collection.name,
          items: collection.childItems,
          collections: children.filter(coll => coll.type === 'collection').map(coll => coll.key),
          // items: (item.itemID for item in children when item.type != 'collection')
          // descendents: undefined
          // children: undefined
          // childCollections: undefined
          // primary: undefined
          // fields: undefined
          // type: undefined
          // level: undefined
        }
      }

      for (collection of Object.values(this.collections)) {
        if (collection.parent && !this.collections[collection.parent]) {
          collection.parent = false
          Zotero.debug(`BBT translator: collection with key ${collection.key} has non-existent parent ${collection.parent}, assuming root collection`)
        }
      }
    }

    this.initialized = true
  }

  public items(): ISerializedItem[] {
    if (!this.sortedItems) {
      this.sortedItems = []
      let item
      while (item = Zotero.nextItem()) {
        item.journalAbbreviation = item.journalAbbreviation || item.autoJournalAbbreviation
        this.sortedItems.push(item)
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
    return this.items().shift()
  }
}
