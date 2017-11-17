import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator
declare const Zotero: any

import debug = require('../lib/debug.ts')
import Exporter = require('../lib/exporter.ts')
import { text2latex } from './unicode_translator.ts'

const arXiv = new class {
  // new-style IDs
  // arXiv:0707.3168 [hep-th]
  // arXiv:YYMM.NNNNv# [category]
  private new = /^arxiv:([0-9]{4}\.[0-9]+)(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i

  // arXiv:arch-ive/YYMMNNNv# or arXiv:arch-ive/YYMMNNNv# [category]
  private old = /^arxiv:([a-z]+-[a-z]+\/[0-9]{7})(v[0-9]+)?([^\S\n]+\[(.*)\])?$/i

  // bare
  private bare = /^arxiv:[^\S\n]*([\S]+)/i

  public parse(id) {
    let m
    if (!id) return undefined

    if (m = this.new.exec(id)) {
      return { id, eprint: m[1], primaryClass: m[4] } // tslint:disable-line:no-magic-numbers
    }
    if (m = this.old.exec(id)) {
      return { id, eprint: m[1], primaryClass: m[4] } // tslint:disable-line:no-magic-numbers
    }
    if (m = this.bare.exec(id)) {
      return { id, eprint: m[1] }
    }

    return undefined
  }
}

const Language = new class { // tslint:disable-line:variable-name
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
  private cache: { [key: string]: Array<{ lang: string, sim: number }> }

  constructor() {
    for (const [key, value] of Object.entries(this.babelMap)) {
      if (typeof value === 'string') this.babelMap[key] = [value]
    }

    // list of unique languages
    this.babelList = []
    for (const [k, v] of Object.entries(this.babelMap)) { // tslint:disable-line:no-unused-variable
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
      for (const [code, languages] of Object.entries(Language.babelMap)) { // tslint:disable-line:no-unused-variable
        for (const lang of languages) {
          if (lang.toLowerCase().indexOf(lc) !== 0) continue
          matches.push(languages)
          break
        }
      }
      if (matches.length === 1) {
        this.prefix[langcode] = matches[0]
      } else {
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
      } else {
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
 * postscript code that can manipulated the `fields` or the `referencetype`
 *
 * @param {Array} @fields Array of reference fields
 * @param {String} @referencetype referencetype
 * @param {Object} @item the current Zotero item being converted
 */

/*
 * The fields are objects with the following keys:
 *   * name: name of the Bib(La)TeX field
 *   * value: the value of the field
 *   * bibtex: the LaTeX-encoded value of the field
 *   * enc: the encoding to use for the field
 */
export = class Reference {
  public raw: boolean
  public has: { [key: string]: any }
  public item: any
  public referencetype: string
  public useprefix: boolean
  public language: string
  public english: boolean

  // patched in by the Bib(La)TeX translators
  public fieldEncoding: { [key: string]: string }
  public caseConversion: { [key: string]: boolean }
  public typeMap: { csl: { [key: string]: string | { type: string, subtype?: string } }, zotero: { [key: string]: string | { type: string, subtype?: string } } }
  public lint: Function

  // private nonLetters = new Zotero.Utilities.XRegExp('[^\\p{Letter}]', 'g')
  private punctuationAtEnd = new Zotero.Utilities.XRegExp('[\\p{Punctuation}]$')
  private startsWithLowercase = new Zotero.Utilities.XRegExp('^[\\p{Ll}]')
  private hasLowercaseWord = new Zotero.Utilities.XRegExp('\\s[\\p{Ll}]')

  public static installPostscript() {
    const postscript = Translator.preferences.postscript

    if (typeof postscript !== 'string' || postscript.trim() === '') return

    try {
      Reference.prototype.postscript = new Function('reference', 'item', postscript) as (reference: any, item: any) => void
      Zotero.debug(`Installed postscript: ${JSON.stringify(postscript)}`)
    } catch (err) {
      Zotero.debug(`Failed to compile postscript: ${err}\n\n${JSON.stringify(postscript)}`)
    }
  }

  private _enc_creators_initials_marker = '\u0097'
  private _enc_creators_relax_marker = '\u200C'

  private isBibVarRE = /^[a-z][a-z0-9_]*$/i
  private fields: any[]
  private data: { DeclarePrefChars: string }
  private juniorcomma: boolean

  constructor(item) {
    this.item = item
    this.fields = []
    this.has = {}
    this.raw = (Translator.preferences.rawLaTag === '*') || (this.item.tags.includes(Translator.preferences.rawLaTag))
    this.data = {DeclarePrefChars: ''}

    if (!this.item.language) {
      this.english = true
      debug('detecting language: defaulting to english')
    } else {
      const langlc = this.item.language.toLowerCase()

      let language = Language.babelMap[langlc.replace(/[^a-z0-9]/, '_')]
      if (!language) language = Language.babelMap[langlc.replace(/-[a-z]+$/i, '').replace(/[^a-z0-9]/, '_')]
      if (!language) language = Language.fromPrefix(langlc)
      debug('detecting language:', {langlc, language})
      if (language) {
        this.language = language[0]
      } else {
        const match = Language.lookup(langlc)
        if (match[0].sim >= 0.9) { // tslint:disable-line:no-magic-numbers
          this.language = match[0].lang
        } else {
          this.language = this.item.language
        }
      }

      this.english = ['american', 'british', 'canadian', 'english', 'australian', 'newzealand', 'USenglish', 'UKenglish'].includes(this.language)
      debug('detected language:', {language: this.language, english: this.english})
    }

    if (this.item.extraFields.csl.type) {
      this.item.cslType = this.item.extraFields.csl.type.value
    }

    if (this.item.extraFields.csl['volume-title']) { // should just have been mapped by Zotero
      this.item.volumeTitle = this.item.extraFields.csl['volume-title'].value
      delete this.item.extraFields.csl['volume-title']
    }

    this.item.__type__ = this.item.cslType || this.item.itemType
    debug('postextract: item:', this.item)

    // should be const referencetype: string | { type: string, subtype?: string }
    // https://github.com/Microsoft/TypeScript/issues/10422
    const referencetype: any = this.typeMap.csl[this.item.cslType] || this.typeMap.zotero[this.item.itemType] || 'misc'
    if (typeof referencetype === 'string') {
      this.referencetype = referencetype
    } else {
      this.add({ entrysubtype: referencetype.subtype })
      this.referencetype = referencetype.type
    }

    if (Translator.preferences.jabrefFormat) {
      if (Translator.preferences.testing) {
        this.add({name: 'timestamp', value: '2015-02-24 12:14:36 +0100'})
      } else {
        this.add({name: 'timestamp', value: this.item.dateModified || this.item.dateAdded})
      }
    }

    if (['arxiv.org', 'arxiv'].includes((this.item.libraryCatalog || '').toLowerCase()) && (this.item.arXiv = arXiv.parse(this.item.publicationTitle))) {
      this.item.arXiv.source = 'publicationTitle'
      if (Translator.BetterBibLaTeX) delete this.item.publicationTitle

    } else if (this.item.extraFields.kv.arxiv && (this.item.arXiv = arXiv.parse(`arxiv:${this.item.extraFields.kv.arxiv}`))) {
      this.item.arXiv.source = 'extra'
    }

    if (this.item.arXiv) {
      this.add({ archivePrefix: 'arXiv'} )
      this.add({ eprinttype: 'arxiv'})
      this.add({ eprint: this.item.arXiv.eprint })
      if (this.item.arXiv.primaryClass) this.add({ primaryClass: this.item.arXiv.primaryClass })
      delete this.item.extraFields.kv.arxiv
    }
  }

  /*
   * Add a field to the reference field set
   *
   * @param {field} field to add. 'name' must be set, and either 'value' or 'bibtex'. If you set 'bibtex', BBT will trust
   *   you and just use that as-is. If you set 'value', BBT will escape the value according the encoder passed in 'enc'; no
   *   'enc' means 'enc_latex'. If you pass both 'bibtex' and 'latex', 'bibtex' takes precedence (and 'value' will be
   *   ignored)
   */
  public add(field) {
    if (!field.name) {
      const keys = Object.keys(field)
      switch (keys.length) {
        case 0: // name -> undefined/null
          return

        case 1:
          field = {name: keys[0], value: field[keys[0]]}
          break

        default:
          throw new Error(`Quick-add mode expects exactly one name -> value mapping, found ${JSON.stringify(field)} (${(new Error()).stack})`)
      }
    }

    if (!field.bibtex) {
      if ((typeof field.value !== 'number') && !field.value) return
      if ((typeof field.value === 'string') && (field.value.trim() === '')) return
      if (Array.isArray(field.value) && (field.value.length === 0)) return
    }

    if (field.replace) this.remove(field.name)
    if (this.has[field.name] && !field.allowDuplicates) throw new Error(`duplicate field '${field.name}' for ${this.item.citekey}`)

    if (!field.bibtex) {
      let value

      if ((typeof field.value === 'number') || (field.preserveBibTeXVariables && this.isBibVar(field.value))) {
        value = `${field.value}`
      } else {
        const enc = field.enc || this.fieldEncoding[field.name] || 'latex'
        value = this[`enc_${enc}`](field, this.raw)

        if (!value) return

        if (!field.bare || field.value.match(/\s/)) value = `{${value}}`
      }

      // separation protection at end unnecesary
      value = value.replace(/{}$/, '')

      field.bibtex = `${value}`
    }

    // field.bibtex = field.bibtex.normalize('NFKC') if @normalize
    this.fields.push(field)
    this.has[field.name] = field
  }

  /*
   * Remove a field from the reference field set
   *
   * @param {name} field to remove.
   * @return {Object} the removed field, if present
   */
  public remove(name) {
    if (!this.has[name]) return
    debug('remove field', name)
    const removed = this.has[name]
    delete this.has[name]
    this.fields = this.fields.filter(field => field.name !== name)
    return removed
  }

  public isBibVar(value) {
    return Translator.preferences.preserveBibTeXVariables && value && (typeof value === 'string') && this.isBibVarRE.test(value)
  }

  public hasCreator(type) { return (this.item.creators || []).some(creator => creator.creatorType === type) }

  public complete() {
    if (Translator.preferences.DOIandURL !== 'both') {
      if (this.has.doi && this.has.url) {
        debug('removing', Translator.preferences.DOIandURL === 'doi' ? 'url' : 'doi')
        switch (Translator.preferences.DOIandURL) {
          case 'doi': this.remove('url'); break
          case 'url': this.remove('doi'); break
        }
      }
    }

    if ((this.item.collections || []).length && Translator.preferences.jabrefFormat === 4) { // tslint:disable-line:no-magic-numbers
      let groups = this.item.collections.filter(key => Translator.collections[key]).map(key => Translator.collections[key].name)
      groups = groups.sort().filter((item, pos, ary) => !pos || (item !== ary[pos - 1]))
      this.add({ groups: groups.join(',') })
    }

    const fields = []
    for (const [cslName, field] of Object.entries(this.item.extraFields.csl)) {

      // these are handled just like 'arxiv' and 'lccn', respectively
      if (['pmid', 'pmcid'].includes(cslName)) {
        this.item.extraFields.kv[cslName] = field
        delete this.item.extraFields.csl[cslName]
        continue
      }

      let name = null
      let enc
      switch (field.type) {
        case 'string': enc = null; break
        case 'creator': enc = 'creators'; break
        default: enc = field.type
      }

      switch (cslName) {
        case 'doi': case 'isbn': case 'issn': name = cslName; break
      }

      // CSL names are not in BibTeX format, so only add it if there's a mapping
      if (!name && Translator.BetterBibLaTeX) {
        switch (cslName) {
          case 'authority': name = 'institution'; break
          case 'status': name = 'pubstate'; break

          case 'title':
            name = this.referencetype === 'book' ? 'maintitle' : null
            break

          case 'container-title':
            switch (this.item.__type__) {
              case 'film': case 'tvBroadcast': case 'videoRecording': case 'motion_picture': name = 'booktitle'; break
              case 'bookSection': case 'chapter': name = 'maintitle'; break
              default: name = 'journaltitle'
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
          case 'original-title': name = 'origtitle'; break
          case 'original-date': name = 'origdate'; break

          case 'publisher-place':
            name = 'location'
            enc = 'literal'
            break

          case 'issued': name = 'date'; break

          case 'number': case 'volume': case 'author': case 'director': case 'editor': name = cslName; break
        }
      }

      if (!name && Translator.BetterBibTeX) {
        switch (cslName) {
          case 'call-number': name = 'lccn'; break
        }
      }

      if (name) {
        fields.push({ name, value: field.value, enc })
      } else {
        debug('Unmapped CSL field', cslName, '=', field.value)
      }
    }

    for (const [name, field] of Object.entries(this.item.extraFields.bibtex)) {
      // psuedo-var, sets the reference type
      if (name === 'referencetype') {
        this.referencetype = field.value
        continue
      }

      fields.push(field)
    }

    for (const [name, field] of Object.entries(this.item.extraFields.kv)) {
      switch (name) {
        case 'mr':
          fields.push({ name: 'mrnumber', value: field.value, raw: field.raw })
          break
        case 'zbl':
          fields.push({ name: 'zmnumber', value: field.value, raw: field.raw })
          break
        case 'lccn': case 'pmcid':
          fields.push({ name, value: field.value, raw: field.raw })
          break
        case 'pmid': case 'arxiv': case 'jstor': case 'hdl':
          if (Translator.BetterBibLaTeX) {
            fields.push({ name: 'eprinttype', value: name })
            fields.push({ name: 'eprint', value: field.value, raw: field.raw })
          } else {
            fields.push({ name, value: field.value, raw: field.raw })
          }
          break
        case 'googlebooksid':
          if (Translator.BetterBibLaTeX) {
            fields.push({ name: 'eprinttype', value: 'googlebooks' })
            fields.push({ name: 'eprint', value: field.value, raw: field.raw })
          } else {
            fields.push({ name: 'googlebooks', value: field.value, raw: field.raw })
          }
          break
        case 'xref':
          fields.push({ name, value: field.value, raw: field.raw })
          break

        default:
          debug('unexpected KV field', name, field)
      }
    }

    for (const field of fields) {
      const name = field.name.split('.')
      if (name.length > 1) {
        if (this.referencetype !== name[0]) continue
        field.name = name[1]
      }

      if ((typeof field.value === 'string') && (field.value.trim() === '')) {
        this.remove(field.name)
        continue
      }

      field.replace = true
      this.add(field)
    }

    if (this.fields.length === 0) this.add({name: 'type', value: this.referencetype})

    try {
      this.postscript(this, this.item)
    } catch (err) {
      debug('Reference.postscript failed:', err)
    }

    for (const name of Translator.preferences.skipFields) {
      this.remove(name)
    }

    // sort fields for stable tests
    if (Translator.preferences.testing) this.fields.sort((a, b) => (`${a.name} = ${a.value}`).localeCompare((`${b.name} = ${b.value}`)))

    let ref = `@${this.referencetype}{${this.item.citekey},\n`
    ref += this.fields.map(field => `  ${field.name} = ${field.bibtex}`).join(',\n')
    ref += '\n}\n'
    ref += this.qualityReport()
    ref += '\n'
    Zotero.write(ref)

    this.data.DeclarePrefChars = Exporter.unique_chars(this.data.DeclarePrefChars)

    Zotero.BetterBibTeX.cacheStore(this.item.itemID, Translator.options, ref, this.data)

    if (this.data.DeclarePrefChars) Exporter.preamble.DeclarePrefChars += this.data.DeclarePrefChars
  }

  /*
   * 'Encode' to raw LaTeX value
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */
  protected enc_raw(f) {
    return f.value
  }

  /*
   * Encode to date
   *
   * @param {field} field to encode
   * @return {String} unmodified `field.value`
   */
  protected enc_date(f) {
    let parsed
    if (!f.value) return null

    const { value } = f
    if (typeof f.value === 'string') parsed = Zotero.BetterBibTeX.parseDate(value, this.item.language)

    if (parsed.type === 'verbatim') {
      if (f.value === 'n.d.') return '\\bibstring{nodate}'
      return this.enc_latex(this.clone(f, f.value))
    }

    let date = this.isodate(parsed.from || parsed)
    if (!date) return null

    if (parsed.to) {
      const enddate = this.isodate(parsed.to)
      if (enddate) date += `/${enddate}`
    }

    return this.enc_latex({value: date})
  }

  /*
   * Encode to LaTeX url
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping). If in Better BibTeX, wraps return value in `\url{string}`
   */
  protected enc_url(f) {
    const value = this.enc_verbatim(f)
    if (Translator.BetterBibTeX) {
      return `\\url{${this.enc_verbatim(f)}}`
    } else {
      return value
    }
  }

  /*
   * Encode to verbatim LaTeX
   *
   * @param {field} field to encode
   * @return {String} field.value encoded as verbatim LaTeX string (minimal escaping).
   */
  protected enc_verbatim(f) {
    return this.toVerbatim(f.value)
  }
  /*
   * Encode creators to author-style field
   *
   * @param {field} field to encode. The 'value' must be an array of Zotero-serialized `creator` objects.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_creators(f, raw) {
    if (f.value.length === 0) return null

    const encoded = []
    for (const creator of f.value) {
      let name
      if (creator.name || (creator.lastName && (creator.fieldMode === 1))) {
        name = raw ? `{${creator.name || creator.lastName}}` : this.enc_latex({value: new String(creator.name || creator.lastName)}) // tslint:disable-line:no-construct

      } else if (raw) {
        name = [creator.lastName || '', creator.firstName || ''].join(', ')

      } else if (creator.lastName || creator.firstName) {
        name = {family: creator.lastName || '', given: creator.firstName || ''}

        if (Translator.preferences.parseParticles) Zotero.BetterBibTeX.parseParticles(name)

        if (!Translator.BetterBibLaTeX || !Translator.preferences.biblatexExtendedNameFormat) {
          if (!this.useprefix) this.useprefix = !!name['non-dropping-particle']
          if (!this.juniorcomma) this.juniorcomma = (f.juniorcomma && name['comma-suffix'])
        }

        if (Translator.BetterBibTeX) {
          name = this._enc_creators_bibtex(name)
        } else {
          name = this._enc_creators_biblatex(name)
        }

      } else {
        continue
      }

      encoded.push(name.trim())
    }

    return encoded.join(' and ')
  }

  /*
   * Encode text to LaTeX literal list (double-braced)
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_literal(f) {
    return this.enc_latex({value: new String(f.value)}) // tslint:disable-line:no-construct
  }

  /*
   * Encode text to LaTeX
   *
   * This encoding supports simple HTML markup.
   *
   * @param {field} field to encode.
   * @return {String} field.value encoded as author-style value
   */
  protected enc_latex(f, raw = false) {
    if (typeof f.value === 'number') return f.value
    if (!f.value) return null

    if (Array.isArray(f.value)) {
      if (f.value.length === 0) return null
      return f.value.map(function(word) { return this.enc_latex(this.clone(f, word), raw) }).join(f.sep || '')
    }

    if (f.raw || raw) return f.value

    const caseConversion = this.caseConversion[f.name] || f.caseConversion
    let value: String | string = text2latex(f.value, {mode: (f.html ? 'html' : 'text'), caseConversion: caseConversion && this.english})
    if (caseConversion && Translator.BetterBibTeX && !this.english) value = `{${value}}`

    if (f.value instanceof String) value = new String(`{${value}}`) // tslint:disable-line:no-construct
    return value
  }

  protected enc_tags(f) {
    let tags = f.value.filter(tag => tag !== Translator.preferences.rawLaTag)
    if (tags.length === 0) return null

    // sort tags for stable tests
    if (Translator.preferences.testing) tags.sort()

    tags = tags.map(tag => {
      if (Translator.BetterBibTeX) {
        tag = tag.replace(/([#\\%&])/g, '\\$1')
      } else {
        tag = tag.replace(/([#%\\])/g, '\\$1')
      }

      // the , -> ; is unfortunate, but I see no other way
      tag = tag.replace(/,/g, ';')

      // verbatim fields require balanced braces -- please just don't use braces in your tags
      let balanced = 0
      for (const ch of tag) {
        switch (ch) {
          case '{': balanced += 1; break
          case '}': balanced -= 1; break
        }
        if (balanced < 0) break
      }
      if (balanced !== 0) tag = tag.replace(/{/g, '(').replace(/}/g, ')')

      return tag
    })

    return tags.join(',')
  }

  protected enc_attachments(f) {
    if (!f.value || (f.value.length === 0)) return null
    const attachments = []
    const errors = []

    for (const attachment of f.value) {
      const att = {
        title: attachment.title,
        mimetype: attachment.contentType || '',
        path: attachment.defaultPath || attachment.localPath,
      }

      if (!att.path) continue // amazon/googlebooks etc links show up as atachments without a path
      // att.path = att.path.replace(/^storage:/, '')
      att.path = att.path.replace(/(?:\s*[{}]+)+\s*/g, ' ')

      if (Translator.options.exportFileData && attachment.saveFile && attachment.defaultPath) attachment.saveFile(att.path, true)

      if (!att.title) att.title = att.path.replace(/.*[\\\/]/, '') || 'attachment'

      if (!att.mimetype && (att.path.slice(-4).toLowerCase() === '.pdf')) att.mimetype = 'application/pdf' // tslint:disable-line:no-magic-numbers

      if (Translator.preferences.testing) {
        Exporter.attachmentCounter += 1
        att.path = `files/${Exporter.attachmentCounter}/${att.path.replace(/.*[\/\\]/, '')}`
      }

      attachments.push(att)
    }

    if (errors.length !== 0) f.errors = errors
    if (attachments.length === 0) return null

    // sort attachments for stable tests, and to make non-snapshots the default for JabRef to open (#355)
    attachments.sort((a, b) => {
      if ((a.mimetype === 'text/html') && (b.mimetype !== 'text/html')) return 1
      if ((b.mimetype === 'text/html') && (a.mimetype !== 'text/html')) return -1
      return a.path.localeCompare(b.path)
    })

    if (Translator.preferences.jabrefFormat) return attachments.map(att => [att.title, att.path, att.mimetype].map(part => part.replace(/([\\{}:;])/g, '\\$1')).join(':')).join(';')
    return attachments.map(att => att.path.replace(/([\\{};])/g, '\\$1')).join(';')
  }

  /*
   * Return a copy of the given `field` with a new value
   *
   * @param {field} field to be cloned
   * @param {value} value to be assigned
   * @return {Object} copy of field settings with new value
   */
  private clone(f, value) {
    const clone = JSON.parse(JSON.stringify(f))
    delete clone.bibtex
    clone.value = value
    return clone
  }

  private _enc_creators_pad_particle(particle, relax = false) {
    // space at end is always OK
    if (particle[particle.length - 1] === ' ') return particle

    if (Translator.BetterBibLaTeX) {
      if (Zotero.Utilities.XRegExp.test(particle, this.punctuationAtEnd)) this.data.DeclarePrefChars += particle[particle.length - 1]
      // if BBLT, always add a space if it isn't there
      return particle + ' '
    }

    // otherwise, we're in BBT.

    // If the particle ends in a period, add a space
    if (particle[particle.length - 1] === '.') return particle + ' '

    // if it ends in any other punctuation, it's probably something like d'Medici -- no space
    if (Zotero.Utilities.XRegExp.test(particle, this.punctuationAtEnd)) {
      if (relax) return `${particle}${this._enc_creators_relax_marker} `
      return particle
    }

    // otherwise, add a space
    return particle + ' '
  }

  private _enc_creators_biblatex(name) {
    let family, latex
    if ((name.family.length > 1) && (name.family[0] === '"') && (name.family[name.family.length - 1] === '"')) {
      family = new String(name.family.slice(1, -1)) // tslint:disable-line:no-construct
    } else {
      ({ family } = name)
    }

    let initials = (name.given || '').indexOf(this._enc_creators_initials_marker) // zero-width space

    if (Translator.preferences.biblatexExtendedNameFormat && (name['dropping-particle'] || name['non-dropping-particle'] || name['comma-suffix'])) {
      if (initials >= 0) {
        initials = name.given.substring(0, initials)
        if (initials.length > 1) initials = new String(initials) // tslint:disable-line:no-construct
        name.given = name.given.replace(this._enc_creators_initials_marker, '')
      } else {
        initials = ''
      }

      latex = []
      if (family) latex.push(`family=${this.enc_latex({value: family})}`)
      if (name.given) latex.push(`given=${this.enc_latex({value: name.given})}`)
      if (initials) latex.push(`given-i=${this.enc_latex({value: initials})}`)
      if (name.suffix) latex.push(`suffix=${this.enc_latex({value: name.suffix})}`)
      if (name['dropping-particle'] || name['non-dropping-particle']) {
        latex.push(`prefix=${this.enc_latex({value: name['dropping-particle'] || name['non-dropping-particle']})}`)
        latex.push(`useprefix=${!!name['non-dropping-particle']}`)
      }
      if (name['comma-suffix']) latex.push('juniorcomma=true')
      return latex.join(', ')
    }

    if (family && Zotero.Utilities.XRegExp.test(family, this.startsWithLowercase)) family = new String(family) // tslint:disable-line:no-construct

    if (family) family = this.enc_latex({value: family})

    if (initials >= 0) name.given = `<span relax="true">${name.given.replace(this._enc_creators_initials_marker, '</span>')}`

    latex = ''
    if (name['dropping-particle']) latex += this.enc_latex({value: this._enc_creators_pad_particle(name['dropping-particle'])})
    if (name['non-dropping-particle']) latex += this.enc_latex({value: this._enc_creators_pad_particle(name['non-dropping-particle'])})
    if (family) latex += family
    if (name.suffix) latex += `, ${this.enc_latex({value: name.suffix})}`
    if (name.given) latex += `, ${this.enc_latex({value: name.given})}`

    return latex
  }

  private _enc_creators_bibtex(name) {
    let family
    if ((name.family.length > 1) && (name.family[0] === '"') && (name.family[name.family.length - 1] === '"')) {
      family = new String(name.family.slice(1, -1)) // tslint:disable-line:no-construct
    } else {
      ({ family } = name)
    }

    if (name.given && (name.given.indexOf(this._enc_creators_initials_marker) >= 0)) { // zero-width space
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

    if (name['non-dropping-particle']) family = new String(this._enc_creators_pad_particle(name['non-dropping-particle']) + family) // tslint:disable-line:no-construct
    if (Zotero.Utilities.XRegExp.test(family, this.startsWithLowercase) || Zotero.Utilities.XRegExp.test(family, this.hasLowercaseWord)) family = new String(family) // tslint:disable-line:no-construct
    family = this.enc_latex({value: family})
    if (name['dropping-particle']) family = this.enc_latex({value: this._enc_creators_pad_particle(name['dropping-particle'], true)}) + family

    if (Translator.BetterBibTeX && Translator.preferences.bibtexParticleNoOp && (name['non-dropping-particle'] || name['dropping-particle'])) {
      family = `{\\noopsort{${this.enc_latex({value: name.family.toLowerCase()})}}}${family}`
      Exporter.preamble.noopsort = true
    }

    if (name.given) name.given = this.enc_latex({value: name.given})
    if (name.suffix) name.suffix = this.enc_latex({value: name.suffix})

    let latex = family
    if (name.suffix) latex += `, ${name.suffix}`
    if (name.given) latex += `, ${name.given}`

    return latex
  }

  private isodate(date) {
    if (!date || !date.year || !['date', 'season'].includes(date.type)) return null

    let iso = `${date.year}`
    if (date.month) {
      iso += `-${(`0${date.month}`).slice(-2)}` // tslint:disable-line:no-magic-numbers
      if (date.day) iso += `-${(`0${date.day}`).slice(-2)}` // tslint:disable-line:no-magic-numbers
    }
    return iso
  }

  private postscript(reference, item) {} // tslint:disable-line:no-empty

  private toVerbatim(text) {
    let value
    if (Translator.BetterBibTeX) {
      value = (`${text}`).replace(/([#\\%&{}])/g, '\\$1')
    } else {
      value = (`${text}`).replace(/([\\{}])/g, '\\$1')
    }
    if (!Translator.unicode) value = value.replace(/[^\x21-\x7E]/g, (chr => `\\%${`00${chr.charCodeAt(0).toString(16).slice(-2)}`}`)) // tslint:disable-line:no-magic-numbers
    return value
  }

  private qualityReport() {
    if (!Translator.preferences.qualityReport) return ''

    let report = this.lint({
      timestamp: `added because JabRef format is set to ${Translator.preferences.jabrefFormat || '?'}`,
    })

    if (report) {
      if (this.has.journal && this.has.journal.value.indexOf('.') >= 0) report.push(`? Possibly abbreviated journal title ${this.has.journal.value}`)
      if (this.has.journaltitle && this.has.journaltitle.value.indexOf('.') >= 0) report.push(`? Possibly abbreviated journal title ${this.has.journaltitle.value}`)

      if (this.referencetype === 'inproceedings' && this.has.booktitle) {
        if (!this.has.booktitle.value.match(/:|Proceedings|Companion| '/) || this.has.booktitle.value.match(/\.|workshop|conference|symposium/)) {
          report.push('? Unsure about the formatting of the booktitle')
        }
      }

      if (this.has.title && !Translator.preferences.suppressTitleCase) {
        const titleCased = Zotero.BetterBibTeX.titleCase(this.has.title.value) === this.has.title.value
        if (this.has.title.value.match(/\s/)) {
          if (titleCased) report.push('? Title looks like it was stored in title-case in Zotero')
        } else {
          if (!titleCased) report.push('? Title looks like it was stored in lower-case in Zotero')
        }
      }
    } else {
      report = [`I don't know how to quality-check ${this.referencetype} references`]
    }

    if (!report.length) return ''

    report.unshift(`== ${Translator.BetterBibTeX ? 'BibTeX' : 'BibLateX'} quality report for ${this.item.citekey}:`)

    return report.map(line => `% ${line}\n`).join('')
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
