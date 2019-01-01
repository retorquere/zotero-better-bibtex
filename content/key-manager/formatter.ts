declare const Zotero: any
declare const Node: any
declare const Components: any

import { flash } from '../flash'
import { Preferences as Prefs } from '../prefs'
import * as log from '../debug'
import { JournalAbbrev } from '../journal-abbrev'
import { kuroshiro } from './kuroshiro'

const parser = require('./formatter.pegjs')
import * as DateParser from '../dateparser'
const { transliterate } = require('transliteration')
const fold2ascii = require('fold-to-ascii').fold
import PunyCode = require('punycode')

class PatternFormatter {
  public generate: Function

  public itemTypes: Set<string>

  private re = {
    unsafechars: Zotero.Utilities.XRegExp('[^-\\p{L}0-9_!$*+./;\\[\\]]'),
    alphanum: Zotero.Utilities.XRegExp('[^\\p{L}\\p{N}]'),
    punct: Zotero.Utilities.XRegExp('\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    dash: Zotero.Utilities.XRegExp('(\\p{Pc}|\\p{Pd})+', 'g'),
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    word: Zotero.Utilities.XRegExp('[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*', 'g'),
    zotero: {
      number: /^[0-9]+/,
      citeKeyTitleBanned: /\b(a|an|the|some|from|on|in|to|of|do|with|der|die|das|ein|eine|einer|eines|einem|einen|un|une|la|le|l\'|el|las|los|al|uno|una|unos|unas|de|des|del|d\')(\s+|\b)|(<\/?(i|b|sup|sub|sc|span style=\"small-caps\"|span)>)/g,

      // citeKeyConversion: /%([a-zA-Z])/,
      citeKeyClean: /[^a-z0-9\!\$\&\*\+\-\.\/\:\;\<\>\?\[\]\^\_\`\|]+/g,
    },
  }
  private language = {
    jp: 'japanese',
    japanese: 'japanese',
    de: 'german',
    german: 'german',
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

  public init(itemTypes) {
    this.itemTypes = itemTypes
    log.debug('Formatter.itemTypes = ', Array.from(itemTypes))
  }

  public update(reason) {
    if (!this.itemTypes) throw new Error('PatternFormatter.update called before init')

    log.debug('PatternFormatter.update:', reason)
    this.skipWords = new Set(Prefs.get('skipWords').split(',').map(word => word.trim()).filter(word => word))
    this.fold = Prefs.get('citekeyFold')

    for (const attempt of ['get', 'reset']) {
      if (attempt === 'reset') {
        log.debug(`PatternFormatter.update: malformed citekeyFormat '${this.citekeyFormat}', resetting to default`)
        flash(`Malformed citation pattern '${this.citekeyFormat}', resetting to default`)
        Prefs.clear('citekeyFormat')
      }

      // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
      this.citekeyFormat = (Prefs.get('citekeyFormat') || Prefs.clear('citekeyFormat')).replace(/^\u200B/, '')

      try {
        log.debug(`PatternFormatter.update: trying citekeyFormat ${this.citekeyFormat}...`)
        this.generate = new Function(this.parsePattern(this.citekeyFormat))
        break
      } catch (err) {
        log.error('PatternFormatter.update: Error parsing citekeyFormat ', {pattern: this.citekeyFormat}, err)
      }
    }

    log.debug('PatternFormatter.update: citekeyFormat=', this.citekeyFormat, `${this.generate}`)
  }

  public parsePattern(pattern) { return parser.parse(pattern, this) }

  public format(item) {
    this.item = {
      item,
      type: Zotero.ItemTypes.getName(item.itemTypeID),
      language: this.language[(item.getField('language') || '').toLowerCase()] || '',
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

  /** Generates citation keys as the stock Zotero Bib(La)TeX export does */
  public $zotero() {
    let key = ''
    const creator = (this.item.item.getCreators() || [])[0]

    if (creator && creator.lastName) {
      key += creator.lastName.toLowerCase().replace(/ /g, '_').replace(/,/g, '')
    } else {
      key += 'noauthor'
    }

    key += '_'

    if (this.item.title) {
      key += this.item.title.toLowerCase().replace(this.re.zotero.citeKeyTitleBanned, '').split(/\s+/g)[0]
    } else {
      key += 'notitle'
    }

    key += '_'

    let year = 'nodate'
    if (this.item.date) {
      const date = Zotero.Date.strToDate(this.item.date)
      if (date.year && this.re.zotero.number.test(date.year)) year = date.year
    }
    key += year

    key = Zotero.Utilities.removeDiacritics(key.toLowerCase(), true)
    return key.replace(this.re.zotero.citeKeyClean, '')
  }

  public $property(name) {
    try {
      return this.innerText(this.item.item.getField(name, false, true) || '')
    } catch (err) {}

    try {
      return this.innerText(this.item.item.getField(name[0].toLowerCase() + name.slice(1), false, true) || '')
    } catch (err) {}

    return ''
  }

  /** returns the name of the shared group library, or nothing if the reference is in your personal library */
  public $library() {
    if (this.item.item.libraryID === Zotero.Libraries.userLibraryID) return ''
    return Zotero.Libraries.get(this.item.item.libraryID).name
  }

  /** The first `N` (default: all) characters of the `M`th (default: first) author's last name. */
  public $auth(onlyEditors, withInitials, joiner, n, m) {
    const authors = this.creators(onlyEditors, {withInitials})
    log.debug('$auth:', { onlyEditors, withInitials, n, m, authors })
    if (!authors || !authors.length) return ''
    let author = authors[m ? m - 1 : 0]
    if (author && n) author = author.substring(0, n)
    return author || ''
  }

  /** The forename initial of the first author. */
  public $authForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[0]
  }

  /** The forename initial of the last author. */
  public $authorLastForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  /** The last name of the last author */
  public $authorLast(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  /** returns the journal abbreviation, or, if not found, the journal title, If 'automatic journal abbreviation' is enabled in the BBT settings,
   * it will use the same abbreviation filter Zotero uses in the wordprocessor integration. You might want to use the `abbr` filter on this.
   */
  public $journal() { return JournalAbbrev.get(this.item.item, true) || this.item.item.getField('publicationTitle', false, true) }

  /** The last name of up to N authors. If there are more authors, "EtAl" is appended. */
  public $authors(onlyEditors, withInitials, joiner, n) {
    let authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    if (n) {
      const etal = authors.length > n
      authors = authors.slice(0, n)
      if (etal) authors.push('EtAl')
    }

    return authors.join('')
  }

  /** Corresponds to the BibTeX style "alpha". One author: First three letters of the last name. Two to four authors: First letters of last names concatenated.
   * More than four authors: First letters of last names of first three authors concatenated. "+" at the end.
   */
  public $authorsAlpha(onlyEditors, withInitials, joiner) {
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

  /** The beginning of each author's last name, using no more than `N` characters. */
  public $authIni(onlyEditors, withInitials, joiner, n) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors.map(author => author.substring(0, n)).join('.')
  }

  /** The first 5 characters of the first author's last name, and the last name initials of the remaining authors. */
  public $authorIni(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    const firstAuthor = authors.shift()

    // tslint:disable-next-line:no-magic-numbers
    return [firstAuthor.substring(0, 5)].concat(authors.map(auth => auth.map(name => name.substring(0, 1)).join('.'))).join('.')
  }

  /** The last name of the first two authors, and ".ea" if there are more than two. */
  public $auth_auth_ea(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    return authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join(joiner || '.')
  }

  /** The last name of the first author, and the last name of the second author if there are two authors or "EtAl" if there are more than two. This is similar to `auth.etal`. The difference is that the authors are not separated by "." and in case of more than 2 authors "EtAl" instead of ".etal" is appended. */
  public $authEtAl(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join(joiner || '')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join(joiner || '')
  }

  /** The last name of the first author, and the last name of the second author if there are two authors or ".etal" if there are more than two. */
  public $auth_etal(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    log.debug('auth_etal', {onlyEditors, withInitials, joiner, authors: authors.join(joiner || '.') })
    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join(joiner || '.')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join(joiner || '.')
  }

  /** The last name if one author is given; the first character of up to three authors' last names if more than one author is given. A plus character is added, if there are more than three authors. */
  public $authshort(onlyEditors, withInitials, joiner) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    switch (authors.length) {
      case 0:
        return ''

      case 1:
        return authors[0]

      default:
        // tslint:disable-next-line:no-magic-numbers
        return authors.slice(0, 3).map(author => author.substring(0, 1)).join('.') + (authors.length > 3 ? '+' : '')
    }
  }

  /** The number of the first page of the publication (Caution: this will return the lowest number found in the pages field, since BibTeX allows `7,41,73--97` or `43+`.) */
  public $firstpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    const firstpage = []
    this.item.pages.replace(/^([0-9]+)/g, (match, fp) => firstpage.push(parseInt(fp)))
    firstpage.sort()
    return firstpage[0] || ''
  }

  /** The number of the last page of the publication (See the remark on `firstpage`) */
  public $lastpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    const lastpage = []
    this.item.pages.replace(/^([0-9]+)/g, (match, fp) => lastpage.push(parseInt(fp)))
    lastpage.sort()
    lastpage.reverse()
    return lastpage[0] || ''
  }

  /** Tag number `N`. Note that the tag order is just as Zotero hands it to BBT -- no guarantees */
  public $keyword(n) {
    this.item.tags = this.item.tags || this.item.item.getTags().map(tag => tag.tag)
    return this.item.tags[n] || ''
  }

  /* internal alphanumeric zotero item key
  public $key() {
    return this.item.item.key
  }
  */

  /** The first `N` (default: 3) words of the title, first `M` (default: 0) capitalized */
  public $shorttitle(n = 3, m = 0) { // tslint:disable-line:no-magic-numbers
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''

    return words.slice(0, n).map((word, i) => i < m ? word.charAt(0).toUpperCase() + word.slice(1) : word).join('')
  }

  /** The first `N` (default: 1) words of the title, first `M` (default: 0) capitalized */
  public $veryshorttitle(n = 1, m = 0) { // tslint:disable-line:no-magic-numbers
    return this.$shorttitle(n, m)
  }

  /** The last 2 digits of the publication year */
  public $shortyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 2)
  }

  /** The year of the publication */
  public $year() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 4)
  }

  /** the original year of the publication */
  public $origyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.origyear, 4)
  }

  /** the month of the publication */
  public $month() {
    if (!this.item.month) return ''
    return this.months[this.item.month - 1] || ''
  }

  /** Capitalize all the significant words of the title, and concatenate them. For example, `An awesome paper on JabRef` will become `AnAwesomePaperonJabref` */
  public $title() { return (this.titleWords(this.item.title) || []).join('') }

  /** replaces text, case insensitive; `:replace=.etal,&etal` will replace `.EtAl` with `&etal` */
  public _replace(value, find, replace) {
    if (!find || !replace) return (value || '')
    return (value || '').replace(new RegExp(find.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&'), 'ig'), replace)
  }

  /**
   * this replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
   * parameter, e.g `condense=_` will replace spaces with underscores. **Parameters should not contain spaces** unless
   * you want the spaces in the value passed in to be replaced with those spaces in the parameter
   */
  public _condense(value, sep) {
    return (value || '').replace(/\s/g, sep || '')
  }

  /**
   * prefixes with its parameter, so `prefix=_` will add an underscore to the front if, and only if, the value
   * it is supposed to prefix isn't empty. If you want to use a reserved character (such as `:` or `\`), you'll need to
   * add a backslash (`\`) in front of it.
   */
  public _prefix(value, prefix) {
    value = value || ''
    if (value && prefix) return `${prefix}${value}`
    return value
  }

  /**
   * postfixes with its parameter, so `postfix=_` will add an underscore to the end if, and only if, the value
   * it is supposed to postfix isn't empty
   */
  public _postfix(value, postfix) {
    value = value || ''
    if (value && postfix) return `${value}${postfix}`
    return value
  }

  /** Abbreviates the text. Only the first character and subsequent characters following white space will be included. */
  public _abbr(value) {
    return (value || '').split(/\s+/).map(word => word.substring(0, 1)).join('')
  }

  /** Forces the text inserted by the field marker to be in lowercase. For example, `[auth:lower]` expands the last name of the first author in lowercase. */
  public _lower(value) {
    return (value || '').toLowerCase()
  }

  /** Forces the text inserted by the field marker to be in uppercase. For example, `[auth:upper]` expands the last name of the first author in uppercase. */
  public _upper(value) {
    return (value || '').toUpperCase()
  }

  /**
   * filters out common words like 'of', 'the', ... the list of words can be seen and changed by going into
   * `about:config` under the key `extensions.zotero.translators.better-bibtex.skipWords` as a comma-separated,
   * case-insensitive list of words.
   *
   * If you want to strip words like 'Jr.' from names, you could use something like `[Auth:nopunct:skipwords:fold]`
   * after adding `jr` to the skipWords list.
   * Note that this filter is always applied if you use `title` (which is different from `Title`) or `shorttitle`.
   */
  public _skipwords(value) {
    return (value || '').split(/\s+/).filter(word => !this.skipWords.has(word.toLowerCase())).join(' ').trim()
  }

  /**
   * selects words from the value passed in. The format is `select=start,number` (1-based), so `select=1,4`
   * would select the first four words. If `number` is not given, all words from `start` to the end of the list are
   * selected. It is important to note that `select' works only on values that have the words separated by whitespace,
   * so the caveat below applies.
   */
  public _select(value, start, n) {
    value = (value || '').split(/\s+/)
    let end = value.length

    if (typeof start === 'undefined') start = 1
    start = parseInt(start) - 1
    if (typeof n !== 'undefined') end = start + parseInt(n)
    return value.slice(start, end).join(' ')
  }

  /** (`substring=start,n`) selects `n` (default: all) characters starting at `start` (default: 1) */
  public _substring(value, start, n) {
    start = parseInt(start)
    if (isNaN(start)) start = 1
    n = parseInt(n)
    if (isNaN(n)) n = value.length

    return (value || '').slice(parseInt(start) - 1, (start - 1) + n)
  }

  /** removes all non-ascii characters */
  public _ascii(value) {
    return (value || '').replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()
  }

  /** clears out everything but unicode alphanumeric characters (unicode character classes `L` and `N`) */
  public _alphanum(value) {
    return Zotero.Utilities.XRegExp.replace(value || '', this.re.alphanum, '', 'all').split(/\s+/).join(' ').trim()
  }

  /** tries to replace diacritics with ascii look-alikes. Removes non-ascii characters it cannot match */
  public _fold(value, mode?: string) {
    return this.removeDiacritics(value, mode).split(/\s+/).join(' ').trim()
  }

  /** uppercases the first letter of each word */
  public _capitalize(value) {
    return (value || '').replace(/((^|\s)[a-z])/g, m => m.toUpperCase())
  }

  /** Removes punctuation */
  public _nopunct(value) {
    value = value || ''
    value = Zotero.Utilities.XRegExp.replace(value, this.re.dash, '-', 'all')
    value = Zotero.Utilities.XRegExp.replace(value, this.re.punct, '', 'all')
    return value
  }

  /** Removes punctuation and word-connecting dashes */
  public _nopunctordash(value) {
    value = value || ''
    value = Zotero.Utilities.XRegExp.replace(value, this.re.dash, '', 'all')
    value = Zotero.Utilities.XRegExp.replace(value, this.re.punct, '', 'all')
    return value
  }

  /** transliterates the citation keys and removes unsafe characters */
  public _clean(value) {
    if (!value) return ''
    return this.clean(value)
  }

  private removeDiacritics(str, mode?: string) {
    mode = mode || this.item.language

    if (mode === 'japanese') mode = null
    const replace = {
      german: {
        '\u00E4': 'ae', // tslint:disable-line:object-literal-key-quotes
        '\u00F6': 'oe', // tslint:disable-line:object-literal-key-quotes
        '\u00FC': 'ue', // tslint:disable-line:object-literal-key-quotes
        '\u00C4': 'Ae', // tslint:disable-line:object-literal-key-quotes
        '\u00D6': 'Oe', // tslint:disable-line:object-literal-key-quotes
        '\u00DC': 'Ue', // tslint:disable-line:object-literal-key-quotes
      },
    }[mode]
    if (mode && !replace) throw new Error(`Unsupported fold mode "${mode}"`)

    if (kuroshiro.enabled) str = kuroshiro.convert(str, {to: 'romaji'})
    str = transliterate(str || '', {
      unknown: '\uFFFD', // unicode replacement char
      replace,
    })

    str = fold2ascii(str)

    return str
  }
  private clean(str) {
    return this.safechars(this.removeDiacritics(str)).trim()
  }

  private safechars(str) {
    return Zotero.Utilities.XRegExp.replace(str, this.re.unsafechars, '', 'all')
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

    title = this.innerText(title)
    if (options.asciiOnly && kuroshiro.enabled) title = kuroshiro.convert(title, {to: 'romaji', mode: 'spaced'})

    // 551
    let words = (Zotero.Utilities.XRegExp.matchChain(title, [this.re.word]).map(word => this.clean(word).replace(/-/g, '')))

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

  private stripQuotes(name) {
    if (!name) return ''
    if (name.length >= 2 && name[0] === '"' && name[name.length - 1] === '"') return name.slice(1, -1)
    return name
  }

  private initial(creator) {
    if (!creator.firstName) return ''

    const firstName = this.stripQuotes(creator.firstName)

    let initial, m
    if (m = firstName.match(/(.+)\u0097/)) {
      initial = m[1]
    } else {
      initial = firstName[0]
    }

    return this.removeDiacritics(initial)
  }

  private creators(onlyEditors, options: { initialOnly?: boolean, withInitials?: boolean} = {}) {
    const format = `creators${options.initialOnly ? '_io' : ''}${options.initialOnly ? '_wi' : ''}`
    let creators = this.item[format]
    if (!creators) {
      let types = Zotero.CreatorTypes.getTypesForItemType(this.item.item.itemTypeID)
      types = types.reduce((map, type) => { map[type.name] = type.id; return map }, {})
      const primary = Zotero.CreatorTypes.getPrimaryIDForType(this.item.item.itemTypeID)

      creators = this.item[format] = {}

      for (const creator of this.item.item.getCreators()) {
        if (onlyEditors && ![types.editor, types.seriesEditor].includes(creator.creatorTypeID)) continue

        let name = options.initialOnly ? this.initial(creator) : this.stripQuotes(this.innerText(creator.lastName))
        if (name) {
          if (options.withInitials && creator.firstName) {
            let initials = Zotero.Utilities.XRegExp.replace(this.stripQuotes(creator.firstName), this.re.caseNotUpperTitle, '', 'all')
            initials = this.removeDiacritics(initials)
            initials = Zotero.Utilities.XRegExp.replace(initials, this.re.caseNotUpper, '', 'all')
            name += initials
          }
        } else {
          name = this.stripQuotes(this.innerText(creator.firstName))
        }

        if (!name) continue

        switch (creator.creatorTypeID) {
          case types.editor:
          case types.seriesEditor:
            creators.editors = creators.editors || []
            creators.editors.push(name)
            break

          case types.translator:
            creators.translators = creators.translators || []
            creators.translators.push(name)
            break

          case primary:
            creators.authors = creators.authors || []
            creators.authors.push(name)
            break

          default:
            creators.collaborators = creators.collaborators || []
            creators.collaborators.push(name)
        }
      }
    }

    if (onlyEditors) return creators.editors || []
    return creators.authors || creators.editors || creators.translators || creators.collaborators || []
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Formatter = new PatternFormatter // tslint:disable-line:variable-name
