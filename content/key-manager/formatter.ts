import type { Tag, RegularItem as SerializedRegularItem, Item as SerializedItem } from '../../gen/typings/serialized-item'

import { client } from '../client'

import { log } from '../logger'
import fold2ascii from 'fold-to-ascii'
import ucs2decode = require('punycode2/ucs2/decode')
import scripts = require('xregexp/tools/output/scripts')
import { transliterate } from 'transliteration/dist/node/src/node/index'

import { flash } from '../flash'
import { Preference } from '../prefs'
import { JournalAbbrev } from '../journal-abbrev'
import * as Extra from '../extra'
import { buildCiteKey as zotero_buildCiteKey } from './formatter-zotero'
import { babelLanguage } from '../text'
import { fetchSync as fetchInspireHEP } from '../inspire-hep'

const legacyparser = require('./legacy.peggy')
import * as formula from './convert'
import * as DateParser from '../dateparser'

import { methods } from '../../gen/api/key-formatter'

import itemCreators from '../../gen/items/creators.json'
import * as items from '../../gen/items/items'

import { parseFragment } from 'parse5'

import { sprintf } from 'sprintf-js'

import { jieba, pinyin } from './chinese'
import { kuroshiro } from './japanese'

import { validator, coercing } from '../ajv'
import { dictsync as csv2dict } from '../load-csv'

import BabelTag from '../../gen/babel/tag.json'
type ValueOf<T> = T[keyof T]
type BabelLanguageTag = ValueOf<typeof BabelTag>
type BabelLanguage = keyof typeof BabelTag
type ZoteroItemType = keyof typeof items.valid.type

for (const meta of Object.values(methods)) {
  (meta as unknown as any).validate = validator((meta as any).schema, coercing)
}

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

  let date = DateParser.parse(v)
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
  private language = ''

  public itemType: string
  public date: PartialDate
  public creators: { lastName?: string, firstName?: string, name?: string, creatorType: string, fieldMode?: number, source?: string }[]
  public title: string
  public itemID: number
  public id: number
  public libraryID: number
  public transliterateMode: 'german' | 'japanese' | 'chinese' | ''
  public getField: (name: string) => number | string
  public extra: string
  public extraFields: Extra.Fields

  constructor(item: ZoteroItem | SerializedItem) { // Item must have simplifyForExport pre-applied, without scrubbing
    this.item = item

    if ((item as ZoteroItem).getField) {
      this.itemID = this.id = (item as ZoteroItem).id
      this.itemType = Zotero.ItemTypes.getName((item as ZoteroItem).itemTypeID)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      this.getField = function(name: string): string | number {
        switch (name) {
          case 'dateAdded':
          case 'dateModified':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return (this.item)[name]
          case 'title':
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return this.title
          default:
            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return (this.item as ZoteroItem).getField(name, false, true) as string || this.extraFields?.kv[name] || ''
        }
      }
      this.creators = (item as ZoteroItem).getCreatorsJSON()
      this.libraryID = item.libraryID
      this.title = (item as ZoteroItem).getField('title', false, true) as string
    }
    else {
      this.itemType = (item as SerializedRegularItem).itemType
      this.itemID = this.id = (item as SerializedRegularItem).itemID
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      this.getField = (name: string) => name === 'title' ? this.title : this.item[name] || this.extraFields?.kv[name] || ''
      this.creators = (item as SerializedRegularItem).creators
      this.libraryID = null
      this.title = (item as SerializedRegularItem).title
    }

    this.language = babelLanguage((this.getField('language') as string) || '')
    switch (this.babelTag()) {
      case 'de':
        this.transliterateMode = 'german'
        break

      case 'ja':
        this.transliterateMode = 'japanese'
        break

      case 'zh':
        this.transliterateMode = 'chinese'
        break

      default:
        this.transliterateMode = ''
        break
    }

    const extraFields = Extra.get(this.getField('extra') as string, 'zotero', { kv: true, tex: true })
    this.extra = extraFields.extra
    this.extraFields = extraFields.extraFields

    for (const [creatorType, creators] of Object.entries(this.extraFields.creator || {})) {
      this.creators = this.creators.concat(creators.map(creator => Extra.zoteroCreator(creator, creatorType)))
    }
    for (const creator of this.creators) {
      creator.lastName = creator.lastName || creator.name
    }

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

    if (this.title.includes('<')) this.title = innerText(parseFragment(this.title))
  }

  public babelTag(): BabelLanguageTag {
    return BabelTag[this.language as BabelLanguage] || ''
  }

  public getTags(): Tag[] | string[] {
    return (this.item as ZoteroItem).getTags ? (this.item as ZoteroItem).getTags() : (this.item as SerializedRegularItem).tags
  }
}

const safechars = '-:\\p{L}0-9_!$*+./;\\[\\]'
class PatternFormatter {
  public chunk = ''
  public citekey = ''
  public folding: boolean

  public generate: () => string
  public postfix: { start: number, format: string }

  private re = {
    unsafechars_allow_spaces: Zotero.Utilities.XRegExp(`[^${safechars}\\s]`),
    unsafechars: Zotero.Utilities.XRegExp(`[^${safechars}]`),
    alphanum: Zotero.Utilities.XRegExp('[^\\p{L}\\p{N}]'),
    punct: Zotero.Utilities.XRegExp('\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    dash: Zotero.Utilities.XRegExp('\\p{Pd}|\u2500|\uFF0D|\u2015', 'g'), // additional pseudo-dashes from #1880
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    word: Zotero.Utilities.XRegExp('[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\{Pc}\\p{M}]+)*', 'g'),
  }

  private acronyms: Record<string, Record<string, string>> = {}

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

  public update(reason: string) {
    log.debug('update key formula:', reason)
    this.skipWords = new Set(Preference.skipWords.split(',').map((word: string) => word.trim()).filter((word: string) => word))

    // safeguard agains Zotero late-loading preference defaults
    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    if (!Preference.citekeyFormat || Preference.citekeyFormat.includes('\u200B')) Preference.citekeyFormat = Preference.default.citekeyFormat.replace(/^\u200B/, '')
    if (Preference.citekeyFormat.startsWith('[')) {
      log.debug('Upgrading citation pattern', Preference.citekeyFormat)
      try {
        Preference.citekeyFormat = legacyparser.parse(Preference.citekeyFormat, { sprintf, items, methods }) as string
        flash('Citation pattern upgraded', `Citation pattern upgraded to ${Preference.citekeyFormat}`)
      }
      catch (err) {
        log.debug('Upgrading citation pattern failed', err)
      }
    }

    for (const attempt of ['get', 'reset']) {
      switch (attempt) {
        case 'get':
          this.citekeyFormat = Preference.citekeyFormat
          break

        case 'reset':
          // eslint-disable-next-line no-magic-numbers
          flash('Malformed citation pattern', 'resetting to default', 20)
          Preference.citekeyFormatBackup = Preference.citekeyFormat.replace(/^\u200B/, '')
          this.citekeyFormat = Preference.citekeyFormat = Preference.default.citekeyFormat.replace(/^\u200B/, '')
          break
      }

      try {
        log.debug('PatternFormatter.update: installing citekeyFormat ', {pattern: this.citekeyFormat})
        this.$postfix()
        const formatter = this.parsePattern(this.citekeyFormat)
        log.debug('PatternFormatter.update: installing citekeyFormat ', formatter)
        this.generate = (new Function(formatter) as () => string)
        log.debug('PatternFormatter.update: installing generate ', {generate: this.generate.toString()})
        break
      }
      catch (err) {
        log.error('PatternFormatter.update: Error parsing citekeyFormat ', {pattern: this.citekeyFormat}, err, err.location)
      }
    }
  }

  public parsePattern(pattern): string {
    log.debug('parsePattern.pattern:', pattern)
    const code = formula.convert(pattern)
    if (Preference.testing) log.debug('parsePattern.compiled:', code)
    return code
  }

  public convertLegacy(pattern: string): string {
    return legacyparser.parse(pattern, { sprintf, items, methods }) as string
  }

  public reset() {
    this.citekey = ''
    this.folding = Preference.citekeyFold
    log.debug('reset:', { folding: this.folding })
    return ''
  }

  public format(item: ZoteroItem | SerializedItem): string {
    this.item = new Item(item)
    this.chunk = ''

    switch (this.item.itemType) {
      case 'attachment':
      case 'note':
      case 'annotation':
        return ''
    }

    this.$postfix()
    log.debug('formatting new key')
    let citekey = this.generate() || `zotero-${this.item.itemID}`
    if (citekey && this.folding) citekey = this.transliterate(citekey)
    citekey = citekey.replace(/[\s{},@]/g, '')
    log.debug('new citekey:', citekey)

    return citekey
  }

  /**
   * Set the current chunk
   */
  public $text(text: string) {
    this.chunk = text
    return this
  }

  /**
   * Tests whether the item is of any of the given types, and skips to the next pattern if not
   * @param allowed one or more item type names
   */
  public $type(...allowed: ZoteroItemType[]) {
    if (allowed.map(type => type.toLowerCase()).includes(this.item.itemType.toLowerCase())) {
      return this.$text('')
    }
    else {
      throw { next: true } // eslint-disable-line no-throw-literal
    }
  }

  /**
   * Tests whether the item has the given language set, and skips to the next pattern if not
   * @param name one or more language codes
   */
  public $language(...name: (BabelLanguage | BabelLanguageTag)[]) {
    if (name.concat(name.map(n => BabelTag[n] as string).filter(n => n)).includes(this.item.babelTag())) {
      return this.$text('')
    }
    else {
      throw { next: true } // eslint-disable-line no-throw-literal
    }
  }

  /**
   * Generates citation keys as the stock Zotero Bib(La)TeX export
   * does. Note that this pattern inherits all the problems of the
   * original Zotero citekey generation -- you should really only
   * use this if you have existing papers that rely on this behavior.
   */
  public $zotero() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.$postfix('-%(n)s')
    return this.$text(zotero_buildCiteKey({
      creators: this.item.creators,
      title: this.item.getField('title'),
      date: this.item.getField('date'),
      dateAdded: this.item.getField('dateAdded'),
    }, null, {}))
  }

  /**
   * Fetches the key from inspire-hep based on DOI or arXiv ID
   */
  public $inspireHep() {
    return this.$text(fetchInspireHEP(this.item) || '')
  }

  /**
   * Gets the value of the item field
   * @param name name of the field
   */
  public $getField(name: string) {
    const value = this.item.getField(name)
    switch (typeof value) {
      case 'number':
        return this.$text(`${value}`)
      case 'string':
        return this.$text(this.innerText(value))
      case 'undefined':
        return this.$text('')
      default:
        throw new Error(`Unexpected value ${JSON.stringify(value)} of type ${typeof value}`)
    }
  }

  /** returns the name of the shared group library, or nothing if the item is in your personal library */
  public $library() {
    if (this.item.libraryID === Zotero.Libraries.userLibraryID) return this.$text('')
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.$text(Zotero.Libraries.get(this.item.libraryID).name)
  }

  /**
   * Author/editor information.
   * @param n       select the first `n` authors (when passing a number) or the authors in this range (inclusive, when passing two values); negative numbers mean "from the end", default = 0 = all
   * @param creator select type of creator (`author` or `editor`)
   * @param name    sprintf-js template. Available named parameters are: `f` (family name), `g` (given name), `i` (initials)
   * @param etal    use this term to replace authors after `n` authors have been named
   * @param sep     use this character between authors
   * @param min     skip to the next pattern if there are less than `min` creators, 0 = ignore
   * @param max     skip to the next pattern if there are more than `max` creators, 0 = ignore
   */
  public $authors(
    n: number | [number, number] = 0,
    creator: 'author' | 'editor' = 'author',
    name='%(f)s',
    etal='',
    sep=' ',
    min=0,
    max=0
  ) {
    let authors = this.creators(creator === 'editor', name)
    if (min && authors.length < min) throw { next: true } // eslint-disable-line no-throw-literal
    if (max && authors.length > max) throw { next: true } // eslint-disable-line no-throw-literal
    if (!n) {
      etal = ''
    }
    else {
      if (Array.isArray(n)) {
        etal = ''
      }
      else {
        if (n >= authors.length) etal = ''
        n = [ 1, n ]
      }
      authors = authors.slice(n[0] - 1, n[1])
      if (etal && !etal.replace(/[a-z]/ig, '').length) etal = `${sep}${etal}`
    }
    let author = authors.join(sep) + etal
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The first `n` (default: all) characters of the `m`th (default: first) author's last name.
   * @param n         the number of characters to take from the name, 0 = all
   * @param m         select the `m`th author
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   */
  public $auth(n=0, m=1, creator: 'author' | 'editor' = 'author', initials=false) {
    const family = n ? `%(f).${n}s` : '%(f)s'
    const name = initials ? `${family}%(I)s` : family
    return this.$authors([m, m], creator, name, undefined, undefined)
  }

  /**
   * The given-name initial of the first author.
   * @param creator   select from authors or only from editors
   */
  public $authForeIni(creator: 'author' | 'editor' = 'author') {
    let author: string = this.creators(creator === 'editor', '%(I)s')[0] || ''
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The given-name initial of the last author.
   * @param creator   select from authors or only from editors
   */
  public $authorLastForeIni(creator: 'author' | 'editor' = 'author') {
    const authors = this.creators(creator === 'editor', '%(I)s')
    let author = authors[authors.length - 1] || ''
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The last name of the last author
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   */
  public $authorLast(creator: 'author' | 'editor' = 'author', initials=false) {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    let author = authors[authors.length - 1] || ''
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * Corresponds to the BibTeX style "alpha". One author: First three letters of the last name. Two to four authors: First letters of last names concatenated.
   * More than four authors: First letters of last names of first three authors concatenated. "+" at the end.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authorsAlpha(creator: 'author' | 'editor' = 'author', initials=false, sep=' ') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')

    let author: string
    switch (authors.length) {
      case 1: // eslint-disable-line no-magic-numbers
        author = authors[0].substring(0, 3) // eslint-disable-line no-magic-numbers
        break

      case 2: // eslint-disable-line no-magic-numbers
      case 3: // eslint-disable-line no-magic-numbers
      case 4: // eslint-disable-line no-magic-numbers
        author = authors.map(auth => auth.substring(0, 1)).join(sep)
        break

      default:
        // eslint-disable-next-line no-magic-numbers
        author = `${authors.slice(0, 3).map(auth => auth.substring(0, 1)).join(sep)}+`
        break
    }
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The beginning of each author's last name, using no more than `n` characters (0 = all).
   * @param n         the number of characters to take from the name, 0 = all
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authIni(n=0, creator: 'author' | 'editor' = 'author', initials=false, sep='.') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')
    let author = authors.map(auth => auth.substring(0, n)).join(sep)
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The first 5 characters of the first author's last name, and the last name initials of the remaining authors.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authorIni(creator: 'author' | 'editor' = 'author', initials=false, sep='.'): PatternFormatter {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')
    const firstAuthor = authors.shift()

    // eslint-disable-next-line no-magic-numbers
    let author = [firstAuthor.substring(0, 5)].concat(authors.map(name => name.substring(0, 1)).join(sep)).join(sep)
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The last name of the first two authors, and ".ea" if there are more than two.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authAuthEa(creator: 'author' | 'editor' = 'author', initials=false, sep='.') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')

    // eslint-disable-next-line no-magic-numbers
    let author = authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join(sep)
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The last name of the first author, and the last name of the
   * second author if there are two authors or "EtAl" if there are
   * more than two. This is similar to `auth.etal`. The difference
   * is that the authors are not separated by "." and in case of
   * more than 2 authors "EtAl" instead of ".etal" is appended.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authEtAl(creator: 'author' | 'editor' = 'author', initials=false, sep=' ') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')

    let author
    // eslint-disable-next-line no-magic-numbers
    if (authors.length === 2) {
      author = authors.join(sep)
    }
    else {
      author = authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join(sep)
    }
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The last name of the first author, and the last name of the second author if there are two authors or ".etal" if there are more than two.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authEtal2(creator: 'author' | 'editor' = 'author', initials=false, sep='.') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return this.$text('')

    let author
    // eslint-disable-next-line no-magic-numbers
    if (authors.length === 2) {
      author = authors.join(sep)
    }
    else {
      author = authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join(sep)
    }
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * The last name if one author/editor is given; the first character
   * of up to three authors' last names if more than one author is
   * given. A plus character is added, if there are more than three
   * authors.
   * @param creator   select from authors or only from editors
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authshort(creator: 'author' | 'editor' = 'author', initials=false, sep='.') {
    const authors = this.creators(creator === 'editor', initials ? '%(f)s%(I)s' : '%(f)s')

    let author
    switch (authors.length) {
      case 0:
        return this.$text('')

      case 1:
        author = authors[0]
        break

      default:
        // eslint-disable-next-line no-magic-numbers
        author = authors.slice(0, 3).map(auth => auth.substring(0, 1)).join(sep) + (authors.length > 3 ? '+' : '')
    }
    if (this.folding) author = this.clean(author, true)
    return this.$text(author)
  }

  /**
   * returns the journal abbreviation, or, if not found, the journal title, If 'automatic journal abbreviation' is enabled in the BBT settings,
   * it will use the same abbreviation filter Zotero uses in the wordprocessor integration. You might want to use the `abbr` filter on this.
   * Abbreviation behavior can be specified as `abbrev+auto` (the default) which uses the explicit journal abbreviation if present, and tries the automatic
   * abbreviator if not (if auto-abbrev is enabled in the preferences), `auto` (skip explicit journal abbreviation even if present), `abbrev`
   * (no auto-abbrev even if it is enabled in the preferences) or `off` (no abbrevation).
   * @param abbrev abbreviation mode
   */
  public $journal(abbrev: 'abbrev+auto' | 'abbrev' | 'auto' | 'off' = 'abbrev+auto') {
    // this.item.item is the native item stored inside the this.item sorta-proxy
    return this.$text((abbrev === 'off' ? '' : JournalAbbrev.get(this.item.item, abbrev)) || this.item.getField('publicationTitle') as string || '')
  }

  /**
   * The number of the first page of the publication (Caution: this
   * will return the lowest number found in the pages field, since
   * BibTeX allows `7,41,73--97` or `43+`.)
   */
  public $firstpage() {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return this.$text('')
    return this.$text(pages.split(/[-\s,–]/)[0] || '')
  }

  /** The number of the last page of the publication (See the remark on `firstpage`) */
  public $lastpage() {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return this.$text('')
    return this.$text(pages.split(/[-\s,–]/).pop() || '')
  }

  /** Tag number `n`. Mostly for legacy compatibility -- order of tags is undefined */
  public $keyword(n: number) {
    const tag: string | { tag: string} = this.item.getTags()?.[n] || ''
    return this.$text(typeof tag === 'string' ? tag : tag.tag)
  }

  /**
   * The first `n` (default: 3) words of the title, apply capitalization to first `m` (default: 0) of those.
   * @param n number of words to select
   * @param m number of words to capitalize. `0` means no capitalization
   */
  public $shorttitle(n: number = 3, m: number = 0) { // eslint-disable-line no-magic-numbers, @typescript-eslint/no-inferrable-types
    const words = this.titleWords(this.item.title, { skipWords: true, asciiOnly: true})
    if (!words) return this.$text('')

    return this.$text(words.slice(0, n).map((word, i) => i < m ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(' '))
  }

  /**
   * The first `n` words of the title, apply capitalization to first `m` of those
   * @param n number of words to select
   * @param m number of words to capitalize. `0` means no capitalization
   */
  public $veryshorttitle(n: number = 1, m: number = 0) { // eslint-disable-line no-magic-numbers, @typescript-eslint/no-inferrable-types
    return this.$shorttitle(n, m)
  }

  /** The last 2 digits of the publication year */
  public $shortyear() {
    return this.$text(this.format_date(this.item.date, '%y'))
  }

  /** The year of the publication */
  public $year() {
    return this.$text(this.padYear(this.format_date(this.item.date, '%-Y'), 2))
  }

  /**
   * The date of the publication
   * @param format sprintf-style format template
   */
  public $date(format: string = '%Y-%m-%d') { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return this.$text(this.format_date(this.item.date, format))
  }

  /**
   * A pseudo-field from the extra field. eg if you have `Original date: 1970` in your `extra` field, you can get it as
   * `extra(originalDate)`, or `tex.shortauthor: APA` which you could
   * get with `extra('tex.shortauthor')`. Any `tex.` field will be
   * picked up, the other fields can be selected from [this list](https://retorque.re/zotero-better-bibtex/exporting/extra-fields/)
   * of key names.
   * @param variable extra-field line identifier
   */
  public $extra(variable: string) { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const variables = variable.toLowerCase().trim().split(/\s*\/\s*/).filter(varname => varname)
    if (!variables.length) return this.$text('')

    const value = variables
      .map((varname: string) => this.item.extraFields.kv[varname] || this.item.extraFields.tex[varname]?.value || this.item.extraFields.tex[`tex.${varname}`]?.value)
      .find(val => val)
    if (value) return this.$text(value)

    const extra: RegExpMatchArray = (this.item.extra || '')
      .split('\n')
      .map((line: string) => line.match(/^([^:]+):\s*(.+)/i))
      .find(match => match && (variables.includes(match[1].trim().toLowerCase()) || variable.toLowerCase() === match[1].trim().toLowerCase()))
    return this.$text(extra?.[2] || '')
  }


  /** the original year of the publication */
  public $origyear() {
    return this.$text(this.padYear(this.format_date(this.item.date, '%-oY'), 2))
  }

  /** the original date of the publication */
  public $origdate() {
    return this.$text(this.format_date(this.item.date, '%oY-%om-%od'))
  }

  /** the month of the publication */
  public $month() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.$text(this.months[this.item.date.m] || '')
  }

  /** Capitalize all the significant words of the title, and concatenate them. For example, `An awesome paper on JabRef` will become `AnAwesomePaperJabref` */
  public $title() {
    return this.$text((this.titleWords(this.item.title, { skipWords: true }) || []).join(' '))
  }

  /** turn auto-cleaning on/off */
  public $clean(enabled: boolean) {
    this.folding = enabled
    return this
  }

  /**
   * a pseudo-function that sets the citekey disambiguation postfix using an <a href="https://www.npmjs.com/package/sprintf-js">sprintf-js</a> format spec
   * for when a key is generated that already exists. Does not add any text to the citekey otherwise.
   * You *must* include *exactly one* of the placeholders `%(n)s` (number), `%(a)s` (alpha, lowercase) or `%(A)s` (alpha, uppercase).
   * For the rest of the disambiguator you can use things like padding and extra text as sprintf-js allows. With `+1` the disambiguator is always included,
   * even if there is no need for it when no duplicates exist. The default  format is `%(a)s`.
   * @param format sprintf-style format template
   */
  public $postfix(format='%(a)s', start=0) {
    this.postfix = { format, start }
    return this.$text('')
  }

  /**
   * If the length of the output does not match the given number, skip to the next pattern.
   * @param relation comparison operator
   * @param length value to compare length with
   */
  public $len(relation: '<' | '<=' | '=' | '!=' | '>=' | '>' = '>', length=0) {
    return this.len(this.citekey, relation, length).$text('')
  }

  private padYear(year: string, length: number): string {
    return year ? year.replace(/[0-9]+/, y => y.length >= length ? y : (`0000${y}`).slice(-length)): ''
  }

  /**
   * Returns the given text if no output was generated
   * @param text literal text to return
   */
  public _default(text: string) {
    return this.chunk ? this : this.$text(text)
  }

  /**
   * If the length of the output does not match the given number, skip to the next pattern.
   * @param relation comparison operator
   * @param length value to compare length with
   */
  public _len(relation: '<' | '<=' | '=' | '!=' | '>=' | '>' = '>', length=0) {
    return this.len(this.chunk, relation, length)
  }

  /**
   * If the output does not match the given string/regex, skip to the next pattern.
   * @param match regex or string to match. String matches are case-insensitive
   * @param clean   transliterates the current output and removes unsafe characters during matching
   */
  public _match(match: RegExp | string, clean=false) {
    if (!match) return this

    if (typeof match === 'string') {
      const chunk = (clean ? this.clean(this.chunk, true) : this.chunk).toLowerCase()
      match = (clean ? this.clean(match, true) : match).toLowerCase()
      if (chunk.includes(match)) return this
    }
    else if ((clean ? this.clean(this.chunk, true) : this.chunk).match(match)) {
      return this
    }

    throw { next: true } // eslint-disable-line no-throw-literal
  }

  private len(value: string, relation: '<' | '<=' | '=' | '!=' | '>=' | '>', n: number) {
    switch (relation) {
      case '<':
        if (value.length < n) return this
        break
      case '<=':
        if (value.length <= n) return this
        break
      case '=':
        if (value.length === n) return this
        break
      case '!=':
        if (value.length !== n) return this
        break
      case '>':
        if (value.length > n) return this
        break
      case '>=':
        if (value.length >= n) return this
        break
    }
    throw { next: true } // eslint-disable-line no-throw-literal
  }

  /** discards the input */
  public _discard() { // eslint-disable-line @typescript-eslint/no-unused-vars
    return this.$text('')
  }

  /** transforms date/time to local time. Mainly useful for dateAdded and dateModified as it requires an ISO-formatted input. */
  public _localTime() {
    const m = this.chunk.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})[ T]([0-9]{2}):([0-9]{2}):([0-9]{2})Z?$/)
    if (!m) return this
    const date = new Date(`${this.chunk}Z`)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return this.$text(date.toISOString().replace('.000Z', '').replace('T', ' '))
  }

  /**
   * formats date as by replacing y, m and d in the format
   * @param format sprintf-style format template
   */
  public _formatDate(format='%Y-%m-%d') {
    return this.$text(this.format_date(this.chunk, format))
  }

  public format_date(value: string | PartialDate, format: string) {
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
  public _numeric() {
    return this.$text(isNaN(parseInt(this.chunk)) ? '' : this.chunk)
  }

  /**
   * replaces text, case insensitive when passing a string; `.replace('.etal','&etal')` will replace `.EtAl` with `&etal`
   * @param find string or regex to match. String matches are case-insensitive
   * @param replace literal text to replace the match with
   */
  public _replace(find: string | RegExp, replace: string) {
    if (!find) return this
    if (typeof find === 'string') find = new RegExp(find.replace(/[[\](){}*+?|^$.\\]/g, '\\$&'), 'ig')
    return this.$text(this.chunk.replace(find, replace))
  }

  /**
   * replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
   * parameter, e.g `.condense(_)` will replace spaces with underscores. Equivalent to `.replace(/\s+/g, sep)`.
   * @param sep replacement character
   */
  public _condense(sep: string = '') { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return this.$text(this.chunk.replace(/\s+/g, sep))
  }

  /**
   * prefixes with its parameter, so `.prefix(_)` will add an underscore to the front if, and only if, the value
   * it is supposed to prefix isn't empty.
   * @param prefix prefix string
   */
  public _prefix(prefix: string) {
    if (this.chunk && prefix) return this.$text(`${prefix}${this.chunk}`)
    return this
  }

  /**
   * postfixes with its parameter, so `postfix(_)` will add an underscore to the end if, and only if, the value
   * it is supposed to postfix isn't empty
   * @param postfix postfix string
   */
  public _postfix(postfix: string) {
    if (this.chunk && postfix) return this.$text(`${this.chunk}${postfix}`)
    return this
  }

  /**
   * Abbreviates the text. Only the first character and subsequent characters following white space will be included.
   */
  public _abbr() {
    return this.$text(this.chunk.split(/\s+/).map(word => word.substring(0, 1)).join(' '))
  }

  /**
   * Does an acronym lookup for the text.
   * @param list lookup list. The list must be a CSV file and live in the `Zotero/better-bibtex` directory in your Zotero profile, and must use commas as the delimiter.
   */
  public _acronym(list='acronyms') {
    list = list.replace(/\.csv$/i, '')

    try {
      if (!this.acronyms[list]) {
        this.acronyms[list] = csv2dict(OS.Path.join(Zotero.BetterBibTeX.dir, `${list}.csv`))
          .reduce((acc: Record<string, string>, row: Record<string, string>) => {
            row.full = (row.full || '').trim().toLowerCase()
            row.acronym = (row.acronym || '').trim()
            if (row.full && row.acronym) {
              if (acc[row.full]) log.error('acronyms: parsing', list, row, 'duplicate')
              acc[row.full] = row.acronym
            }
            else {
              log.error('acronyms: parsing', list, row, 'incomplete')
            }
            return acc
          }, {} as Record<string, string>)
      }
    }
    catch (err) {
      log.error('error parsing acronym list', list)
      this.acronyms[list] = {}
    }

    return this.$text(this.acronyms[list][this.chunk.toLowerCase()] || this.chunk)
  }

  /** Forces the text inserted by the field marker to be in lowercase. For example, `auth.lower` expands to the last name of the first author in lowercase. */
  public _lower() {
    return this.$text(this.chunk.toLowerCase())
  }

  /** Forces the text inserted by the field marker to be in uppercase. For example, `[auth:upper]` expands the last name of the first author in uppercase. */
  public _upper() {
    return this.$text(this.chunk.toUpperCase())
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
  public _skipwords(/* ...words: string[] */) {
    /*
    let skipWords: Set<string> = new Set([...this.skipWords])

    for (const word of words) {
      if (!word) continue

      if (word === '_') {
        skipWords = new Set
      }
      else if (word[0] === '_') {
        skipWords.delete(word.substr(1))
      }
      else {
        skipWords.add(word)
      }
    }
    */

    return this.$text(this.chunk.split(/\s+/).filter(word => !this.skipWords.has(word.toLowerCase())).join(' ').trim())
  }

  /**
   * selects words from the value passed in. The format is `select(start,number)` (1-based), so `select(1,4)` or `select(n=4)`
   * would select the first four words. If `n` is not given, all words from `start` to the end are
   * selected.
   * @param start first word to select (1-based)
   * @param n number of words to select. Default is all.
   */
  public _select(start: number = 1, n?: number) { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const values = this.chunk.split(/\s+/)
    let end = values.length

    if (start === 0) start = 1

    if (start < 0) {
      start = end + start
    }
    else {
      start -= 1
    }

    if (typeof n !== 'undefined') {
      if (n < 1) n = 1
      end = start + n
    }

    return this.$text(values.slice(start, end).join(' '))
  }

  /**
   * `substring(start,n)` selects `n` (default: all) characters starting at `start`
   * @param start starting character (1-based)
   * @param n number of characters to select (default: remainder from `start`)
   */
  public _substring(start: number = 1, n?: number) { // eslint-disable-line @typescript-eslint/no-inferrable-types
    if (typeof n === 'undefined') n = this.chunk.length

    return this.$text(this.chunk.slice(start - 1, (start - 1) + n))
  }

  /** removes all non-ascii characters */
  public _ascii() {
    return this.$text(this.chunk.replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim())
  }

  /** clears out everything but unicode alphanumeric characters (unicode character classes `L` and `N`) */
  public _alphanum() {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.$text(Zotero.Utilities.XRegExp.replace(this.chunk, this.re.alphanum, '', 'all').split(/\s+/).join(' ').trim())
  }

  /**
   * tries to replace diacritics with ascii look-alikes. Removes non-ascii characters it cannot match
   * @param mode specialized folding modes for german, japanese or chinese
   */
  public _fold(mode?: 'german' | 'japanese' | 'chinese') {
    return this.$text(this.transliterate(this.chunk, mode).split(/\s+/).join(' ').trim())
  }

  /** uppercases the first letter of each word */
  public _capitalize() {
    return this.$text(this.chunk.replace(/((^|\s)[a-z])/g, m => m.toUpperCase()))
  }

  /** Removes punctuation */
  public _nopunct(dash='-') {
    let value = Zotero.Utilities.XRegExp.replace(this.chunk, this.re.dash, dash, 'all')
    value = Zotero.Utilities.XRegExp.replace(value, this.re.punct, '', 'all')
    return this.$text(value)
  }

  /** Removes punctuation and word-connecting dashes. alias for `nopunct(dash='')` */
  public _nopunctordash() {
    return this._nopunct('')
  }

  /** Treat ideaographs as individual words */
  public _splitIdeographs() {
    return this.$text(this.chunk.replace(script.han, ' $1 ').trim())
  }

  /** word segmentation for Chinese items. Uses substantial memory; must be enabled under Preferences -> Better BibTeX -> Advanced -> Citekeys */
  public _jieba() {
    if (!Preference.jieba) return this
    return this.$text(jieba.cut(this.chunk).join(' ').trim())
  }

  /** word segmentation for Japanese items. Uses substantial memory; must be enabled under Preferences -> Better BibTeX -> Advanced -> Citekeys */
  public _kuromoji() {
    if (!Preference.kuroshiro || !kuroshiro.enabled) return this
    return this.$text(kuroshiro.tokenize(this.chunk || '').join(' ').trim())
  }

  /** transliterates the citation key and removes unsafe characters */
  public _clean() {
    if (!this.chunk) return this
    return this.$text(this.clean(this.chunk, true))
  }

  /**
   * transliterates the citation key. If you don't specify a mode, the mode is derived from the item language field
   * @param mode specialized translateration modes for german, japanese or chinese. default is minimal
   */
  public _transliterate(mode?: 'minimal' | 'german' | 'de' | 'japanese' | 'ja' | 'zh' | 'chinese') {
    if (!this.chunk) return this
    return this.$text(this.transliterate(this.chunk, mode))
  }

  private transliterate(str: string, mode?: 'minimal' | 'de' | 'german' | 'ja' | 'japanese' | 'zh' | 'chinese'): string {
    mode = mode || this.item.transliterateMode || 'japanese'

    let replace: Record<string, string> = {}
    switch (mode) {
      case 'minimal':
        break

      case 'de':
      case 'german':
        replace = {
          '\u00E4': 'ae', // eslint-disable-line quote-props
          '\u00F6': 'oe', // eslint-disable-line quote-props
          '\u00FC': 'ue', // eslint-disable-line quote-props
          '\u00C4': 'Ae', // eslint-disable-line quote-props
          '\u00D6': 'Oe', // eslint-disable-line quote-props
          '\u00DC': 'Ue', // eslint-disable-line quote-props
        }
        break

      case 'zh':
      case 'chinese':
        if (Preference.kuroshiro && kuroshiro.enabled) str = pinyin(str)
        break

      case 'ja':
      case 'japanese':
        if (Preference.kuroshiro && kuroshiro.enabled) str = kuroshiro.convert(str, {to: 'romaji'})
        break

      default:
        throw new Error(`Unsupported fold mode "${mode}"`)
    }

    str = transliterate(str || '', {
      unknown: '\uFFFD', // unicode replacement char
      replace,
    })

    str = fold2ascii.foldMaintaining(str)

    return str
  }

  private clean(str: string, allow_spaces = false): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Utilities.XRegExp.replace(this.transliterate(str), allow_spaces ? this.re.unsafechars_allow_spaces : this.re.unsafechars, '', 'all').trim()
  }

  private titleWords(title, options: { asciiOnly?: boolean, skipWords?: boolean} = {}): string[] {
    if (!title) return null

    title = this.innerText(title)

    log.debug('titleWords', { options, folding: this.folding, kuroshiro: Preference.kuroshiro && kuroshiro.enabled})
    if (this.folding && options.asciiOnly && Preference.kuroshiro && kuroshiro.enabled) title = kuroshiro.convert(title, {to: 'romaji', mode: 'spaced'})

    // 551
    let words: string[] = (Zotero.Utilities.XRegExp.matchChain(title, [this.re.word])
      .map((word: string) => (this.folding && options.asciiOnly ? this.clean(word) : word).replace(/-/g, '')))
      .filter((word: string) => word)

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

  private initials(creator, all=true) {
    if (!creator.firstName) return ''

    const firstName = this.stripQuotes(creator.firstName)

    let initials: string
    let m
    if (m = firstName.match(/(.+)\u0097/)) {
      initials = m[1]
    }
    else if (all) {
      initials = firstName
    }
    else {
      initials = firstName[0]
    }

    initials = Zotero.Utilities.XRegExp.replace(initials, this.re.caseNotUpperTitle, '', 'all')
    initials = this.transliterate(initials)
    initials = Zotero.Utilities.XRegExp.replace(initials, this.re.caseNotUpper, '', 'all')
    return initials
  }

  private creators(onlyEditors, template: string): string[] {
    const types = itemCreators[client][this.item.itemType] || []
    const primary = types[0]

    const creators: Record<string, string[]> = {}

    for (const creator of this.item.creators) {
      if (onlyEditors && creator.creatorType !== 'editor' && creator.creatorType !== 'seriesEditor') continue

      const name = sprintf(template, {
        f: this.stripQuotes(this.innerText(creator.lastName || creator.name)),
        g: this.stripQuotes(this.innerText(creator.firstName || '')),
        I: this.initials(creator),
        i: this.initials(creator, false),
      })
      log.debug('creator template:', template, name)
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

  public toString() {
    this.citekey += this.chunk
    return this.chunk
  }
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Formatter = new PatternFormatter // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
