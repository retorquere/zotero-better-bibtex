import type { Tag, Reference as SerializedReference, Item as SerializedItem } from '../../gen/typings/serialized-item'

import { client } from '../client'

import { log } from '../logger'
import fold2ascii from 'fold-to-ascii'
import ucs2decode = require('punycode2/ucs2/decode')
import scripts = require('xregexp/tools/output/scripts')
import { transliterate } from 'transliteration'

import { flash } from '../flash'
import { Preference } from '../../gen/preferences'
import { JournalAbbrev } from '../journal-abbrev'
import { kuroshiro } from './kuroshiro'
import * as Extra from '../extra'
import { buildCiteKey as zotero_buildCiteKey } from './formatter-zotero'

const parser = require('./formatter.pegjs')
import * as DateParser from '../dateparser'

import * as methods from '../../gen/key-formatter-methods.json'
import itemCreators from '../../gen/items/creators.json'
import * as items from '../../gen/items/items'
import { jieba } from './jieba'

import parse5 = require('parse5/lib/parser')
const htmlParser = new parse5()

import { sprintf } from 'sprintf-js'

function innerText(node): string {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (node.nodeName === '#text') return node.value
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  if (node.childNodes) return node.childNodes.map(innerText).join('')
  return ''
}

function parseDate(v): PartialDate {
  v = v || ''
  const parsed: {
    y?: number
    m?: number
    d?: number
    oy?: number
    om?: number
    od?: number
  } = {}

  let date = DateParser.parse(v, Zotero.BetterBibTeX.localeDateOrder)
  if (date.type === 'list') date = date.dates.find(d => d.type !== 'open') || date.dates[0]
  if (date.type === 'interval') date = (date.from && date.from.type !== 'open') ? date.from : date.to
  if (!date.type) date.type = 'date' // will rescue 'orig' if present

  switch (date.type) {
    case 'open':
      break

    case 'verbatim':
      // eslint-disable-next-line no-case-declarations
      const reparsed = Zotero.Date.strToDate(date.verbatim)
      if (typeof reparsed.year === 'number' || reparsed.year) {
        parsed.y = reparsed.year
        parsed.m = parseInt(reparsed.month) || undefined
        parsed.d = parseInt(reparsed.day) || undefined

      }
      else {
        parsed.y = parsed.oy = (date.verbatim as unknown as number) // a bit cheaty

      }

      break

    case 'date':
      Object.assign(parsed, { y: date.year, m: date.month, d: date.day })

      if (date.orig) {
        Object.assign(parsed, { oy: date.orig.year, om: date.orig.month, od: date.orig.day })
        if (typeof date.year !== 'number') Object.assign(parsed, { y: date.orig.year, m: date.orig.month, d: date.orig.day })
      }
      else {
        Object.assign(parsed, { oy: date.year, om: date.month, od: date.day })
      }
      break

    case 'season':
      parsed.y = parsed.oy = date.year
      break

    default:
      throw new Error(`Unexpected parsed date ${JSON.stringify(v)} => ${JSON.stringify(date)}`)
  }

  const res: PartialDate = {}

  res.m = (typeof parsed.m !== 'undefined') ? (`${parsed.m}`) : ''
  res.d = (typeof parsed.d !== 'undefined') ? (`${parsed.d}`) : ''
  res.y = (typeof parsed.y !== 'undefined') ? (`${parsed.y % 100}`) : '' // eslint-disable-line no-magic-numbers
  res.Y = (typeof parsed.y !== 'undefined') ? (`${parsed.y}`) : ''
  res.om = (typeof parsed.om !== 'undefined') ? (`${parsed.om}`) : ''
  res.od = (typeof parsed.od !== 'undefined') ? (`${parsed.od}`) : ''
  res.oy = (typeof parsed.oy !== 'undefined') ? (`${parsed.oy % 100}`) : '' // eslint-disable-line no-magic-numbers
  res.oY = (typeof parsed.oy !== 'undefined') ? (`${parsed.oy}`) : ''
  if (date.type !== 'verbatim') {
    const [ , H, M, S ] = v.match(/(?: |T)([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?(?:[A-Z]+|[-+][0-9]+)?$/) || [null, '', '', '']
    Object.assign(res, { H, M, S })
    res.S = res.S || ''
  }
  else {
    Object.assign(res, { H: '', M: '', S: '' })
  }

  return res
}

const script = {
  // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
  han: new RegExp('([' + scripts.find((s: { name: string }) => s.name === 'Han').bmp + '])', 'g'), // eslint-disable-line  prefer-template
}

type PartialDate = {
  Y?: string
  y?: string
  m?: string
  d?: string
  oY?: string
  oy?: string
  om?: string
  od?: string

  H?: string
  M?: string
  S?: string
}

class Item {
  public item: ZoteroItem | SerializedItem
  private language = {
    jp: 'japanese',
    japanese: 'japanese',
    de: 'german',
    german: 'german',
  }

  public itemType: string
  public date: PartialDate
  public creators: { lastName?: string, firstName?: string, name?: string, creatorType: string, fieldMode?: number, source?: string }[]
  public title: string
  public itemID: number
  public libraryID: number
  public removeDiacritics: string
  public getField: (name: string) => number | string
  public extra: string
  public extraFields: Extra.Fields

  constructor(item: ZoteroItem | SerializedItem) { // Reference must have simplifyForExport pre-applied, without scrubbing
    this.item = item

    if ((item as ZoteroItem).getField) {
      this.itemID = (item as ZoteroItem).id
      this.itemType = Zotero.ItemTypes.getName((item as ZoteroItem).itemTypeID)
      this.getField = (name: string) => (name === 'dateAdded' || name === 'dateModified') ? (this.item as any)[name] : (this.item as ZoteroItem).getField(name, false, true) // eslint-disable-line @typescript-eslint/no-unsafe-return
      this.creators = (item as ZoteroItem).getCreatorsJSON()
      this.libraryID = item.libraryID
      this.title = (item as ZoteroItem).getField('title', false, true) as string
    }
    else {
      this.itemType = (item as SerializedReference).itemType
      this.itemID = (item as SerializedReference).itemID
      this.getField = (name: string) => this.item[name] // eslint-disable-line @typescript-eslint/no-unsafe-return
      this.creators = (item as SerializedReference).creators
      this.libraryID = null
      this.title = (item as SerializedReference).title
    }

    for (const creator of this.creators) {
      creator.lastName = creator.lastName || creator.name
    }

    this.removeDiacritics = this.language[(this.getField('language') as string || '').toLowerCase()] || ''
    const extraFields = Extra.get(this.getField('extra') as string, 'zotero', { kv: true, tex: true })
    this.extra = extraFields.extra
    this.extraFields = extraFields.extraFields

    try {
      const date = this.getField('date')
      this.date = date ? parseDate(date) : {}
    }
    catch (err) {
      this.date = {}
    }
    if (this.extraFields.kv.originalDate) {
      const date = parseDate(this.extraFields.kv.originalDate)
      if (date.y) {
        Object.assign(this.date, { oy: date.y, om: date.m, od: date.d, oY: date.Y })
        if (!this.date.y) Object.assign(this.date, { y: date.y, m: date.m, d: date.d, Y: date.Y })
      }
    }
    if (Object.keys(this.date).length === 0) {
      this.date = null
    }

    if (this.title.includes('<')) this.title = innerText(htmlParser.parseFragment(this.title))
  }

  public getTags(): Tag[] | string[] {
    return (this.item as ZoteroItem).getTags ? (this.item as ZoteroItem).getTags() : (this.item as SerializedReference).tags
  }
}

const safechars = '-:\\p{L}0-9_!$*+./;\\[\\]'
class PatternFormatter {
  public generate: () => { citekey: string, postfix: { start: number, format: string } }

  private re = {
    unsafechars_allow_spaces: Zotero.Utilities.XRegExp(`[^${safechars}\\s]`),
    unsafechars: Zotero.Utilities.XRegExp(`[^${safechars}]`),
    alphanum: Zotero.Utilities.XRegExp('[^\\p{L}\\p{N}]'),
    punct: Zotero.Utilities.XRegExp('\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    dash: Zotero.Utilities.XRegExp('\\p{Pd}+', 'g'),
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    word: Zotero.Utilities.XRegExp('[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*', 'g'),
  }

  /*
   * three-letter month abbreviations. I assume these are the same ones that the
   * docs say are defined in some appendix of the LaTeX book. (I don't have the
   * LaTeX book.)
  */
  private months = { 1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun', 7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec' }

  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  private DOMParser = new DOMParser

  private item: Item

  private skipWords: Set<string>

  // private fold: boolean
  private citekeyFormat: string

  public update(_reason: string) {
    this.skipWords = new Set(Preference.skipWords.split(',').map((word: string) => word.trim()).filter((word: string) => word))

    // safeguard agains Zotero late-loading preference defaults
    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    if (!Preference.citekeyFormat || Preference.citekeyFormat.includes('\u200B')) Preference.citekeyFormat = Preference.default.citekeyFormat.replace(/^\u200B/, '')

    for (const attempt of ['get', 'strip', 'reset']) {
      let citekeyFormat = ''
      const errors = []
      switch (attempt) {
        case 'get':
          this.citekeyFormat = Preference.citekeyFormat
          break

        case 'strip':
          for (const chunk of (Preference.citekeyFormat.replace(/^\u200B/, '').match(/[^\]]*\]*/g) as string[])) {
            try {
              this.parsePattern(citekeyFormat + chunk)
              citekeyFormat += chunk
            }
            catch (err) {
              errors.push(chunk)
            }
          }
          citekeyFormat = citekeyFormat.trim()
          if (citekeyFormat.includes('[')) {
            // eslint-disable-next-line no-magic-numbers
            if (errors.length) flash('Malformed citation pattern', `removed malformed patterns:\n${errors.join('\n')}`, 20)
            this.citekeyFormat = Preference.citekeyFormat = citekeyFormat
          }
          else {
            continue
          }
          break

        case 'reset':
          // eslint-disable-next-line no-magic-numbers
          flash('Malformed citation pattern', 'resetting to default', 20)
          this.citekeyFormat = Preference.citekeyFormat = Preference.default.citekeyFormat.replace(/^\u200B/, '')
          break
      }

      try {
        // @ts-ignore
        this.generate = new Function(this.parsePattern(this.citekeyFormat))
        break
      }
      catch (err) {
        log.error('PatternFormatter.update: Error parsing citekeyFormat ', {pattern: this.citekeyFormat}, err, err.location)
      }
    }
  }

  public parsePattern(pattern) {
    const { formatter, postfixes } = (parser.parse(pattern, { items, methods }) as { formatter: string, postfixes: string[]})
    log.debug('formatter function:', formatter)
    log.debug('formatter postfixes:', postfixes)

    for (const postfix of postfixes) {
      const expected = `${Date.now()}`
      const found = sprintf(postfix, { a: expected, A: expected, n: expected })
      if (!found.includes(expected)) throw new Error(`postfix ${postfix} does not contain %(a)s, %(A)s or %(n)s`)
      if (found.split(expected).length > 2) throw new Error(`postfix ${postfix} contains multiple instances of %(a)s/%(A)s/%(n)s`)
    }
    return formatter
  }

  public format(item: ZoteroItem | SerializedItem): { citekey: string, postfix: { start: number, format: string } } {
    this.item = new Item(item)

    switch (this.item.itemType) {
      case 'attachment':
      case 'note':
      case 'annotation':
        return { citekey: '', postfix: { start: 0, format: ''} }
    }

    const citekey = this.generate()

    if (!citekey.citekey) citekey.citekey = `zotero-${this.item.itemID}`
    if (citekey.citekey && Preference.citekeyFold) citekey.citekey = this.removeDiacritics(citekey.citekey)
    citekey.citekey = citekey.citekey.replace(/[\s{},@]/g, '')

    return citekey
  }

  /**
   * Generates citation keys as the stock Zotero Bib(La)TeX export
   * does. Note that this pattern inherits all the problems of the
   * original Zotero citekey generation -- you should really only
   * use this if you have existing papers that rely on this behavior.
   */
  public $zotero() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return zotero_buildCiteKey({
      creators: this.item.creators,
      title: this.item.getField('title'),
      date: this.item.getField('date'),
      dateAdded: this.item.getField('dateAdded'),
    }, null, {})
  }

  public $property(name: string) {
    return this.innerText(`${this.item.getField(name) || this.item.getField(name[0].toLowerCase() + name.slice(1)) || ''}`)
  }

  /** returns the name of the shared group library, or nothing if the reference is in your personal library */
  public $library(): string {
    if (this.item.libraryID === Zotero.Libraries.userLibraryID) return ''
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Libraries.get(this.item.libraryID).name
  }

  /** The first `N` (default: all) characters of the `M`th (default: first) author's last name. */
  public $auth(onlyEditors: boolean, withInitials:boolean, joiner: string, n?: number, m?:number): string {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    let author = authors[m ? m - 1 : 0]
    if (author && n) author = author.substring(0, n)
    return author || ''
  }

  /** The forename initial of the first author. */
  public $authForeIni(onlyEditors: boolean) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[0]
  }

  /** The forename initial of the last author. */
  public $authorLastForeIni(onlyEditors: boolean) {
    const authors = this.creators(onlyEditors, {initialOnly: true})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  /** The last name of the last author */
  public $authorLast(onlyEditors: boolean, withInitials: boolean, joiner: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors[authors.length - 1]
  }

  /** returns the journal abbreviation, or, if not found, the journal title, If 'automatic journal abbreviation' is enabled in the BBT settings,
   * it will use the same abbreviation filter Zotero uses in the wordprocessor integration. You might want to use the `abbr` filter on this.
   */
  public $journal() {
    // this.item.item is the native item stored inside the this.item sorta-proxy
    return JournalAbbrev.get(this.item.item, true) || this.item.getField('publicationTitle')
  } // eslint-disable-line @typescript-eslint/no-unsafe-return

  /** The last name of up to N authors. If there are more authors, "EtAl" is appended. */
  public $authors(onlyEditors: boolean, withInitials: boolean, joiner: string, n?:number) {
    let authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    if (n) {
      const etal = authors.length > n
      authors = authors.slice(0, n)
      if (etal) authors.push('EtAl')
    }

    return authors.join(joiner || ' ')
  }

  /** Corresponds to the BibTeX style "alpha". One author: First three letters of the last name. Two to four authors: First letters of last names concatenated.
   * More than four authors: First letters of last names of first three authors concatenated. "+" at the end.
   */
  public $authorsAlpha(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    switch (authors.length) {
      case 1: // eslint-disable-line no-magic-numbers
        return authors[0].substring(0, 3) // eslint-disable-line no-magic-numbers

      case 2: // eslint-disable-line no-magic-numbers
      case 3: // eslint-disable-line no-magic-numbers
      case 4: // eslint-disable-line no-magic-numbers
        return authors.map(author => author.substring(0, 1)).join(joiner || ' ')

      default:
        // eslint-disable-next-line no-magic-numbers
        return `${authors.slice(0, 3).map(author => author.substring(0, 1)).join(joiner || ' ') }+`
    }
  }

  /** The beginning of each author's last name, using no more than `N` characters. */
  public $authIni(onlyEditors: boolean, withInitials: boolean, joiner: string, n?: number) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    return authors.map(author => author.substring(0, n)).join(joiner || '.')
  }

  /** The first 5 characters of the first author's last name, and the last name initials of the remaining authors. */
  public $authorIni(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''
    const firstAuthor = authors.shift()

    // eslint-disable-next-line no-magic-numbers
    return [firstAuthor.substring(0, 5)].concat(authors.map(name => name.substring(0, 1)).join('.')).join(joiner || '.')
  }

  /** The last name of the first two authors, and ".ea" if there are more than two. */
  public $auth_auth_ea(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // eslint-disable-next-line no-magic-numbers
    return authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join(joiner || '.')
  }

  /** The last name of the first author, and the last name of the
   * second author if there are two authors or "EtAl" if there are
   * more than two. This is similar to `auth.etal`. The difference
   * is that the authors are not separated by "." and in case of
   * more than 2 authors "EtAl" instead of ".etal" is appended.
   */
  public $authEtAl(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // eslint-disable-next-line no-magic-numbers
    if (authors.length === 2) return authors.join(joiner || ' ')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join(joiner || ' ')
  }

  /** The last name of the first author, and the last name of the second author if there are two authors or ".etal" if there are more than two. */
  public $auth_etal(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    // eslint-disable-next-line no-magic-numbers
    if (authors.length === 2) return authors.join(joiner || '.')
    return authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join(joiner || '.')
  }

  /** The last name if one author is given; the first character of up to three authors' last names if more than one author is given. A plus character is added, if there are more than three authors. */
  public $authshort(onlyEditors: boolean, withInitials: boolean, joiner: string) {
    const authors = this.creators(onlyEditors, {withInitials})
    if (!authors || !authors.length) return ''

    switch (authors.length) {
      case 0:
        return ''

      case 1:
        return authors[0]

      default:
        // eslint-disable-next-line no-magic-numbers
        return authors.slice(0, 3).map(author => author.substring(0, 1)).join(joiner || '.') + (authors.length > 3 ? '+' : '')
    }
  }

  /** The number of the first page of the publication (Caution: this will return the lowest number found in the pages field, since BibTeX allows `7,41,73--97` or `43+`.) */
  public $firstpage() {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return ''
    return pages.split(/[-\s,–]/)[0] || ''
  }

  /** The number of the last page of the publication (See the remark on `firstpage`) */
  public $lastpage() {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return ''
    return pages.split(/[-\s,–]/).pop() || ''
  }

  /** Tag number `N` */
  public $keyword(n: number): string {
    const tag: string | { tag: string} = this.item.getTags()?.[n] || ''
    return typeof tag === 'string' ? tag : tag.tag
  }

  /** The first `N` (default: 3) words of the title, apply capitalization to first `M` (default: 0) of those */
  public $shorttitle(n: number = 3, m: number = 0) { // eslint-disable-line no-magic-numbers, @typescript-eslint/no-inferrable-types
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return ''

    return words.slice(0, n).map((word, i) => i < m ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(' ')
  }

  /** The first `N` (default: 1) words of the title, apply capitalization to first `M` (default: 0) of those */
  public $veryshorttitle(n: number = 1, m: number = 0) { // eslint-disable-line no-magic-numbers, @typescript-eslint/no-inferrable-types
    return this.$shorttitle(n, m)
  }

  /** The last 2 digits of the publication year */
  public $shortyear() {
    return this._format_date(this.item.date, '%y')
  }

  /** The year of the publication */
  public $year() {
    return this.padYear(this._format_date(this.item.date, '%-Y'), 2)
  }

  /** The date of the publication */
  public $date(format: string = '%Y-%m-%d') { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return this._format_date(this.item.date, format)
  }

  /** A pseudo-field from the extra field. eg if you have `Original date: 1970` in your `extra` field, you can get it as `[extra=originalDate]`, or `tex.shortauthor: APA` which you could get with `[extra=tex.shortauthor]` */
  public $extra(variable: string) { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const variables = variable.toLowerCase().trim().split(/\s*\/\s*/).filter(varname => varname)
    if (!variables.length) return ''

    const value = variables
      .map((varname: string) => this.item.extraFields.kv[varname] || this.item.extraFields.tex[varname]?.value || this.item.extraFields.tex[`tex.${varname}`]?.value)
      .find(val => val)
    if (value) return value

    const extra: Record<string, string> = (this.item.extra || '')
      .split('\n')
      .map((line: string) => line.match(/^([^:]+?)\s*:\s*(.+)/i))
      .reduce((acc: Record<string, string>, match) => {
        if (match) acc[match[1].toLowerCase()] = match[2].trim()
        return acc
      }, {})
    return variables.map(varname => extra[varname]).find(val => val) || ''
  }


  /** the original year of the publication */
  public $origyear() {
    return this.padYear(this._format_date(this.item.date, '%-oY'), 2)
  }

  /** the original date of the publication */
  public $origdate() {
    return this._format_date(this.item.date, '%oY-%om-%od')
  }

  /** the month of the publication */
  public $month() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.months[this.item.date.m] || ''
  }

  /** Capitalize all the significant words of the title, and concatenate them. For example, `An awesome paper on JabRef` will become `AnAwesomePaperJabref` */
  public $title() { return (this.titleWords(this.item.title) || []).join(' ') }

  private padYear(year: string, length): string {
    return year ? year.replace(/[0-9]+/, y => y.length >= length ? y : (`0000${y}`).slice(-length)): ''
  }

  /** discards the input */
  public _discard(value: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
    return ''
  }

  /** transforms date/time to local time. Mainly useful for dateAdded and dateModified as it requires an ISO-formatted input. */
  public _local_time(value: string) {
    const m = value.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})[ T]([0-9]{2}):([0-9]{2}):([0-9]{2})Z?$/)
    if (!m) return value
    const date = new Date(`${value}Z`)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().replace('.000Z', '').replace('T', ' ')
  }

  /** formats date as by replacing y, m and d in the format */
  public _format_date(value: string | PartialDate, format: string='%Y-%m-%d') { // eslint-disable-line @typescript-eslint/no-inferrable-types
    if (!value) return ''

    const date = (typeof value === 'string') ? parseDate(value) : value

    let keep = true
    const formatted = format.split(/(%-?o?[a-z]|%%)/i).map((spec, i) => {
      if ((i % 2) === 0) return spec
      if (spec === '%%') return '%'

      const pad = spec[1] !== '-'
      const field = spec.substring(pad ? 1 : 2)
      let repl: string = date[field]
      if (typeof repl !== 'string') throw new Error(`:format-date: unsupported formatter ${JSON.stringify(spec)}`)
      if (!repl) return null

      if (pad) repl = this.padYear(repl, (field === 'Y' || field === 'oY') ? 4 : 2) // eslint-disable-line no-magic-numbers

      return repl

    }).filter((field, i, arr) => {
      if ((i % 2) === 0) { // separator, peek ahead
        keep = keep && !!arr[i + 1]
      }
      else {
        keep = keep && !!field
      }
      return keep

    }).join('')

    return formatted
  }

  /** returns the value if it's an integer */
  public _numeric(value: string) {
    return isNaN(parseInt(value)) ? '' : value
  }

  /** replaces text, case insensitive; `:replace=.etal,&etal` will replace `.EtAl` with `&etal` */
  public _replace(value: string, find: string, replace: string, mode?: 'string' | 'regex') {
    if (!find) return (value || '')
    const re = mode === 'regex' ? find : find.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&')
    return (value || '').replace(new RegExp(re, 'ig'), replace || '')
  }

  /**
   * this replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
   * parameter, e.g `condense=_` will replace spaces with underscores. **Parameters should not contain spaces** unless
   * you want the spaces in the value passed in to be replaced with those spaces in the parameter
   */
  public _condense(value: string, sep: string = '') { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return (value || '').replace(/\s/g, sep)
  }

  /**
   * prefixes with its parameter, so `prefix=_` will add an underscore to the front if, and only if, the value
   * it is supposed to prefix isn't empty. If you want to use a reserved character (such as `:` or `\`), you'll need to
   * add a backslash (`\`) in front of it.
   */
  public _prefix(value: string, prefix: string) {
    value = value || ''
    if (value && prefix) return `${prefix}${value}`
    return value
  }

  /**
   * postfixes with its parameter, so `postfix=_` will add an underscore to the end if, and only if, the value
   * it is supposed to postfix isn't empty
   */
  public _postfix(value: string, postfix: string) {
    value = value || ''
    if (value && postfix) return `${value}${postfix}`
    return value
  }

  /**
   * Abbreviates the text. Only the first character and subsequent characters following white space will be included.
   */
  public _abbr(value: string): string {
    return (value || '').split(/\s+/).map(word => word.substring(0, 1)).join(' ')
  }

  /** Forces the text inserted by the field marker to be in lowercase. For example, `[auth:lower]` expands the last name of the first author in lowercase. */
  public _lower(value: string): string {
    return (value || '').toLowerCase()
  }

  /** Forces the text inserted by the field marker to be in uppercase. For example, `[auth:upper]` expands the last name of the first author in uppercase. */
  public _upper(value: string): string {
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
  public _skipwords(value: string): string {
    return (value || '').split(/\s+/).filter(word => !this.skipWords.has(word.toLowerCase())).join(' ').trim()
  }

  /**
   * selects words from the value passed in. The format is `select=start,number` (1-based), so `select=1,4`
   * would select the first four words. If `number` is not given, all words from `start` to the end of the list are
   * selected.
   */
  public _select(value: string, start: number = 1, n?: number): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const values = (value || '').split(/\s+/)
    let end = values.length

    start -= 1
    if (typeof n !== 'undefined') end = start + n
    return values.slice(start, end).join(' ')
  }

  /** (`substring=start,n`) selects `n` (default: all) characters starting at `start` (default: 1) */
  public _substring(value: string, start: number = 1, n?: number): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    if (typeof n === 'undefined') n = value.length

    return (value || '').slice(start - 1, (start - 1) + n)
  }

  /** removes all non-ascii characters */
  public _ascii(value: string): string {
    return (value || '').replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()
  }

  /** clears out everything but unicode alphanumeric characters (unicode character classes `L` and `N`) */
  public _alphanum(value: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Utilities.XRegExp.replace(value || '', this.re.alphanum, '', 'all').split(/\s+/).join(' ').trim()
  }

  /** tries to replace diacritics with ascii look-alikes. Removes non-ascii characters it cannot match */
  public _fold(value: string, mode?: 'german' | 'japanese'): string {
    return this.removeDiacritics(value, mode).split(/\s+/).join(' ').trim()
  }

  /** uppercases the first letter of each word */
  public _capitalize(value: string): string {
    return (value || '').replace(/((^|\s)[a-z])/g, m => m.toUpperCase())
  }

  /** Removes punctuation */
  public _nopunct(value: string): string {
    value = value || ''
    value = Zotero.Utilities.XRegExp.replace(value, this.re.dash, '-', 'all')
    value = Zotero.Utilities.XRegExp.replace(value, this.re.punct, '', 'all')
    return value
  }

  /** Removes punctuation and word-connecting dashes */
  public _nopunctordash(value: string): string {
    value = value || ''
    value = Zotero.Utilities.XRegExp.replace(value, this.re.dash, '', 'all')
    value = Zotero.Utilities.XRegExp.replace(value, this.re.punct, '', 'all')
    return value
  }

  /** Treat ideaographs as individual words */
  public _split_ideographs(value: string): string {
    return (value || '').replace(script.han, ' $1 ').trim()
  }

  /** jieba*/
  public _jieba(value: string): string {
    if (!Preference.jieba) return value
    return jieba.cut(value || '').join(' ').trim()
  }

  /** transliterates the citation key and removes unsafe characters */
  public _clean(value: string): string {
    if (!value) return ''
    return this.clean(value)
  }

  /** transliterates the citation key */
  public _transliterate(value: string): string {
    if (!value) return ''
    return this.removeDiacritics(value)
  }

  private removeDiacritics(str: string, mode?: string): string {
    mode = mode || this.item.removeDiacritics

    if (mode === 'japanese') mode = null
    const replace = {
      german: {
        '\u00E4': 'ae', // eslint-disable-line quote-props
        '\u00F6': 'oe', // eslint-disable-line quote-props
        '\u00FC': 'ue', // eslint-disable-line quote-props
        '\u00C4': 'Ae', // eslint-disable-line quote-props
        '\u00D6': 'Oe', // eslint-disable-line quote-props
        '\u00DC': 'Ue', // eslint-disable-line quote-props
      },
    }[mode]
    if (mode && !replace) throw new Error(`Unsupported fold mode "${mode}"`)

    if (Preference.kuroshiro && kuroshiro.enabled) str = kuroshiro.convert(str, {to: 'romaji'})
    str = transliterate(str || '', {
      unknown: '\uFFFD', // unicode replacement char
      replace,
    })

    str = fold2ascii.foldMaintaining(str)

    return str
  }

  private clean(str: string, allow_spaces = false): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Utilities.XRegExp.replace(this.removeDiacritics(str), allow_spaces ? this.re.unsafechars_allow_spaces : this.re.unsafechars, '', 'all').trim()
  }

  private titleWords(title, options: { asciiOnly?: boolean, skipWords?: boolean} = {}): string[] {
    if (!title) return null

    title = this.innerText(title)

    if (options.asciiOnly && Preference.kuroshiro && kuroshiro.enabled) title = kuroshiro.convert(title, {to: 'romaji', mode: 'spaced'})

    // 551
    let words: string[] = (Zotero.Utilities.XRegExp.matchChain(title, [this.re.word]).map(word => this.clean(word).replace(/-/g, '')))

    if (options.asciiOnly) words = words.map((word: string) => word.replace(/[^ -~]/g, ''))
    words = words.filter(word => word)
    if (options.skipWords) words = words.filter((word: string) => !this.skipWords.has(word.toLowerCase()) && (ucs2decode(word).length > 1) || word.match(script.han))
    if (words.length === 0) return null
    return words
  }

  private innerText(str: string): string {
    if (!str) return ''
    return this.DOMParser.parseFromString(`<span>${str}</span>`, 'text/html').documentElement.textContent
  }

  private stripQuotes(name: string): string {
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
    }
    else {
      initial = firstName[0]
    }

    return this.removeDiacritics(initial)
  }

  private creators(onlyEditors, options: { initialOnly?: boolean, withInitials?: boolean} = {}): string[] {
    const types = itemCreators[client][this.item.itemType] || []
    const primary = types[0]

    const creators: Record<string, string[]> = {}

    for (const creator of this.item.creators) {
      if (onlyEditors && creator.creatorType !== 'editor' && creator.creatorType !== 'seriesEditor') continue

      let name = options.initialOnly ? this.initial(creator) : this.stripQuotes(this.innerText(creator.lastName || creator.name))
      if (name) {
        if (options.withInitials && creator.firstName) {
          let initials = Zotero.Utilities.XRegExp.replace(this.stripQuotes(creator.firstName), this.re.caseNotUpperTitle, '', 'all')
          initials = this.removeDiacritics(initials)
          initials = Zotero.Utilities.XRegExp.replace(initials, this.re.caseNotUpper, '', 'all')
          name += initials
        }
      }
      else {
        name = this.stripQuotes(this.innerText(creator.firstName))
      }

      if (!name) continue

      switch (creator.creatorType) {
        case 'editor':
        case 'seriesEditor':
          creators.editors = creators.editors || []
          creators.editors.push(name)
          break

        case 'translator':
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

    if (onlyEditors) return creators.editors || []
    return creators.authors || creators.editors || creators.translators || creators.collaborators || []
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Formatter = new PatternFormatter // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
