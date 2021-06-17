/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types */

declare const Zotero: any

import { Reference as Item } from '../../gen/typings/serialized-item'
import { Cache } from '../../typings/cache'
import type { Translators } from '../../typings/translators'
import type { ParsedDate } from '../../content/dateparser'

import { Translator } from '../lib/translator'
import * as postscript from '../lib/postscript'

import { Exporter } from './exporter'
import { text2latex, replace_command_spacers } from './unicode_translator'
import { datefield } from './datefield'
import * as ExtraFields from '../../gen/items/extra-fields.json'
import * as Extra from '../../content/extra'
import * as CSL from 'citeproc'
import { log } from '../../content/logger'

import { arXiv } from '../../content/arXiv'

const Path = { // eslint-disable-line  @typescript-eslint/naming-convention
  normalize(path) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    return Translator.paths.caseSensitive ? path : path.toLowerCase()
  },

  drive(path) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (Translator.preferences.platform !== 'win') return ''
    return path.match(/^[a-z]:\//) ? path.substring(0, 2) : ''
  },

  relative(path) { // eslint-disable-line prefer-arrow/prefer-arrow-functions
    if (this.drive(Translator.export.dir) !== this.drive(path)) return path

    const from = Translator.export.dir.split(Translator.paths.sep)
    const to = path.split(Translator.paths.sep)

    while (from.length && to.length && this.normalize(from[0]) === this.normalize(to[0])) {
      from.shift()
      to.shift()
    }
    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    return `..${Translator.paths.sep}`.repeat(from.length) + to.join(Translator.paths.sep)
  },
}

const Language = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public babelMap = {
    af: 'afrikaans',
    am: 'amharic',
    ar: 'arabic',
    ast: 'asturian',
    bg: 'bulgarian',
    bn: 'bengali',
    bo: 'tibetan',
    br: 'breton',
    ca: 'catalan',
    cop: 'coptic',
    cy: 'welsh',
    cz: 'czech',
    da: 'danish',
    de_1996: 'ngerman',
    de_at_1996: 'naustrian',
    de_at: 'austrian',
    de_de_1996: 'ngerman',
    de: ['german', 'germanb'],
    dsb: ['lsorbian', 'lowersorbian'],
    dv: 'divehi',
    el: 'greek',
    el_polyton: 'polutonikogreek',
    en_au: 'australian',
    en_ca: 'canadian',
    en: 'english',
    en_gb: ['british', 'ukenglish'],
    en_nz: 'newzealand',
    en_us: ['american', 'usenglish'],
    eo: 'esperanto',
    es: 'spanish',
    et: 'estonian',
    eu: 'basque',
    fa: 'farsi',
    fi: 'finnish',
    fr_ca: [ 'acadian', 'canadian', 'canadien' ],
    fr: ['french', 'francais', 'français'],
    fur: 'friulan',
    ga: 'irish',
    gd: ['scottish', 'gaelic'],
    gl: 'galician',
    he: 'hebrew',
    hi: 'hindi',
    hr: 'croatian',
    hsb: ['usorbian', 'uppersorbian'],
    hu: 'magyar',
    hy: 'armenian',
    ia: 'interlingua',
    id: [ 'indonesian', 'bahasa', 'bahasai', 'indon', 'meyalu' ],
    is: 'icelandic',
    it: 'italian',
    ja: 'japanese',
    kn: 'kannada',
    la: 'latin',
    lo: 'lao',
    lt: 'lithuanian',
    lv: 'latvian',
    ml: 'malayalam',
    mn: 'mongolian',
    mr: 'marathi',
    nb: ['norsk', 'bokmal', 'nob'],
    nl: 'dutch',
    nn: 'nynorsk',
    no: ['norwegian', 'norsk'],
    oc: 'occitan',
    pl: 'polish',
    pms: 'piedmontese',
    pt_br: ['brazil', 'brazilian'],
    pt: ['portuguese', 'portuges'],
    pt_pt: 'portuguese',
    rm: 'romansh',
    ro: 'romanian',
    ru: 'russian',
    sa: 'sanskrit',
    se: 'samin',
    sk: 'slovak',
    sl: ['slovenian', 'slovene'],
    sq_al: 'albanian',
    sr_cyrl: 'serbianc',
    sr_latn: 'serbian',
    sr: 'serbian',
    sv: 'swedish',
    syr: 'syriac',
    ta: 'tamil',
    te: 'telugu',
    th: ['thai', 'thaicjk'],
    tk: 'turkmen',
    tr: 'turkish',
    uk: 'ukrainian',
    ur: 'urdu',
    vi: 'vietnamese',
    zh_latn: 'pinyin',
    zh: 'pinyin',
    zlm: [ 'malay', 'bahasam', 'melayu' ],
  }

  private prefix: { [key: string]: boolean | string }
  private babelList: string[]
  private cache: { [key: string]: { lang: string, sim: number }[] }

  constructor() {
    for (const [key, value] of Object.entries(this.babelMap)) {
      if (typeof value === 'string') this.babelMap[key] = [value]
    }

    // list of unique languages
    this.babelList = []
    for (const v of Object.values(this.babelMap)) {
      for (const lang of v) {
        if (this.babelList.indexOf(lang) < 0) this.babelList.push(lang)
      }
    }

    this.cache = {}
    this.prefix = {}
  }

  public lookup(langcode) {
    if (!this.cache[langcode]) {
      this.cache[langcode] = []
      for (const lc of Language.babelList) {
        this.cache[langcode].push({ lang: lc, sim: this.string_similarity(langcode, lc) })
      }
      this.cache[langcode].sort((a, b) => b.sim - a.sim)
    }

    return this.cache[langcode]
  }

  public fromPrefix(langcode) {
    if (!langcode || (langcode.length < 2)) return false

    if (this.prefix[langcode] == null) {
      // consider a langcode matched if it is the prefix of exactly one language in the map
      const lc = langcode.toLowerCase()
      const matches = []
      for (const languages of Object.values(Language.babelMap)) {
        for (const lang of languages) {
          if (lang.toLowerCase().indexOf(lc) !== 0) continue
          matches.push(languages)
          break
        }
      }
      if (matches.length === 1) {
        this.prefix[langcode] = matches[0]
      }
      else {
        this.prefix[langcode] = false
      }
    }

    return this.prefix[langcode]
  }

  private get_bigrams(str) {
    const s = str.toLowerCase()
    const bigrams = [...Array(s.length).keys()].map(i => s.slice(i, i + 2))
    bigrams.sort()
    return bigrams
  }

  private string_similarity(str1, str2) {
    const pairs1 = this.get_bigrams(str1)
    const pairs2 = this.get_bigrams(str2)
    const union = pairs1.length + pairs2.length
    let hit_count = 0

    while ((pairs1.length > 0) && (pairs2.length > 0)) {
      if (pairs1[0] === pairs2[0]) {
        hit_count++
        pairs1.shift()
        pairs2.shift()
        continue
      }

      if (pairs1[0] < pairs2[0]) {
        pairs1.shift()
      }
      else {
        pairs2.shift()
      }
    }

    return (hit_count * 2) / union
  }
}

/*
 * h1 Global object: Translator
 *
 * The global Translator object allows access to the current configuration of the translator
 *
 * @param {enum} caseConversion whether titles should be title-cased and case-preserved
 * @param {boolean} bibtexURL set to true when BBT will generate \url{..} around the urls for BibTeX
 */

/*
 * h1 class: Reference
 *
 * The Bib(La)TeX references are generated by the `Reference` class. Before being comitted to the cache, you can add
 * postscript code that can manipulated the `has` or the `referencetype`
 *
 * @param {String} @referencetype referencetype
 * @param {Object} @item the current Zotero item being converted
 */

const fieldOrder = [
  'ids',
  'title',
  'shorttitle',
  'booktitle',
  'author',
  'editor',
  'date',
  'origdate',
  'year',
  'month',
  'journaltitle',
  'shortjournal',
  'edition',
  'volume',
  'pages',
  'publisher',
  'address',
  'institution',
  'location',
  'issn',
  'doi',
  'url',
  'urldate',

  // '-keywords',
  // '-annotation',
  // '-note',
].reduce((acc, field, idx) => {
  if (field[0] === '-') {
    acc[field.substring(1)] = -(idx + 1)
  }
  else {
    acc[field] = idx + 1
  }
  return acc
}, {})


function entry_sort(a: [string, string | number], b: [string, string | number]): number {
  return Translator.stringCompare(a[0], b[0])
}

/*
 * The fields are objects with the following keys:
 *   * name: name of the Bib(La)TeX field
 *   * value: the value of the field
 *   * bibtex: the LaTeX-encoded value of the field
 *   * enc: the encoding to use for the field
 */
export class Reference {
  public has: { [key: string]: any } = {}
  public item: Item
  public referencetype: string
  public referencetype_source: string
  public useprefix: boolean
  public language: string
  public english: boolean
  public date: ParsedDate | { type: 'none' }

  // patched in by the Bib(La)TeX translators
  public fieldEncoding: Record<string, 'raw' | 'url' | 'verbatim' | 'creators' | 'literal' | 'latex' | 'tags' | 'attachments' | 'date'>
  public caseConversion: { [key: string]: boolean }
  public typeMap: { csl: { [key: string]: string | { type: string, subtype?: string } }, zotero: { [key: string]: string | { type: string, subtype?: string } } }
  public lint: Function
  public addCreators: Function

  // private nonLetters = new Zotero.Utilities.XRegExp('[^\\p{Letter}]', 'g')
  private punctuationAtEnd = new Zotero.Utilities.XRegExp('[\\p{Punctuation}]$')
  private startsWithLowercase = new Zotero.Utilities.XRegExp('^[\\p{Ll}]')
  private hasLowercaseWord = new Zotero.Utilities.XRegExp('\\s[\\p{Ll}]')
  private whitespace = new Zotero.Utilities.XRegExp('\\p{Zs}')

  private inPostscript = false
  private quality_report: string[] = []

  public static installPostscript(): void {
    try {
      if (Translator.preferences.postscript.trim()) {
        // workaround for https://github.com/Juris-M/zotero/issues/65
        Reference.prototype.postscript = new Function(
          'reference',
          'item',
          'Translator',
          'Zotero',
          postscript.body(Translator.preferences.postscript, 'this.inPostscript')
        ) as postscript.Postscript
      }
      else {
        Reference.prototype.postscript = postscript.noop as postscript.Postscript
      }
    }
    catch (err) {
      Reference.prototype.postscript = postscript.noop as postscript.Postscript
      log.debug('failed to install postscript', err, '\n', postscript.body(Translator.preferences.postscript))
    }
  }

  private _enc_creators_initials_marker = '\u0097' // end of guarded area
  private _enc_creators_relax_marker = '\u200C' // zero-width non-joiner

  private isBibString = /^[a-z][-a-z0-9_]*$/i
  private metadata: Cache.ExportedItemMetadata = { DeclarePrefChars: '', noopsort: false, packages: [] }
  private packages: { [key: string]: boolean }
  private juniorcomma: boolean

  constructor(item) {
    this.item = item
    this.packages = {}
    this.date = item.date ? Zotero.BetterBibTeX.parseDate(item.date) : { type: 'none' }

    if (!this.item.language) {
      this.english = true
    }
    else {
      const langlc = this.item.language.toLowerCase()

      let language = Language.babelMap[langlc.replace(/[^a-z0-9]/, '_')]
      if (!language) language = Language.babelMap[langlc.replace(/-[a-z]+$/i, '').replace(/[^a-z0-9]/, '_')]
      if (!language) language = Language.fromPrefix(langlc)
      if (language) {
        this.language = language[0]
      }
      else {
        const match = Language.lookup(langlc)
        if (match[0].sim >= 0.9) { // eslint-disable-line no-magic-numbers
          this.language = match[0].lang
        }
        else {
          this.language = this.item.language
        }
      }

      this.english = ['american', 'british', 'canadian', 'english', 'australian', 'newzealand', 'usenglish', 'ukenglish', 'anglais'].includes(this.language.toLowerCase())
    }

    // remove ordinal from edition
    this.item.edition = (this.item.edition || '').replace(/^([0-9]+)(nd|th)$/, '$1')

    // preserve for thesis type etc
    let csl_type = this.item.extraFields.kv.type
    if (this.typeMap.csl[csl_type]) {
      delete this.item.extraFields.kv.type
    }
    else {
      csl_type = null
    }

    // should be const referencetype: string | { type: string, subtype?: string }
    // https://github.com/Microsoft/TypeScript/issues/10422
    let referencetype: any
    if (this.item.extraFields.tex.referencetype) {
      referencetype = this.item.extraFields.tex.referencetype.value
      this.referencetype_source = `tex.${referencetype}`
    }
    else if (csl_type) {
      referencetype = this.typeMap.csl[csl_type]
      this.referencetype_source = `csl.${csl_type}`
    }
    else {
      referencetype = this.typeMap.zotero[this.item.itemType] || 'misc'
      this.referencetype_source = `zotero.${this.item.itemType}`
    }
    if (typeof referencetype === 'string') {
      this.referencetype = referencetype
    }
    else {
      this.add({ name: 'entrysubtype', value: referencetype.subtype })
      this.referencetype = referencetype.type
    }

    // TODO: maybe just use item.extraFields.var || item.var instead of deleting them here
    for (const [name, value] of Object.entries(item.extraFields.kv)) {
      const ef = ExtraFields[name]
      if (ef.zotero) {
        if (!item[name] || ef.type === 'date') {
          item[name] = value
        }
        else {
          log.debug('extra fields: skipping', {name, value})
        }
        delete item.extraFields.kv[name]
      }
    }

    for (const [name, value] of Object.entries(item.extraFields.creator)) {
      if (ExtraFields[name].zotero) {
        for (const creator of (value as string[])) {
          item.creators.push({...Extra.zoteroCreator(creator), creatorType: name, source: creator})
        }
        delete item.extraFields.creator[name]
      }
    }

    if (Translator.preferences.jabrefFormat) {
      if (Translator.preferences.testing) {
        this.add({name: 'timestamp', value: '2015-02-24 12:14:36 +0100'})
      }
      else {
        this.add({name: 'timestamp', value: this.item.dateModified || this.item.dateAdded})
      }
    }

    if ((this.item.arXiv = arXiv.parse(this.item.publicationTitle)) && this.item.arXiv.id) {
      this.item.arXiv.source = 'publicationTitle'
      if (Translator.BetterBibLaTeX) delete this.item.publicationTitle

    }
    else if ((this.item.arXiv = arXiv.parse(this.item.extraFields.tex.arxiv?.value)) && this.item.arXiv.id) {
      this.item.arXiv.source = 'extra'

    }
    else {
      this.item.arXiv = null

    }

    if (this.item.arXiv) {
      delete this.item.extraFields.tex.arxiv
      this.add({ name: 'archiveprefix', value: 'arXiv'} )
      this.add({ name: 'eprinttype', value: 'arxiv'})
      this.add({ name: 'eprint', value: this.item.arXiv.id })
      this.add({ name: 'primaryclass', value: this.item.arXiv.category })
    }
  }

  /** normalize dashes, mainly for use in `pages` */
  public normalizeDashes(str): string {
    str = (str || '').trim()

    if (this.item.raw) return str

    return str
      .replace(/\u2053/g, '~')
      .replace(/[\u2014\u2015]/g, '---') // em-dash
      .replace(/[\u2012\u2013]/g, '--') // en-dash
      .split(/(,\s*)/).map(range => {
        if (range.match(/^,\s+/)) return ', '
        if (range === ',') return range

        return range
          .replace(/^([0-9]+)\s*(-+)\s*([0-9]+)\s*$/g, '$1$2$3') // treat space-hyphens-space like a range when it's between numbers
          .replace(/^([0-9]+)-([0-9]+)$/g, '$1--$2') // single dash is probably a range, which should be an n-dash
          .replace(/^([0-9]+)-{4,}([0-9]+)$/g, '$1---$2') // > 4 dashes can't be right. Settle for em-dash
      }).join('')
  }

  /*
   * Add a field to the reference field set
   *
   * @param {field} field to add. 'name' must be set, and either 'value' or 'bibtex'. If you set 'bibtex', BBT will trust
   *   you and just use that as-is. If you set 'value', BBT will escape the value according the encoder passed in 'enc'; no
   *   'enc' means 'enc_latex'. If you pass both 'bibtex' and 'latex', 'bibtex' takes precedence (and 'value' will be
   *   ignored)
   */
  public add(field: Translators.BibTeX.Field): string {
    if (Translator.preferences.testing && !this.inPostscript && field.name !== field.name.toLowerCase()) throw new Error(`Do not add mixed-case field ${field.name}`)

    if (!field.value && !field.bibtex && this.inPostscript) {
      delete this.has[field.name]
      return null
    }

    if (Translator.skipField[field.name]) return null

    if (field.enc === 'date') {
      if (!field.value) return null

      if (field.value === 'today') {
        return this.add({
          ...field,
          value: '<pre>\\today</pre>',
          enc: 'verbatim',
        })
      }

      if (Translator.BetterBibLaTeX && Translator.preferences.biblatexExtendedDateFormat && Zotero.BetterBibTeX.isEDTF(field.value, true)) {
        return this.add({
          ...field,
          value: (field.value as string).replace(/\.[0-9]{3}[a-z]+$/i, ''),
          enc: 'verbatim',
        })
      }

      const date = Zotero.BetterBibTeX.parseDate(field.value)

      this.add(datefield(date, field))

      if (date.orig) {
        this.add(datefield(date.orig, {
          ...field,
          name: (field.orig && field.orig.inherit) ? `orig${field.name}` : (field.orig && field.orig.name),
          verbatim: (field.orig && field.orig.inherit && field.verbatim) ? `orig${field.verbatim}` : (field.orig && field.orig.verbatim),
        }))
      }

      return field.name
    }

    if (field.fallback && field.replace) throw new Error('pick fallback or replace, buddy')
    if (field.fallback && this.has[field.name]) return null

    // legacy field addition, leave in place for postscripts
    if (!field.name) {
      const keys = Object.keys(field)
      switch (keys.length) {
        case 0: // name -> undefined/null
          return null

        case 1:
          field = {name: keys[0], value: field[keys[0]]}
          break

        default:
          throw new Error(`Quick-add mode expects exactly one name -> value mapping, found ${JSON.stringify(field)} (${(new Error()).stack})`)
      }
    }

    if (!field.bibtex) {
      if ((typeof field.value !== 'number') && !field.value) return null
      if ((typeof field.value === 'string') && (field.value.trim() === '')) return null
      if (Array.isArray(field.value) && (field.value.length === 0)) return null
    }

    if (this.has[field.name]) {
      if (this.has[field.name].value === field.value && (this.has[field.name].enc || 'latex') === (field.enc || 'latex')) return null

      if (!this.inPostscript && !field.replace) {
        const value = field.bibtex ? 'bibtex' : 'value'
        throw new Error(`duplicate field '${field.name}' for ${this.item.citationKey}: old: ${this.has[field.name][value]}, new: ${field[value]}`)
      }

      if (!field.replace) {
        let v_old = this.has[field.name].value
        let v_new = field.value
        if (typeof v_old === 'string' && typeof v_new === 'string') {
          v_old = v_old.toLowerCase()
          v_new = v_new.toLowerCase()
        }
        if (v_old !== v_new) this.quality_report.push(`duplicate "${field.name}" ("${this.has[field.name].value}") ignored`)
      }

      delete this.has[field.name]
    }

    if (!field.bibtex) {
      let bibstring = ''
      if ((typeof field.value === 'number') || (field.bibtexStrings && (bibstring = this.getBibString(field.value)))) {
        field.bibtex = `${bibstring || field.value}`

      }
      else {
        field.enc = field.enc || this.fieldEncoding[field.name] || 'latex'

        let value
        switch (field.enc) {
          case 'latex':
            value = this.enc_latex(field, { raw: this.item.raw })
            break

          case 'raw':
            value = this.enc_raw(field)
            break

          case 'url':
            value = this.enc_url(field)
            break

          case 'verbatim':
            value = this.enc_verbatim(field)
            break

          case 'creators':
            value = this.enc_creators(field, this.item.raw)
            break

          case 'literal':
            value = this.enc_literal(field, this.item.raw)
            break

          case 'tags':
            value = this.enc_tags(field)
            break

          case 'attachments':
            value = this.enc_attachments(field)
            break

          default:
            throw new Error(`Unexpected field encoding: ${JSON.stringify(field.enc)}`)
        }

        if (!value) return null

        value = value.trim()

        // scrub fields of unwanted {}, but not if it's a raw field or a bare field without spaces
        if (!field.bare || (field.value as string).match(/\s/)) {
          // clean up unnecesary {} when followed by a char that safely terminates the command before
          // value = value.replace(/({})+($|[{}$\/\\.;,])/g, '$2') // don't remove trailing {} https://github.com/retorquere/zotero-better-bibtex/issues/1091
          value = `{${value}}`
        }

        field.bibtex = value
      }
    }

    this.has[field.name] = field

    return field.name
  }

  /*
   * Remove a field from the reference field set
   *
   * @param {name} field to remove.
   * @return {Object} the removed field, if present
   */
  public remove(name) {
    const removed = this.has[name] || {}
    delete this.has[name]
    return removed
  }

  public getBibString(value): string {
    if (!value || typeof value !== 'string') return null

    switch (Translator.preferences.exportBibTeXStrings) {
      case 'off':
        return null

      case 'detect':
        return this.isBibString.test(value) && value

      case 'match':
        // the importer uppercases string declarations
        return Exporter.strings[value.toUpperCase()] && value

      case 'match+reverse':
        // the importer uppercases string declarations
        value = value.toUpperCase()
        return Exporter.strings[value] ? value : Exporter.strings_reverse[value]

      default:
        return null
    }
  }

  public hasCreator(type): boolean { return (this.item.creators || []).some(creator => creator.creatorType === type) }

  public override(field: Translators.BibTeX.Field): void {
    const itemtype_name = field.name.split('.')
    let name
    if (itemtype_name.length === 2) {
      if (this.referencetype !== itemtype_name[0]) return
      name = itemtype_name[1]
    }
    else {
      name = field.name
    }

    if ((typeof field.value === 'string') && (field.value.trim() === '')) {
      this.remove(name)
      return
    }

    this.add({ ...field, name, replace: (typeof field.replace !== 'boolean' && typeof field.fallback !== 'boolean') || field.replace })
  }

  public complete(): void {
    if (Translator.preferences.jabrefFormat >= 4 && this.item.collections?.length) { // eslint-disable-line no-magic-numbers
      const groups = Array.from(new Set(this.item.collections.map(key => Translator.collections[key]?.name).filter(name => name))).sort()
      this.add({ name: 'groups', value: groups.join(',') })
    }

    // extra-fields has parsed & removed 'ids' to put it into aliases
    if (this.item.extraFields.aliases.length) {
      this.add({ name: 'ids', value: this.item.extraFields.aliases.filter(alias => alias !== this.item.citationKey).join(','), enc: 'verbatim' })
    }

    if (Translator.BetterBibLaTeX) this.add({ name: 'pubstate', value: this.item.status })

    for (const [key, value] of Object.entries(this.item.extraFields.kv)) {
      const type = ExtraFields[key].type
      let enc = {name: 'creator', text: 'latex'}[type] || type
      const replace = type === 'date'
      // these are handled just like 'arxiv' and 'lccn', respectively
      if (['PMID', 'PMCID'].includes(key) && typeof value === 'string') {
        this.item.extraFields.tex[key.toLowerCase()] = { value }
        delete this.item.extraFields.kv[key]
        continue
      }

      let name = null

      if (Translator.BetterBibLaTeX) {
        switch (key) {
          case 'issuingAuthority':
            name = 'institution'
            break

          case 'title':
            name = this.referencetype === 'book' ? 'maintitle' : null
            break

          case 'publicationTitle':
            switch (this.referencetype_source) {
              case 'zotero.film':
              case 'zotero.tvBroadcast':
              case 'zotero.videoRecording':
              case 'csl.motion_picture': // TODO: I really should clean these up
                name = 'booktitle'
                break

              case 'zotero.bookSection':
              case 'csl.chapter':
                name = 'maintitle'
                break

              default:
                name = 'journaltitle'
                break
            }
            break

          case 'original-publisher':
            name = 'origpublisher'
            enc = 'literal'
            break

          case 'original-publisher-place':
            name = 'origlocation'
            enc = 'literal'
            break

          case 'original-title':
            name = 'origtitle'
            break

          case 'original-date':
          case 'originalDate':
            name = 'origdate'
            enc = 'date'
            break

          case 'place':
            name = 'location'
            enc = 'literal'
            break

          case 'pages':
            name = 'pages'
            break

          case 'date':
            name = 'date'
            break

          // https://github.com/retorquere/zotero-better-bibtex/issues/644
          case 'event-place':
            name = 'venue'
            break

          case 'accessed':
            name = 'urldate'
            break

          case 'number':
          case 'volume':
          case 'DOI':
          case 'ISBN':
          case 'ISSN':
            name = key.toLowerCase()
            break
        }
      }

      if (Translator.BetterBibTeX) {
        switch (key) {
          case 'call-number':
            name = 'lccn'
            break

          case 'DOI':
          case 'ISSN':
            name = key.toLowerCase()
            break
        }
      }

      if (name) {
        this.override({ name, verbatim: name, orig: { inherit: true }, value, enc, replace, fallback: !replace })
      }
      else {
        log.debug('Unmapped extra field', key, '=', value)
      }
    }

    this.add({ name: 'annotation', value: this.item.extra?.replace(/\n+/g, ' ') })
    if (Translator.options.exportNotes) {
      // if bibtexURL === 'note' is active, the note field will have been filled with an URL. In all other cases, if this is attempting to overwrite the 'note' field, I want the test suite to throw an error
      if (!(Translator.BetterBibTeX && Translator.preferences.bibtexURL === 'note')) this.add({ name: 'note', value: this.item.notes?.map((note: { note: string }) => note.note).join('</p><p>'), html: true })
    }

    const bibtexStrings = Translator.preferences.exportBibTeXStrings.startsWith('match')
    for (const [name, field] of Object.entries(this.item.extraFields.tex)) {
      // psuedo-var, sets the reference type. Repeat application here because this needs to override all else.
      if (name === 'referencetype') {
        this.referencetype = field.value
        continue
      }

      switch (name) {
        case 'mr':
          this.override({ name: 'mrnumber', value: field.value, raw: field.raw })
          break
        case 'zbl':
          this.override({ name: 'zmnumber', value: field.value, raw: field.raw })
          break
        case 'lccn': case 'pmcid':
          this.override({ name, value: field.value, raw: field.raw })
          break
        case 'pmid':
        case 'arxiv':
        case 'jstor':
        case 'hdl':
          if (Translator.BetterBibLaTeX) {
            this.override({ name: 'eprinttype', value: name })
            this.override({ name: 'eprint', value: field.value, raw: field.raw })
          }
          else {
            this.override({ name, value: field.value, raw: field.raw })
          }
          break
        case 'googlebooksid':
          if (Translator.BetterBibLaTeX) {
            this.override({ name: 'eprinttype', value: 'googlebooks' })
            this.override({ name: 'eprint', value: field.value, raw: field.raw })
          }
          else {
            this.override({ name: 'googlebooks', value: field.value, raw: field.raw })
          }
          break
        case 'xref':
          this.override({ name, value: field.value, raw: field.raw })
          break

        default:
          this.override({ ...field, name, bibtexStrings })
          break
      }
    }

    // sort before postscript so the postscript can affect field order
    const keys = Object.keys(this.has).sort((a, b) => {
      const fa = fieldOrder[a]
      const fb = fieldOrder[b]

      if (fa && fb) return Math.abs(fa) - Math.abs(fb)
      if (fa) return -fa
      if (fb) return fb
      return a.localeCompare(b)
    })
    for (const field of keys) {
      const value = this.has[field]
      delete this.has[field]
      this.has[field] = value
    }

    let allow: postscript.Allow = { cache: true, write: true }
    try {
      allow = this.postscript(this, this.item, Translator, Zotero)
    }
    catch (err) {
      log.error('Reference.postscript failed:', err)
      allow.cache = false
    }
    this.item.$cacheable = this.item.$cacheable && allow.cache

    for (const name of Translator.skipFields) {
      this.remove(name)
    }

    if (this.has.url && this.has.doi) {
      switch (Translator.preferences.DOIandURL) {
        case 'url':
          delete this.has.doi
          break
        case 'doi':
          delete this.has.url
          break
      }
    }

    if (!this.has.url) this.remove('urldate')

    if (!Object.keys(this.has).length) this.add({name: 'type', value: this.referencetype})

    const fields = Object.values(this.has).map(field => `  ${field.name} = ${field.bibtex}`)

    let ref = `@${this.referencetype}{${this.item.citationKey},\n`
    ref += fields.join(',\n')
    ref += '\n}\n'
    ref += this.qualityReport()
    ref += '\n'

    if (allow.write) Zotero.write(ref)

    this.metadata.DeclarePrefChars = Exporter.unique_chars(this.metadata.DeclarePrefChars)

    this.metadata.packages = Object.keys(this.packages)
    if (this.item.$cacheable) Zotero.BetterBibTeX.cacheStore(this.item.itemID, Translator.options, Translator.preferences, ref, this.metadata)

    Exporter.postfix.add(this.metadata)
  }

  /*
   * 'Encode' to raw LaTeX value
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */
  protected enc_raw(f): string {
    return f.value
  }

  /*
   * Encode to LaTeX url
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping). If in Better BibTeX, wraps return value in `\url{string}`
   */
  protected enc_url(f): string {
    if (Translator.BetterBibTeX && Translator.preferences.bibtexURL.endsWith('-ish')) {
      return (f.value || '').replace(/([#\\%&{}])/g, '\\$1') // or maybe enc_latex?
    }
    else if (Translator.BetterBibTeX && Translator.preferences.bibtexURL === 'note') {
      return `\\url{${this.enc_verbatim(f)}}`
    }
    else {
      return this.enc_verbatim(f)
    }
  }

  /*
   * Encode to verbatim LaTeX
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping).
   */
  protected enc_verbatim(f): string {
    // if (!Translator.unicode) value = value.replace(/[^\x20-\x7E]/g, (chr => `\\%${`00${chr.charCodeAt(0).toString(16).slice(-2)}`}`))
    return (f.value || '').replace(/([\\{}])/g, '\\$1')
  }

  protected _enc_creators_scrub_name(name: string): string {
    return Zotero.Utilities.XRegExp.replace(name, this.whitespace, ' ', 'all')
  }
  /*
   * Encode creators to author-style field
   *
   * @param {field} field to encode. The 'value' must be an array of Zotero-serialized `creator` objects.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_creators(f, raw: boolean) {
    if (f.value.length === 0) return null

    const encoded = []
    for (const creator of f.value) {
      let name
      if (creator.name || (creator.lastName && (creator.fieldMode === 1))) {
        name = creator.name || creator.lastName
        if (name !== 'others') name = raw ? `{${name}}` : this.enc_latex({value: new String(this._enc_creators_scrub_name(name))}) // eslint-disable-line no-new-wrappers

      }
      else if (raw) {
        name = [creator.lastName || '', creator.firstName || ''].join(', ')

      }
      else if (creator.lastName || creator.firstName) {
        name = {
          family: this._enc_creators_scrub_name(creator.lastName || ''),
          given: this._enc_creators_scrub_name(creator.firstName || ''),
        }

        if (Translator.preferences.parseParticles) CSL.parseParticles(name)

        if (!Translator.BetterBibLaTeX || !Translator.preferences.biblatexExtendedNameFormat) {
          // side effects to set use-prefix/uniorcomma -- make sure addCreators is called *before* adding 'options'
          if (!this.useprefix) this.useprefix = !!name['non-dropping-particle']
          if (!this.juniorcomma) this.juniorcomma = (f.juniorcomma && name['comma-suffix'])
        }

        if (Translator.BetterBibTeX) {
          name = this._enc_creators_bibtex(name)
        }
        else {
          name = this._enc_creators_biblatex(name)
        }

        name = name.replace(/ and /g, ' {and} ')

      }
      else {
        continue
      }

      encoded.push(name.trim())
    }

    return replace_command_spacers(encoded.join(' and '))
  }

  /*
   * Encode text to LaTeX literal list (double-braced)
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_literal(f, raw = false) {
    if (!f.value) return null
    return this.enc_latex({...f, value: Translator.preferences.exportBraceProtection ? new String(f.value) : f.value}, { raw }) // eslint-disable-line no-new-wrappers
  }

  /*
   * Encode text to LaTeX
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_latex(f, options: { raw?: boolean, creator?: boolean} = {}) {
    if (typeof f.value === 'number') return f.value
    if (!f.value) return null

    if (Array.isArray(f.value)) {
      if (f.value.length === 0) return null
      return f.value.map(elt => this.enc_latex({...f, bibtex: undefined, value: elt}, options)).join(f.sep || '')
    }

    if (f.raw || options.raw) return f.value

    const caseConversion = this.caseConversion[f.name] || f.caseConversion
    const latex = text2latex(f.value, {html: f.html, caseConversion: caseConversion && this.english, creator: options.creator})
    for (const pkg of latex.packages) {
      this.packages[pkg] = true
    }
    let value: String | string = latex.latex

    /*
      biblatex has a langid field it can use to exclude non-English
      titles from any lowercasing a style might request, so no
      additional protection by BBT is necessary. bibtex lacks a
      comparable mechanism, so the only thing BBT can do to tell
      bibtex to back off from non-English titles is to wrap the whole
      thing in braces.
    */
    if (caseConversion && Translator.BetterBibTeX && !this.english && Translator.preferences.exportBraceProtection) value = `{${value}}`

    if (f.value instanceof String && !latex.raw) value = new String(`{${value}}`) // eslint-disable-line no-new-wrappers
    return value
  }

  protected enc_tags(f): string {
    const tags = f.value
      .map(tag => (typeof tag === 'string' ? { tag } : tag))
      .filter(tag => (Translator.preferences.automaticTags || (tag.type !== 1)) && tag.tag !== Translator.preferences.rawLaTag)
    if (tags.length === 0) return null

    tags.sort((a, b) => Translator.stringCompare(a.tag, b.tag))

    for (const tag of tags) {
      if (Translator.BetterBibTeX) {
        tag.tag = tag.tag.replace(/([#\\%&])/g, '\\$1')
      }
      else {
        tag.tag = tag.tag.replace(/([#%\\])/g, '\\$1')
      }

      // the , -> ; is unfortunate, but I see no other way
      tag.tag = tag.tag.replace(/,/g, ';')

      // verbatim fields require balanced braces -- please just don't use braces in your tags
      let balanced = 0
      for (const ch of tag.tag) {
        switch (ch) {
          case '{': balanced += 1; break
          case '}': balanced -= 1; break
        }
        if (balanced < 0) break
      }
      if (balanced !== 0) tag.tag = tag.tag.replace(/{/g, '(').replace(/}/g, ')')
    }

    return tags.map(tag => tag.tag).join(',')
  }

  protected enc_attachments(f): string {
    if (!f.value || (f.value.length === 0)) return null
    const attachments: {title: string, mimetype: string, path: string}[] = []

    for (const attachment of f.value) {
      const att = {
        title: attachment.title,
        mimetype: attachment.contentType || '',
        path: '',
      }

      if (Translator.options.exportFileData) {
        att.path = attachment.saveFile ? attachment.defaultPath : ''
      }
      else if (attachment.localPath) {
        att.path = attachment.localPath
      }

      if (!att.path) continue // amazon/googlebooks etc links show up as atachments without a path
      // att.path = att.path.replace(/^storage:/, '')
      att.path = att.path.replace(/(?:\s*[{}]+)+\s*/g, ' ')

      if (Translator.options.exportFileData) {
        attachment.saveFile(att.path, true)
      }

      if (!att.title) att.title = att.path.replace(/.*[\\/]/, '') || 'attachment'

      if (!att.mimetype && (att.path.slice(-4).toLowerCase() === '.pdf')) att.mimetype = 'application/pdf' // eslint-disable-line no-magic-numbers

      if (Translator.preferences.testing) {
        att.path = `files/${this.item.citationKey}/${att.path.replace(/.*[/\\]/, '')}`
      }
      else if (Translator.preferences.relativeFilePaths && Translator.export.dir) {
        const relative = Path.relative(att.path)
        if (relative !== att.path) {
          this.item.$cacheable = false
          att.path = relative
        }
      }

      attachments.push(att)
    }

    if (attachments.length === 0) return null

    // sort attachments for stable tests, and to make non-snapshots the default for JabRef to open (#355)
    attachments.sort((a, b) => {
      if ((a.mimetype === 'text/html') && (b.mimetype !== 'text/html')) return 1
      if ((b.mimetype === 'text/html') && (a.mimetype !== 'text/html')) return -1
      return Translator.stringCompare(a.path, b.path)
    })

    if (Translator.preferences.jabrefFormat) return attachments.map(att => [att.title, att.path, att.mimetype].map(part => part.replace(/([\\{}:;])/g, '\\$1')).join(':')).join(';')
    return attachments.map(att => att.path.replace(/([\\{}:;])/g, '\\$1')).join(';')
  }

  private _enc_creators_pad_particle(particle: string, relax = false): string {
    // space at end is always OK
    if (particle[particle.length - 1] === ' ') return particle

    if (Translator.BetterBibLaTeX) {
      if (Zotero.Utilities.XRegExp.test(particle, this.punctuationAtEnd)) this.metadata.DeclarePrefChars += particle[particle.length - 1]
      // if BBLT, always add a space if it isn't there
      return `${particle} `
    }

    // otherwise, we're in BBT.

    // If the particle ends in a period, add a space
    if (particle[particle.length - 1] === '.') return `${particle} `

    // if it ends in any other punctuation, it's probably something like d'Medici -- no space
    if (Zotero.Utilities.XRegExp.test(particle, this.punctuationAtEnd)) {
      if (relax) return `${particle}${this._enc_creators_relax_marker} `
      return particle
    }

    // otherwise, add a space
    return `${particle} `
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private _enc_creator_part(part: string | String): string | String {
    const { latex, packages } = text2latex((part as string), { creator: true, commandspacers: true })
    for (const pkg of packages) {
      this.packages[pkg] = true
    }
    return (part instanceof String) ? new String(`{${latex}}`) : latex // eslint-disable-line no-new-wrappers
  }
  private _enc_creators_biblatex(name: {family?: string, given?: string, suffix?: string}): string {
    let family: string | String
    if ((name.family.length > 1) && (name.family[0] === '"') && (name.family[name.family.length - 1] === '"')) {
      family = new String(name.family.slice(1, -1)) // eslint-disable-line no-new-wrappers
    }
    else {
      ({ family } = name)
    }

    const initials_marker_pos: number = (name.given || '').indexOf(this._enc_creators_initials_marker) // end of guarded area
    let initials: string | String

    if (Translator.preferences.biblatexExtendedNameFormat && (name['dropping-particle'] || name['non-dropping-particle'] || name['comma-suffix'])) {
      if (initials_marker_pos >= 0) {
        initials = name.given.substring(0, initials_marker_pos)
        if (initials.length > 1) initials = new String(initials) // eslint-disable-line no-new-wrappers
        name.given = name.given.replace(this._enc_creators_initials_marker, '')
      }
      else {
        initials = ''
      }

      const namebuilder: string[] = []
      if (family) namebuilder.push(`family=${this._enc_creator_part(family)}`)
      if (name.given) namebuilder.push(`given=${this._enc_creator_part(name.given)}`)
      if (initials) namebuilder.push(`given-i=${this._enc_creator_part(initials)}`)
      if (name.suffix) namebuilder.push(`suffix=${this._enc_creator_part(name.suffix)}`)
      if (name['dropping-particle'] || name['non-dropping-particle']) {
        namebuilder.push(`prefix=${this._enc_creator_part(name['dropping-particle'] || name['non-dropping-particle'])}`)
        namebuilder.push(`useprefix=${!!name['non-dropping-particle']}`)
      }
      if (name['comma-suffix']) namebuilder.push('juniorcomma=true')
      return namebuilder.join(', ')
    }

    if (family && Zotero.Utilities.XRegExp.test(family, this.startsWithLowercase)) family = new String(family) // eslint-disable-line no-new-wrappers

    if (family) family = this._enc_creator_part(family)

    if (initials_marker_pos >= 0) name.given = `<span relax="true">${name.given.replace(this._enc_creators_initials_marker, '</span>')}`

    let latex = ''
    if (name['dropping-particle']) latex += this._enc_creator_part(this._enc_creators_pad_particle(name['dropping-particle']))
    if (name['non-dropping-particle']) latex += this._enc_creator_part(this._enc_creators_pad_particle(name['non-dropping-particle']))
    if (family) latex += family
    if (name.suffix) latex += `, ${this._enc_creator_part(name.suffix)}`
    if (name.given) latex += `, ${this._enc_creator_part(name.given)}`

    return latex
  }

  private _enc_creators_bibtex(name): string {
    let family: string | String
    if ((name.family.length > 1) && (name.family[0] === '"') && (name.family[name.family.length - 1] === '"')) { // quoted
      family = new String(name.family.slice(1, -1)) // eslint-disable-line no-new-wrappers
    }
    else {
      family = name.family
    }

    if (name.given && (name.given.indexOf(this._enc_creators_initials_marker) >= 0)) {
      name.given = `<span relax="true">${name.given.replace(this._enc_creators_initials_marker, '</span>')}`
    }

    /*
      TODO: http://chat.stackexchange.com/rooms/34705/discussion-between-retorquere-and-egreg

      My advice is never using the alpha style; it's a relic of the past, when numbering citations was very difficult
      because one didn't know the full citation list when writing a paper. In order to have the bibliography in
      alphabetical order, such tricks were devised. The alternative was listing the citation in order of appearance.
      Your document gains nothing with something like XYZ88 as citation key.

      The “van” problem should be left to the bibliographic style. Some styles consider “van” as part of the name, some
      don't. In any case, you'll have a kludge, mostly unportable. However, if you want van Gogh to be realized as vGo
      in the label, use {\relax van} Gogh or something like this.
    */

    // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
    if (name['non-dropping-particle']) family = new String(this._enc_creators_pad_particle(name['non-dropping-particle']) + family) // eslint-disable-line no-new-wrappers
    if (Zotero.Utilities.XRegExp.test(family, this.startsWithLowercase) || Zotero.Utilities.XRegExp.test(family, this.hasLowercaseWord)) family = new String(family) // eslint-disable-line no-new-wrappers

    // https://github.com/retorquere/zotero-better-bibtex/issues/978 -- enc_latex can return null
    family = family ? this._enc_creator_part(family) : ''

    // https://github.com/retorquere/zotero-better-bibtex/issues/976#issuecomment-393442419
    if (family[0] !== '{' && name.family.match(/[-\u2014\u2015\u2012\u2013]/)) family = `{${family}}`

    if (name['dropping-particle']) family = `${this._enc_creator_part(this._enc_creators_pad_particle(name['dropping-particle'], true))}${family}`

    if (Translator.BetterBibTeX && Translator.preferences.bibtexParticleNoOp && (name['non-dropping-particle'] || name['dropping-particle'])) {
      family = `{\\noopsort{${this._enc_creator_part(name.family.toLowerCase())}}}${family}`
      this.metadata.noopsort = true
    }

    if (name.given) name.given = this._enc_creator_part(name.given)
    if (name.suffix) name.suffix = this._enc_creator_part(name.suffix)

    let latex: string = (family as string)
    if (name.suffix) latex += `, ${name.suffix}`
    if (name.given) latex += `, ${name.given}`

    return latex
  }

  private postscript(_reference, _item, _translator, _zotero): postscript.Allow {
    return { cache: true, write: true }
  }

  private qualityReport(): string {
    // the quality report will access a bunch of fields not to export them but just to see if they were used, and that triggers the cacheDisabler proxy when
    // the 'collections' field is accessed... rendering a lot of items uncacheable
    const $cacheable = this.item.$cacheable
    try {
      if (!Translator.preferences.qualityReport) return ''

      let report: string[] = this.lint({
        timestamp: `added because JabRef format is set to ${Translator.preferences.jabrefFormat || '?'}`,
      })

      if (report) {
        if (this.has.pages) {
          const dashes = this.has.pages.bibtex.match(/-+/g)
          // if (dashes && dashes.includes('-')) report.push('? hyphen found in pages field, did you mean to use an en-dash?')
          if (dashes && dashes.includes('---')) report.push('? em-dash found in pages field, did you mean to use an en-dash?')
        }
        if (this.has.journal && this.has.journal.value.indexOf('.') >= 0) report.push(`? Possibly abbreviated journal title ${this.has.journal.value}`)
        if (this.has.journaltitle && this.has.journaltitle.value.indexOf('.') >= 0) report.push(`? Possibly abbreviated journal title ${this.has.journaltitle.value}`)

        if (this.referencetype === 'inproceedings' && this.has.booktitle) {
          if (!this.has.booktitle.value.match(/:|Proceedings|Companion| '/) || this.has.booktitle.value.match(/\.|workshop|conference|symposium/)) {
            report.push('? Unsure about the formatting of the booktitle')
          }
        }

        if (this.has.title && Translator.preferences.exportTitleCase) {
          const titleCased = Zotero.BetterBibTeX.titleCase(this.has.title.value) === this.has.title.value
          if (this.has.title.value.match(/\s/)) {
            if (titleCased) report.push('? Title looks like it was stored in title-case in Zotero')
          }
          else {
            if (!titleCased) report.push('? Title looks like it was stored in lower-case in Zotero')
          }
        }
      }
      else {
        report = [`I don't know how to quality-check ${this.referencetype} references`]
      }

      report = report.concat(this.quality_report)

      if (!report.length) return ''

      report.unshift(`== ${Translator.BetterBibTeX ? 'BibTeX' : 'BibLateX'} quality report for ${this.item.citationKey}:`)

      const used: Array<string | number> = Object.values(this.has) // eslint-disable-line @typescript-eslint/array-type
        .filter(field => typeof field.value === 'string' || typeof field.value === 'number')
        .map(field => typeof field.value === 'string' ? field.value.toLowerCase().replace(/[^a-zA-z0-9]/g, '') : field.value)
      const fields: [string, any][] = Object.entries(this.item)
        .sort(entry_sort)
      const extra_fields: [string, any][] = (Object.entries(this.item.extraFields.kv) as [string, any][])
        .sort(entry_sort)
        .map(([field, value]: [string, any]) => [`extraFields.kv.${field}`, value])
      const ignore_unused_fields = [
        'abstractNote',
        'accessDate',
        'autoJournalAbbreviation',
        'citationKey',
        'citekey',
        'collections',
        'date',
        'dateAdded',
        'dateModified',
        'itemID',
        'itemType',
        'itemKey',
        'key',
        'libraryID',
        'relations',
        'uri',
      ]
      for (const [field, value] of fields.concat(extra_fields)) {
        if (!value) continue
        if (ignore_unused_fields.includes(field)) continue

        let v: string
        switch (typeof value) {
          case 'string':
            v = value.toLowerCase().replace(/[^a-zA-z0-9]/g, '')
            if (used.includes(v)) continue
            if (field === 'libraryCatalog' && v.includes('arxiv') && this.item.arXiv) continue
            if (field === 'language' && this.has.langid) continue
            break
          case 'number':
            if (used.includes(value)) continue
            break

          default:
            continue
        }

        report.push(`? Unused ${field}: ${value}`)
      }

      return report.map(line => `% ${line}\n`).join('')
    }
    finally {
      // restore cacheable state
      this.item.$cacheable = $cacheable
    }
  }
}

//  @polyglossia = [
//    'albanian'
//    'amharic'
//    'arabic'
//    'armenian'
//    'asturian'
//    'bahasai'
//    'bahasam'
//    'basque'
//    'bengali'
//    'brazilian'
//    'brazil'
//    'breton'
//    'bulgarian'
//    'catalan'
//    'coptic'
//    'croatian'
//    'czech'
//    'danish'
//    'divehi'
//    'dutch'
//    'english'
//    'british'
//    'ukenglish'
//    'esperanto'
//    'estonian'
//    'farsi'
//    'finnish'
//    'french'
//    'friulan'
//    'galician'
//    'german'
//    'austrian'
//    'naustrian'
//    'greek'
//    'hebrew'
//    'hindi'
//    'icelandic'
//    'interlingua'
//    'irish'
//    'italian'
//    'kannada'
//    'lao'
//    'latin'
//    'latvian'
//    'lithuanian'
//    'lsorbian'
//    'magyar'
//    'malayalam'
//    'marathi'
//    'nko'
//    'norsk'
//    'nynorsk'
//    'occitan'
//    'piedmontese'
//    'polish'
//    'portuges'
//    'romanian'
//    'romansh'
//    'russian'
//    'samin'
//    'sanskrit'
//    'scottish'
//    'serbian'
//    'slovak'
//    'slovenian'
//    'spanish'
//    'swedish'
//    'syriac'
//    'tamil'
//    'telugu'
//    'thai'
//    'tibetan'
//    'turkish'
//    'turkmen'
//    'ukrainian'
//    'urdu'
//    'usorbian'
//    'vietnamese'
//    'welsh'
//  ]
