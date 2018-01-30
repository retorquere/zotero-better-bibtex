declare const Zotero: any
declare const Node: any
declare const Components: any

import { flash } from '../flash.ts'
import { Preferences as Prefs } from '../prefs.ts'
import { debug } from '../debug.ts'

const parser = require('./formatter.pegjs')
import * as DateParser from '../dateparser.ts'
const { transliterate } = require('transliteration')
const fold2ascii = require('fold-to-ascii').fold
import PunyCode = require('punycode')
import { JournalAbbrev } from '../journal-abbrev.ts'

class PatternFormatter {
  public generate: Function

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

    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    if (citekey.citekey[0] === '\u200B') citekey.citekey = citekey.citekey.substr(1)

    return citekey
  }

  /** Generates citation keys as the stock Zotero Bib(La)TeX export does */
  public $zotero() {
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
    return Zotero.Libraries.getName(this.item.item.libraryID)
  }

  public $auth(onlyEditors, withInitials, n, m) {
    const authors = this.creators(onlyEditors, {withInitials})
    debug('$auth:', { onlyEditors, withInitials, n, m, authors })
    if (!authors || !authors.length) return ''
    let author = authors[m || 0]
    if (author && n) author = author.substring(0, n)
    return author || ''
  }

  public $authForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[0]
  }

  public $authorLastForeIni(onlyEditors) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  public $authorLast(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  /** returns the journal abbreviation, or, if not found, the journal title, If 'automatic journal abbreviation' is enabled in the BBT settings,
   * it will use the same abbreviation filter Zotero uses in the wordprocessor integration. You might want to use the `abbr` filter on this.
   */
  public $journal() { return JournalAbbrev.get(this.item.item, true) || this.item.item.getField('publicationTitle', false, true) }

  public $authors(onlyEditors, withInitials, n) {
    let authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    if (n) {
      const etal = authors.length > n
      authors = authors.slice(0, n)
      if (etal) authors.push('EtAl')
    }

    return authors.join('')
  }

  public $authorsAlpha(onlyEditors, withInitials) {
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

  public $authIni(onlyEditors, withInitials, n) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors.map(author => author.substring(0, n)).join('.')
  }

  public $authorIni(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    const firstAuthor = authors.shift()

    // tslint:disable-next-line:no-magic-numbers
    return [firstAuthor.substring(0, 5)].concat(authors.map(auth => auth.map(name => name.substring(0, 1)).join('.'))).join('.')
  }

  public $auth_auth_ea(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    return authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join('.')
  }

  public $authEtAl(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join('')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join('')
  }

  public $auth_etal(onlyEditors, withInitials) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // tslint:disable-next-line:no-magic-numbers
    if (authors.length === 2) return authors.join('.')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join('.')
  }

  public $authshort(onlyEditors, withInitials) {
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

  public $firstpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    let firstpage = ''
    this.item.pages.replace(/^([0-9]+)/g, (match, fp) => firstpage = fp)
    return firstpage
  }

  public $lastpage() {
    if (!this.item.pages) this.item.pages = this.item.item.getField('pages', false, true)
    if (!this.item.pages) return ''
    let lastpage = ''
    this.item.pages.replace(/([0-9]+)[^0-9]*$/g, (match, lp) => lastpage = lp)
    return lastpage
  }

  public $keyword(n) {
    this.item.tags = this.item.tags || this.item.item.getTags().map(tag => tag.tag)
    return this.item.tags[n] || ''
  }

  public $shorttitle() {
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''

    // tslint:disable-next-line:no-magic-numbers
    return words.slice(0, 3).join('')
  }

  public $veryshorttitle() {
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''
    return words.slice(0, 1).join('')
  }

  public $shortyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 2)
  }

  public $year() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.year, 4)
  }

  public $origyear() {
    // tslint:disable-next-line:no-magic-numbers
    return this.padYear(this.item.origyear, 4)
  }

  public $month() {
    if (!this.item.month) return ''
    return this.months[this.item.month - 1] || ''
  }

  public $title() { return this.titleWords(this.item.title).join('') }

  /**
   * this replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
   * parameter, e.g `condense,_` will replace spaces with underscores. **Parameters should not contain spaces** unless
   * you want the spaces in the value passed in to be replaced with those spaces in the parameter
   */
  public _condense(value, sep) {
    return (value || '').replace(/\s/g, sep || '')
  }

  /**
   * prefixes with its parameter, so `prefix,_` will add an underscore to the front if, and only if, the value
   * it is supposed to prefix isn't empty. If you want to use a reserved character (such as `:` or `\`), you'll need to
   * add a backslash (`\`) in front of it.
   */
  public _prefix(value, prefix) {
    value = value || ''
    if (value && prefix) return `${prefix}${value}`
    return value
  }

  /**
   * postfixes with its parameter, so `postfix,_` will add an underscore to the end if, and only if, the value
   * it is supposed to postfix isn't empty
   */
  public _postfix(value, postfix) {
    value = value || ''
    if (value && postfix) return `${value}${postfix}`
    return value
  }

  public _abbr(value) {
    return (value || '').split(/\s+/).map(word => word.substring(0, 1)).join('')
  }

  public _lower(value) {
    return (value || '').toLowerCase()
  }

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
   * selects words from the value passed in. The format is `select,start,number` (1-based), so `select,1,4`
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

  public _substring(value, start, n) {
    return (value || '').slice(start - 1, (start - 1) + n)
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
  public _fold(value) {
    return this.removeDiacritics(value).split(/\s+/).join(' ').trim()
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

  public _clean(value) {
    if (!value) return ''
    return this.clean(value)
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
