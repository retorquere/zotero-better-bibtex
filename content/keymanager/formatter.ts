declare const Zotero: any
declare const Node: any
declare const Components: any

import flash = require('../flash.ts')
import Prefs = require('../prefs.ts')
import debug = require('../debug.ts')

const parser = require('./formatter.pegjs')
import DateParser = require('../dateparser.ts')
const { transliterate } = require('transliteration')
const fold2ascii = require('fold-to-ascii').fold
import PunyCode = require('punycode')
import JournalAbbrev = require('../journal-abbrev.ts')

export = new class PatternFormatter {
  public generate: Function

  private re = {
    unsafechars: Zotero.Utilities.XRegExp('[^-\\p{L}0-9_!$*+./;?\\[\\]]'),
    alphanum: Zotero.Utilities.XRegExp('[^\\p{L}\\p{N}]'),
    punct: Zotero.Utilities.XRegExp('\\p{Pc}|\\p{Pd}|\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    word: Zotero.Utilities.XRegExp('[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*', 'g'),
    zotero: {
      number: /^[0-9]+/,
      citeKeyTitleBanned: /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span)>)/g,
      // citeKeyConversion: /%([a-zA-Z])/,
      citeKeyClean: /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g,
    },
  }

  /*
   * three-letter month abbreviations. I assume these are the same ones that the
   * docs say are defined in some appendix of the LaTeX book. (I don't have the
   * LaTeX book.)
  */
  private months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

  // tslint:disable-next-line:variable-name
  private DOMParser = Components.classes['@mozilla.org/xmlextras/domparser;1'].createInstance(Components.interfaces.nsIDOMParser)

  private item: any

  private skipWords: Set<string>

  private fold: boolean
  private citekeyFormat: string

  constructor() {
    this.update()
  }

  public update() {
    debug('PatternFormatter.update:')
    this.skipWords = new Set(Prefs.get('skipWords').split(',').map(word => word.trim()).filter(word => word))
    this.fold = Prefs.get('citekeyFold')

    for (const attempt of ['get', 'reset']) {
      if (attempt === 'reset') {
        debug(`PatternFormatter.update: malformed citekeyFormat '${this.citekeyFormat}', resetting to default`)
        flash(`Malformed citation pattern '${this.citekeyFormat}', resetting to default`)
        Prefs.clear('citekeyFormat')
      }
      this.citekeyFormat = Prefs.get('citekeyFormat')

      try {
        debug(`PatternFormatter.update: trying citekeyFormat ${this.citekeyFormat}...`)
        this.generate = new Function(this.parsePattern(this.citekeyFormat))
        break
      } catch (err) {
        debug('PatternFormatter.update: Error parsing citekeyFormat ', {pattern: this.citekeyFormat}, err)
      }
    }

    debug('PatternFormatter.update: citekeyFormat=', this.citekeyFormat, `${this.generate}`)
  }

  public parsePattern(pattern) { return parser.parse(pattern, PatternFormatter.prototype) }

  public format(item) {
    this.item = {
      item,
      type: Zotero.ItemTypes.getName(item.itemTypeID),
    }
    if (['attachment', 'note'].includes(this.item.type)) return {}

    try {
      this.item.date = item.getField('date', false, true)
    } catch (error) {}
    try {
      this.item.title = item.getField('title', false, true)
    } catch (error1) {}

    if (this.item.date) {
      let date = DateParser.parse(this.item.date)
      if (date.type === 'list') date = date.dates[0]
      if (date.type === 'interval') date = date.from || date.to

      switch ((date ? date.type : undefined) || 'verbatim') {
        case 'verbatim':
          // strToDate is a lot less accurate than the BBT+EDTF dateparser, but it sometimes extracts year-ish things that
          // ours doesn't
          date = Zotero.Date.strToDate(this.item.date)

          this.item.year = parseInt(date.year)
          if (isNaN(this.item.year)) delete this.item.year
          if (!this.item.year) this.item.year = this.item.date

          this.item.month = parseInt(date.month)
          if (isNaN(this.item.month)) delete this.item.month
          break

        case 'date':
          this.item.origyear = (date.orig ? date.orig.year : undefined) || date.year
          this.item.year = date.year || this.item.origyear

          this.item.month = date.month
          break

        case 'season':
          this.item.year = date.year
          break

        default:
          throw new Error(`Unexpected parsed date ${JSON.stringify(date)}`)
      }
    }

    const citekey = this.generate()

    if (!citekey.citekey) citekey.citekey = `zotero-${item.id}`
    if (citekey.citekey && this.fold) citekey.citekey = this.removeDiacritics(citekey.citekey)
    return citekey
  }

  // methods
  protected $zotero() {
    let key = ''
    const creator = (this.item.item.getCreators() || [])[0]

    if (creator && creator.lastName) key += creator.lastName.toLowerCase().replace(RegExp(' ', 'g'), '_').replace(/,/g, '')

    key += '_'

    if (this.item.title) {
      key += this.item.title.toLowerCase().replace(this.re.zotero.citeKeyTitleBanned, '').split(/\s+/g)[0]
    }

    key += '_'

    let year = '????'
    if (this.item.date) {
      const date = Zotero.Date.strToDate(this.item.date)
      if (date.year && this.re.zotero.number.test(date.year)) year = date.year
    }
    key += year

    key = Zotero.Utilities.removeDiacritics(key.toLowerCase(), true)
    return key.replace(this.re.zotero.citeKeyClean, '')
  }

  protected $property(name) {
    try {
      return this.innerText(this.item.item.getField(name, false, true) || '')
    } catch (err) {}

    try {
      return this.innerText(this.item.item.getField(name[0].toLowerCase() + name.slice(1), false, true) || '')
    } catch (err) {}

    return ''
  }

  protected $library() {
    if (this.item.item.libraryID === Zotero.Libraries.userLibraryID) return ''
    return Zotero.Libraries.getName(this.item.item.libraryID)
  }

  protected $auth(onlyEditors, withInitials, n, m) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    let author = authors[m || 0]
    if (author && n) author = author.substring(0, n)
    return author || ''
  }

  protected $authForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[0]
  }

  protected $authorLastForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  protected $authorLast(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  protected $journal() { return JournalAbbrev.get(this.item.item, true) || this.item.item.getField('publicationTitle', false, true) }

  protected $authors(onlyEditors, withInitials, n) {
    let authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    if (n) {
      const etal = authors.length > n
      authors = authors.slice(0, n)
      if (etal) authors.push('EtAl')
    }

    return authors.join('')
  }

  protected $authorsAlpha(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    switch (authors.length) {
      case 1: // tslint:disable-line:no-magic-numbers
        return authors[0].substring(0, 3) // tslint:disable-line:no-magic-numbers

      case 2: // tslint:disable-line:no-magic-numbers
      case 3: // tslint:disable-line:no-magic-numbers
      case 4: // tslint:disable-line:no-magic-numbers
        return authors.map(author => author.substring(0, 1)).join('')

      default:
        // tslint:disable-next-line:no-magic-numbers
        return authors.slice(0, 3).map(author => author.substring(0, 1)).join('') + '+'
    }
  }

  protected $authIni(onlyEditors, withInitials, n) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors.map(author => author.substring(0, n)).join('.')
  }

  protected $authorIni(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    const firstAuthor = authors.shift()

    // tslint:disable-next-line:no-magic-numbers
    return [firstAuthor.substring(0, 5)].concat(authors.map(auth => auth.map(name => name.substring(0, 1)).join('.'))).join('.')
  }

  protected $auth_auth_ea(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    return authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join('.')
  }

  protected $authEtAl(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join('')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join('')
  }

  protected $auth_etal(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join('.')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join('.')
  }

  protected $authshort(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    switch (authors.length) {
      case 0:
        return ''

      case 1:
        return authors[0]

      default:
        // tslint:disable-next-line:no-magic-numbers
        return authors.map(author => author.substring(0, 1)).join('.') + (authors.length > 3 ? '+' : '')
    }
  }

  protected $firstpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    let firstpage = ''
    this.item.pages.replace(/^([0-9]+)/g, (match, fp) => firstpage = fp)
    return firstpage
  }

  protected $lastpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    let lastpage = ''
    this.item.pages.replace(/([0-9]+)[^0-9]*$/g, (match, lp) => lastpage = lp)
    return lastpage
  }

  protected $keyword(n) {
    this.item.tags = this.item.tags || this.item.item.getTags().map(tag => tag.tag)
    return this.item.tags[n] || ''
  }

  protected $shorttitle() {
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''

    // tslint:disable-next-line:no-magic-numbers
    return words.slice(0, 3).join('')
  }

  protected $veryshorttitle() {
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''
    return words.slice(0, 1).join('')
  }

  protected $shortyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 2)
  }

  protected $year() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 4)
  }

  protected $origyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.origyear, 4)
  }

  protected $month() {
    if (!this.item.month) return ''
    return this.months[this.item.month - 1] || ''
  }

  protected $title() { return this.titleWords(this.item.title).join('') }

  // filters
  protected _condense(value, sep) {
    return (value || '').replace(/\s/g, sep || '')
  }

  protected _prefix(value, prefix) {
    value = value || ''
    if (value && prefix) return `${prefix}${value}`
    return value
  }

  protected _postfix(value, postfix) {
    value = value || ''
    if (value && postfix) return `${value}${postfix}`
    return value
  }

  protected _abbr(value) {
    return (value || '').split(/\s+/).map(word => word.substring(0, 1)).join('')
  }

  protected _lower(value) {
    return (value || '').toLowerCase()
  }

  protected _upper(value) {
    return (value || '').toUpperCase()
  }

  protected _skipwords(value) {
    return (value || '').split(/\s+/).filter(word => !this.skipWords.has(word.toLowerCase())).join(' ').trim()
  }

  protected _select(value, start, n) {
    value = (value || '').split(/\s+/)
    let end = value.length

    if (typeof start === 'undefined') start = 1
    start = parseInt(start) - 1
    if (typeof n !== 'undefined') end = start + parseInt(n)
    return value.slice(start, end).join(' ')
  }

  protected _substring(value, start, n) {
    return (value || '').slice(start - 1, (start - 1) + n)
  }

  protected _ascii(value) {
    return (value || '').replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()
  }

  protected _alphanum(value) {
    return Zotero.Utilities.XRegExp.replace(value || '', this.re.alphanum, '', 'all').split(/\s+/).join(' ').trim()
  }

  protected _fold(value) {
    return this.removeDiacritics(value).split(/\s+/).join(' ').trim()
  }

  protected _capitalize(value) {
    return (value || '').replace(/((^|\s)[a-z])/g, m => m.toUpperCase())
  }

  protected _nopunct(value) {
    return Zotero.Utilities.XRegExp.replace(value || '', this.re.punct, '', 'all')
  }

  private removeDiacritics(str) {
    str = transliterate(str || '')
    str = fold2ascii(str)
    return str
  }
  private clean(str) {
    return this.safechars(this.removeDiacritics(str)).trim()
  }

  private safechars(str) {
    return Zotero.Utilities.XRegExp.replace(str, this.re.unsafechars, '', 'all')
  }

  private words(str) {
    // 551
    return (Zotero.Utilities.XRegExp.matchChain(this.innerText(str), [this.re.word]).filter(word => word !== '').map(word => this.clean(word).replace(/-/g, '')))
  }

  private padYear(year, length) {
    let prefix
    if (typeof year === 'string') return year
    if (typeof year !== 'number') return ''

    // don't pad to pass the tests
    // tslint:disable-next-line:no-magic-numbers
    if (length !== 2) return `${year}`

    if (year < 0) {
      prefix = '-'
      year = -year
    } else {
      prefix = ''
    }

    return prefix + (`0000${year}`).slice(-length)
  }

  private titleWords(title, options: { asciiOnly?: boolean, skipWords?: boolean} = {}) {
    if (!title) return null
    let words = this.words(title)

    if (options.asciiOnly) words = words.map(word => word.replace(/[^ -~]/g, ''))
    words = words.filter(word => word)
    if (options.skipWords) words = words.filter(word => !this.skipWords.has(word.toLowerCase()) && PunyCode.ucs2.decode(word).length > 1)
    if (words.length === 0) return null
    return words
  }

  private innerText(str) {
    if (!str) return ''
    let doc = this.DOMParser.parseFromString(`<span>${str}</span>`, 'text/html')
    if (doc.nodeType === Node.DOCUMENT_NODE) doc = doc.documentElement
    return doc.textContent
  }

  private initial(creator) {
    if (!creator.firstName) return ''

    let initial, m
    if (m = creator.firstName.match(/(.+)\u0097/)) {
      initial = m[1]
    } else {
      initial = creator.firstName[0]
    }

    return this.removeDiacritics(initial)
  }

  private creators(onlyEditors, options: { initialOnly?: boolean, withInitials?: boolean} = {}) {
    if (!this.item.creators) {
      let types = Zotero.CreatorTypes.getTypesForItemType(this.item.item.itemTypeID)
      types = types.reduce((map, type) => { map[type.name] = type.id; return map }, {})
      const primary = Zotero.CreatorTypes.getPrimaryIDForType(this.item.item.itemTypeID)

      this.item.creators = {}

      for (const creator of this.item.item.getCreators()) {
        if (onlyEditors && ![types.editor, types.seriesEditor].includes(creator.creatorTypeID)) continue

        let name = options.initialOnly ? this.initial(creator) : this.innerText(creator.lastName)
        if (name) {
          if (options.withInitials && creator.firstName) {
            let initials = Zotero.Utilities.XRegExp.replace(creator.firstName, this.re.caseNotUpperTitle, '', 'all')
            initials = this.removeDiacritics(initials)
            initials = Zotero.Utilities.XRegExp.replace(initials, this.re.caseNotUpper, '', 'all')
            name += initials
          }
        } else {
          name = this.innerText(creator.firstName)
        }

        if (!name) continue

        switch (creator.creatorTypeID) {
          case types.editor:
          case types.seriesEditor:
            this.item.creators.editors = this.item.creators.editors || []
            this.item.creators.editors.push(name)
            break

          case types.translator:
            this.item.creators.translators = this.item.creators.translators || []
            this.item.creators.translators.push(name)
            break

          case primary:
            this.item.creators.authors = this.item.creators.authors || []
            this.item.creators.authors.push(name)
            break

          default:
            this.item.creators.collaborators = this.item.creators.collaborators || []
            this.item.creators.collaborators.push(name)
        }
      }
    }

    if (onlyEditors) return this.item.creators.editors || []
    return this.item.creators.authors || this.item.creators.editors || this.item.creators.translators || this.item.creators.collaborators || []
  }
}
