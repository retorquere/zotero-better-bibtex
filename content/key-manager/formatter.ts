import type { Tag, RegularItem as SerializedRegularItem, Item as SerializedItem } from '../../gen/typings/serialized-item'

import * as client from '../../content/client'

import nlp from 'compromise/one'
interface Term {
  text: string
  normal: string
  pre: string
  post: string
}

import { Events } from '../events'

import { log } from '../logger'
import fold2ascii from 'fold-to-ascii'
import rescape from '@stdlib/utils-escape-regexp-string'
import ucs2decode = require('punycode2/ucs2/decode')

import { Preference } from '../prefs'
import { JournalAbbrev } from '../journal-abbrev'
import * as Extra from '../extra'
import { buildCiteKey as zotero_buildCiteKey } from '../../gen/ZoteroBibTeX.mjs'
import { babelLanguage, CJK } from '../text'
import { fetchSync as fetchInspireHEP } from '../inspire-hep'

import { compile, broken } from './compile'
import * as DateParser from '../dateparser'

import itemCreators from '../../gen/items/creators.json'
import * as items from '../../gen/items/items'
import { ZoteroItemType } from '../../gen/items/items'

import { parseFragment } from 'parse5'

import { sprintf } from 'sprintf-js'

import { chinese } from './chinese'
import { kuroshiro } from './japanese'
import { transliterate as arabic } from './arabic'
import { transliterate } from 'transliteration/dist/node/src/node/index'
import { ukranian, mongolian, russian } from './cyrillic'

import { listsync as csv2list } from '../load-csv'

import BabelTag from '../../gen/babel/tag.json'
type ValueOf<T> = T[keyof T]
type BabelLanguageTag = ValueOf<typeof BabelTag>
type BabelLanguage = keyof typeof BabelTag

class Template<K> extends String {} // eslint-disable-line @typescript-eslint/no-unused-vars

function skip() {
  throw { next: true } // eslint-disable-line @typescript-eslint/only-throw-error
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
    y?: number | string
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
        parsed.m = reparsed.month || undefined
        parsed.d = reparsed.day || undefined
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
      throw new Error(`Unexpected parsed date ${ JSON.stringify(v) } => ${ JSON.stringify(date) }`)
  }

  const res: PartialDate = {}

  res.m = (typeof parsed.m !== 'undefined') ? (`${ parsed.m }`) : ''
  res.d = (typeof parsed.d !== 'undefined') ? (`${ parsed.d }`) : ''
  res.y = (typeof parsed.y === 'number') ? (`${ parsed.y % 100 }`) : (parsed.y || '')
  res.Y = (typeof parsed.y !== 'undefined') ? (`${ parsed.y }`) : ''
  res.om = (typeof parsed.om !== 'undefined') ? (`${ parsed.om }`) : ''
  res.od = (typeof parsed.od !== 'undefined') ? (`${ parsed.od }`) : ''
  res.oy = (typeof parsed.oy !== 'undefined') ? (`${ parsed.oy % 100 }`) : ''
  res.oY = (typeof parsed.oy !== 'undefined') ? (`${ parsed.oy }`) : ''
  if (date.type !== 'verbatim') {
    const [ , H, M, S ] = v.match(/(?: |T)([0-9]{2}):([0-9]{2})(?::([0-9]{2}))?(?:[A-Z]+|[-+][0-9]+)?$/) || [ null, '', '', '' ]
    Object.assign(res, { H, M, S })
    res.S = res.S || ''
  }
  else {
    Object.assign(res, { H: '', M: '', S: '' })
  }

  return res
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

export type AuthorType = 'author' | 'editor' | 'translator' | 'collaborator' | '*'
export type CreatorType =
  'primary'
  | 'artist' | '-artist'
  | 'attorneyAgent' | '-attorneyAgent'
  | 'author' | '-author'
  | 'bookAuthor' | '-bookAuthor'
  | 'cartographer' | '-cartographer'
  | 'castMember' | '-castMember'
  | 'commenter' | '-commenter'
  | 'composer' | '-composer'
  | 'contributor' | '-contributor'
  | 'cosponsor' | '-cosponsor'
  | 'counsel' | '-counsel'
  | 'director' | '-director'
  | 'editor' | '-editor'
  | 'guest' | '-guest'
  | 'interviewee' | '-interviewee'
  | 'interviewer' | '-interviewer'
  | 'inventor' | '-inventor'
  | 'performer' | '-performer'
  | 'podcaster' | '-podcaster'
  | 'presenter' | '-presenter'
  | 'producer' | '-producer'
  | 'programmer' | '-programmer'
  | 'recipient' | '-recipient'
  | 'reviewedAuthor' | '-reviewedAuthor'
  | 'scriptwriter' | '-scriptwriter'
  | 'seriesEditor' | '-seriesEditor'
  | 'sponsor' | '-sponsor'
  | 'testimonyBy' | '-testimonyBy'
  | 'translator' | '-translator'
  | 'wordsBy' | '-wordsBy'
// const creatorTypes: CreatorType[] = Object.keys(itemCreators[client.slug]) as CreatorType[]
export type CreatorTypeArray = CreatorType[]
export type CreatorTypeOrAll = CreatorType | '*'
export type CreatorTypeCollection = CreatorTypeOrAll[][]

type Creator = { lastName?: string; firstName?: string; name?: string; creatorType: string; fieldMode?: number; source?: string }

class Item {
  public item: Zotero.Item | SerializedItem
  private language = ''

  public itemType: string
  public date: PartialDate
  public creators: Creator[]
  public title: string
  public itemID: number
  public itemKey: string
  public key: string
  public id: number
  public libraryID: number
  public transliterateMode: 'german' | 'japanese' | 'chinese' | 'chinese-traditional' | 'arabic' | 'ukranian' | 'mongolian' | 'russian' | ''
  public getField: (name: string) => number | string
  public extra: string
  public extraFields: Extra.Fields

  constructor(item: Zotero.Item | SerializedItem) { // Item must have simplifyForExport pre-applied, without scrubbing
    this.item = item

    if ((item as Zotero.Item).getField) {
      this.itemID = this.id = (item as Zotero.Item).id
      this.itemKey = this.key = (item as Zotero.Item).key
      this.itemType = Zotero.ItemTypes.getName((item as Zotero.Item).itemTypeID)
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
            return (this.item as Zotero.Item).getField(name, false, true) || this.extraFields?.kv[name] || ''
        }
      }
      this.creators = (item as Zotero.Item).getCreatorsJSON()
      this.libraryID = item.libraryID
      this.title = (item as Zotero.Item).getField('title', false, true)
    }
    else {
      this.itemType = (item as SerializedRegularItem).itemType
      this.itemID = this.id = (item as SerializedRegularItem).itemID
      this.itemKey = this.key = (item as SerializedRegularItem).itemKey
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

      case 'zh-hant':
        this.transliterateMode = 'chinese-traditional'
        break

      case 'ar':
        this.transliterateMode = 'arabic'
        break

      case 'uk':
        this.transliterateMode = 'ukranian'
        break

      case 'mn':
        this.transliterateMode = 'mongolian'
        break

      case 'ru':
        this.transliterateMode = 'russian'
        break

      default:
        this.transliterateMode = ''
        break
    }

    const extraFields = Extra.get(this.getField('extra') as string, 'zotero', { kv: true, tex: true })
    this.extra = extraFields.extra
    this.extraFields = extraFields.extraFields

    for (const [ creatorType, creators ] of Object.entries(this.extraFields.creator || {})) {
      this.creators = this.creators.concat(creators.map(creator => Extra.zoteroCreator(creator, creatorType)))
    }
    for (const creator of this.creators) {
      creator.lastName = creator.lastName || creator.name
    }

    try {
      const date = this.getField('date')
      this.date = date ? parseDate(date) : {}
    }
    catch {
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

  public getTags(): Tag[] {
    return (this.item as Zotero.Item).getTags ? (this.item as Zotero.Item).getTags() : (this.item as SerializedRegularItem).tags
  }
}

const page_range_splitter = /[-\s,\u2013]/

export class PatternFormatter {
  public citekey = ''

  public generate: () => string
  public postfix = {
    offset: 0,
    template: '%(a)s',
    marker: '\x1A',
  }

  private re = {
    unsafechars_allow_spaces: /\s/g,
    unsafechars: /\s/g,
    alphanum: Zotero.Utilities.XRegExp('[^\\p{L}\\p{N}]'),
    punct: Zotero.Utilities.XRegExp('\\p{Pe}|\\p{Pf}|\\p{Pi}|\\p{Po}|\\p{Ps}', 'g'),
    dash: Zotero.Utilities.XRegExp('\\p{Pd}|\u2500|\uFF0D|\u2015', 'g'), // additional pseudo-dashes from #1880
    caseNotUpperTitle: Zotero.Utilities.XRegExp('[^\\p{Lu}\\p{Lt}]', 'g'),
    caseNotUpper: Zotero.Utilities.XRegExp('[^\\p{Lu}]', 'g'),
    // word: Zotero.Utilities.XRegExp('[\\p{L}\\p{Nd}\\p{Pc}\\p{M}]+(-[\\p{L}\\p{Nd}\\p{Pc}\\p{M}]+)*', 'g'),
  }

  private acronyms: Record<string, Record<string, string>> = {}

  /*
   * three-letter month abbreviations. I assume these are the same ones that the
   * docs say are defined in some appendix of the LaTeX book. (I don't have the
   * LaTeX book.)
  */
  private months = { 1: 'jan', 2: 'feb', 3: 'mar', 4: 'apr', 5: 'may', 6: 'jun', 7: 'jul', 8: 'aug', 9: 'sep', 10: 'oct', 11: 'nov', 12: 'dec' }

  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match

  private item: Item

  private skipWords: Set<string>

  constructor() {
    Events.on('preference-changed', pref => {
      switch (pref) {
        case 'citekeyFormat':
          this.acronyms = {}
          break
      }
    })
  }

  public test(formula: string): string {
    try {
      compile(formula)
    }
    catch (err) {
      return err.message as string
    }
    return ''
  }

  // private fold: boolean
  public update(formulas: string[]): string {
    const unsafechars = rescape(Preference.citekeyUnsafeChars + '\uFFFD')
    this.re.unsafechars_allow_spaces = new RegExp(`[${ unsafechars }]`, 'g')
    this.re.unsafechars = new RegExp(`[${ unsafechars }\\s]`, 'g')
    this.skipWords = new Set(Preference.skipWords.split(',').map((word: string) => word.trim().toLowerCase()).filter((word: string) => word))

    let error = ''
    const ts = Date.now()
    // the zero-width-space is a marker to re-save the current default so it doesn't get replaced when the default changes later, which would change new keys suddenly
    for (const formula of [ ...formulas, Preference.default.citekeyFormat ]) {
      log.info(`formula-update: ${ ts } trying: ${ formula }`)
      if (!formula) continue

      try {
        this.$postfix()
        const formatter = compile(formula, { logging: Preference.testing })
        log.info('formula:', formula, '=>\n', formatter)
        this.generate = (new Function(formatter) as () => string)
        Preference.citekeyFormat = broken(formula) // upgrade to semicolons
        if (!Preference.citekeyFormatEditing) Preference.citekeyFormatEditing = Preference.citekeyFormat
        return error
      }
      catch (err) {
        if (!error) error = err.message
        log.error('CitekeyFormatter.update: Error parsing citekeyFormat ', formula)
        log.error(err, err.location)
      }
    }

    // we should never get here
    log.error('CitekeyFormatter.update: no formula?!')
    return `failed to install citekey formula: ${ error }`.trim()
  }

  public format(item: Zotero.Item | SerializedItem): string {
    this.item = new Item(item)

    switch (this.item.itemType) {
      case 'attachment':
      case 'note':
      case 'annotation':
        return ''
    }

    this.$postfix()
    let citekey = this.generate()
    log.info('formula: made', { citekey })
    if (citekey && Preference.citekeyFold) citekey = this.transliterate(citekey)
    citekey = citekey.replace(this.re.unsafechars, '')
    if (!citekey.includes(this.postfix.marker)) citekey += this.postfix.marker
    return citekey
  }

  /**
   * Without arguments, returns the item type.
   * When arguments as passed, tests whether the item is of any of the given types, and skips to the next pattern if not, eg `type(book) + veryshorttitle | auth + year`.
   * @param allowed one or more item type names
   */
  public $type(...allowed: ZoteroItemType[]): string {
    if (!allowed.length) return this.item.itemType

    if (!allowed.map(type => type.toLowerCase()).includes(this.item.itemType.toLowerCase())) skip()
    return ''
  }

  public $$type(...allowed: ZoteroItemType[]): string {
    this.$type(...allowed)
    return '$$allowed'
  }

  /**
   * Tests whether the item has the given language set, and skips to the next pattern if not
   * @param name one or more language codes
   */
  public $language(...name: (BabelLanguage | BabelLanguageTag)[]): string {
    if (!name.concat(name.map(n => BabelTag[n] as string).filter(n => n)).includes(this.item.babelTag())) skip()
    return ''
  }
  public $$language(...name: (BabelLanguage | BabelLanguageTag)[]): string {
    this.$language(...name)
    return '$$language'
  }

  /**
   * Generates citation keys as the stock Zotero Bib(La)TeX export
   * does. Note that this pattern inherits all the problems of the
   * original Zotero citekey generation -- you should really only
   * use this if you have existing papers that rely on this behavior.
   */
  public $zotero(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    this.$postfix('-%(n)s')
    return zotero_buildCiteKey({
      creators: this.item.creators,
      title: this.item.getField('title'),
      date: this.item.getField('date'),
      dateAdded: this.item.getField('dateAdded'),
    }, null, {}) as string
  }

  /**
   * returns the internal item ID/key
   * @param id 'id': return itemID; 'key': return the item key
   */
  public $item(id: 'id' | 'key' = 'key'): string {
    return id === 'id' ? `${ this.item.itemID }` : this.item.itemKey
  }

  /**
   * Fetches the key from inspire-hep based on DOI or arXiv ID
   */
  public $inspireHep(): string {
    try {
      return fetchInspireHEP(this.item) || ''
    }
    catch (err) {
      log.error('inspire-hep returned an error:', err)
      skip()
    }
  }

  /**
   * Gets the value of the item field
   * @param name name of the field
   */
  public $field(name: string): string {
    const field = items.name.field[name.replace(/ /g, '').toLowerCase()]
    if (!field) throw new Error(`Unknown item field ${ name }`)

    const value = this.item.getField(field)
    switch (typeof value) {
      case 'number':
        return `${value}`
      case 'string':
        return this.innerText(value)
      case 'undefined':
        return ''
      default:
        throw new Error(`Unexpected value ${ JSON.stringify(value) } of type ${ typeof value } for item field ${ name }`)
    }
  }

  /** Tests whether the item is in the user library */
  public $library(): string {
    if (this.item.libraryID !== Zotero.Libraries.userLibraryID) skip()
    return ''
  }
  public $$library(): string {
    this.$library()
    return '$$library'
  }

  /**
   * Tests whether the item is in the given group library
   * @param name group name
   */
  public $group(name: string): string {
    let group
    if (this.item.libraryID === Zotero.Libraries.userLibraryID) skip()
    if ((group = Zotero.Libraries.get(this.item.libraryID)) && (group.name !== name)) skip()
    return ''
  }
  public $$group(name: string): string {
    this.$group(name)
    return '$$group'
  }

  /**
   * Author/editor information.
   * @param n       select the first `n` creators (when passing a number) or the authors in this range (inclusive, when passing two values); negative numbers mean "from the end", default = 0 = all
   * @param type    select only creators of given type(s). Default: all
   * @param name    sprintf-js template. Available named parameters are: `f` (family name), `g` (given name), `i` (initials)
   * @param etal    use this term to replace authors after `n` authors have been named
   * @param sep     use this character between authors
   * @param min     skip to the next pattern if there are less than `min` creators, 0 = ignore
   * @param max     skip to the next pattern if there are more than `max` creators, 0 = ignore
   */
  public $creators(
    n: number | [number, number] = 0,
    type: CreatorType | CreatorTypeArray | CreatorTypeCollection | '*' = [[ 'primary', 'editor', 'translator', '*' ]],
    name: Template<'creator'> = '%(f)s',
    etal = '',
    sep = ' ',
    min = 0,
    max = 0
  ): string {
    const include: string[] = []
    const exclude: string[] = []
    const primary = itemCreators[client.slug][this.item.itemType][0]

    const types = this.item.creators.map(cr => cr.creatorType)
    if (typeof type === 'string') {
      include.push({ '*': types[0], primary }[type] || type)
    }
    else {
      for (let t of type) {
        if (Array.isArray(t)) t = t.map(candidate => ({ '*': types[0], primary }[candidate] || candidate) as CreatorType).find(candidate => types.includes(candidate))
        if (!t) continue;
        (t[0] === '-' ? exclude : include).push((t as string).replace(/^-/, ''))
      }
    }

    let creators = this.item.creators
      .filter(cr => !include.length || include.includes(cr.creatorType as CreatorType))
      .filter(cr => !exclude.length || !exclude.includes(cr.creatorType as CreatorType))
      .map(cr => this.name(cr, name as string))

    if ((min && creators.length < min) || (max && creators.length > max)) skip()

    if (!n) {
      etal = ''
    }
    else {
      if (Array.isArray(n)) {
        etal = ''
      }
      else {
        if (n >= creators.length) etal = ''
        n = [ 1, n ]
      }
      creators = creators.slice(n[0] - 1, n[1])
      if (etal && !etal.replace(/[a-z]/ig, '').length) etal = `${ sep }${ etal }`
    }
    return creators.join(sep) + etal
  }
  public $$creators(
    n: number | [number, number] = 0,
    type: CreatorType | CreatorTypeArray | CreatorTypeCollection | '*' = [[ 'primary', 'editor', 'translator', '*' ]],
    name: Template<'creator'> = '%(f)s',
    etal = '',
    sep = ' ',
    min = 0,
    max = 0
  ): string {
    this.$$creators(n, type, name, etal, sep, min, max)
    return '$$creators'
  }

  /**
   * The last names of the first `n` (default: all) authors.
   * @param n         the number of characters to take from the name, 0 = all
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep       use this character between authors
   */
  public $authorsn(n = 0, creator: AuthorType = '*', initials = false, sep = ' '): string {
    let name = '%(f)s'
    if (initials) name += '%(I)s'
    let author = this.creators(creator, name)
    if (n && n < author.length) author = author.slice(0, n).concat('EtAl')
    return author.join(sep)
  }

  /**
   * The first `n` (default: all) characters of the `m`th (default: first) author's last name.
   * @param n         the number of characters to take from the name, 0 = all
   * @param m         select the `m`th author
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   */
  public $auth(n = 0, m = 1, creator: AuthorType = '*', initials = false): string {
    const family = n ? `%(f).${ n }s` : '%(f)s'
    const name = initials ? `${ family }%(I)s` : family
    const author: string = this.creators(creator, name)[m - 1] || ''
    return author
  }

  /**
   * The given-name initial of the first author.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   */
  public $authForeIni(creator: AuthorType = '*'): string {
    const author: string = this.creators(creator, '%(I)s')[0] || ''
    return author
  }

  /**
   * The given-name initial of the last author.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   */
  public $authorLastForeIni(creator: AuthorType = '*'): string {
    const authors = this.creators(creator, '%(I)s')
    const author = authors[authors.length - 1] || ''
    return author
  }

  /**
   * The last name of the last author
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   */
  public $authorLast(creator: AuthorType = '*', initials = false): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    const author = authors[authors.length - 1] || ''
    return author
  }

  /**
   * Corresponds to the BibTeX style "alpha". One author: First three letters of the last name. Two to four authors: First letters of last names concatenated.
   * More than four authors: First letters of last names of first three authors concatenated. "+" at the end.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authorsAlpha(creator: AuthorType = '*', initials = false, sep = ' '): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''

    switch (authors.length) {
      case 1:
        return authors[0].substring(0, 3)

      case 2:
      case 3:
      case 4:
        return authors.map(auth => auth.substring(0, 1)).join(sep)
    }

    return `${ authors.slice(0, 3).map(auth => auth.substring(0, 1)).join(sep) }+`
  }

  /**
   * The beginning of each author's last name, using no more than `n` characters (0 = all).
   * @param n         the number of characters to take from the name, 0 = all
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authIni(n = 0, creator: AuthorType = '*', initials = false, sep = '.'): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''
    return authors.map(auth => auth.substring(0, n)).join(sep)
  }

  /**
   * The first 5 characters of the first author's last name, and the last name initials of the remaining authors.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authorIni(creator: AuthorType = '*', initials = false, sep = '.'): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''
    const firstAuthor = authors.shift()

    return [firstAuthor.substring(0, 5)].concat(authors.map(name => name.substring(0, 1)).join(sep)).join(sep)
  }

  /**
   * The last name of the first two authors, and ".ea" if there are more than two.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authAuthEa(creator: AuthorType = '*', initials = false, sep = '.'): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''

    return authors.slice(0, 2).concat(authors.length > 2 ? ['ea'] : []).join(sep)
  }

  /**
   * The last name of the first author, and the last name of the
   * second author if there are two authors or "EtAl" if there are
   * more than two. This is similar to `auth.etal`. The difference
   * is that the authors are not separated by "." and in case of
   * more than 2 authors "EtAl" instead of ".etal" is appended.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authEtAl(creator: AuthorType = '*', initials = false, sep = ' '): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''

    return authors.length === 2
      ? authors.join(sep)
      : authors.slice(0, 1).concat(authors.length > 1 ? ['EtAl'] : []).join(sep)
  }

  /**
   * The last name of the first author, and the last name of the second author if there are two authors or ".etal" if there are more than two.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authEtal2(creator: AuthorType = '*', initials = false, sep = '.'): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')
    if (!authors.length) return ''

    return authors.length === 2
      ? authors.join(sep)
      : authors.slice(0, 1).concat(authors.length > 1 ? ['etal'] : []).join(sep)
  }

  /**
   * The last name if one author/editor is given; the first character
   * of up to three authors' last names if more than one author is
   * given. A plus character is added, if there are more than three
   * authors.
   * @param creator   kind of creator to select, `*` selects `author` first, and if not present, `editor`, `translator` or `collaborator`, in that order.
   * @param initials  add author initials
   * @param sep     use this character between authors
   */
  public $authshort(creator: AuthorType = '*', initials = false, sep = '.'): string {
    const authors = this.creators(creator, initials ? '%(f)s%(I)s' : '%(f)s')

    switch (authors.length) {
      case 0:
        return ''

      case 1:
        return authors[0]
    }
    return authors.slice(0, 3).map(auth => auth.substring(0, 1)).join(sep) + (authors.length > 3 ? '+' : '')
  }

  /**
   * returns the journal abbreviation, or, if not found, the journal title, If 'automatic journal abbreviation' is enabled in the BBT settings,
   * it will use the same abbreviation filter Zotero uses in the wordprocessor integration. You might want to use the `abbr` filter on this.
   * Abbreviation behavior can be specified as `abbrev+auto` (the default) which uses the explicit journal abbreviation if present, and tries the automatic
   * abbreviator if not (if auto-abbrev is enabled in the preferences), `auto` (skip explicit journal abbreviation even if present), `abbrev`
   * (no auto-abbrev even if it is enabled in the preferences) or `full`/`off` (no abbrevation).
   * @param abbrev abbreviation mode
   */
  public $journal(abbrev: 'abbrev+auto' | 'abbrev' | 'auto' | 'full' | 'off' = 'abbrev+auto'): string {
    // this.item.item is the native item stored inside the this.item sorta-proxy
    return ((abbrev === 'off' || abbrev === 'full') ? '' : JournalAbbrev.get(this.item.item, abbrev)) || this.item.getField('publicationTitle') as string || ''
  }

  /**
   * The number of the first page of the publication (Caution: this
   * will return the lowest number found in the pages field, since
   * BibTeX allows `7,41,73--97` or `43+`.)
   */
  public $firstpage(): string {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return ''
    return pages.split(page_range_splitter)[0] || ''
  }

  /** The number of the last page of the publication (See the remark on `firstpage`) */
  public $lastpage(): string {
    const pages: string = this.item.getField('pages') as string
    if (!pages) return ''
    return pages.split(page_range_splitter).pop() || ''
  }

  /** Tag number `n`. Mostly for legacy compatibility
   * @param n position of tag to get
   */
  public $keyword(n: number): string {
    const tag: string | { tag: string } = this.item.getTags()?.slice().sort()[n] || ''
    return typeof tag === 'string' ? tag : tag.tag
  }

  /**
   * The first `n` (default: 3) words of the title, apply capitalization to first `m` (default: 0) of those.
   * @param n number of words to select
   * @param m number of words to capitalize. `0` means no words will be capitalized. Mind that existing capitals are not removed. If you enable capitalization, you also get transliteration; for CJK, capitalization is not meaningful, so if you want capitalization, BBT romanizes first.
   */
  public $shorttitle(n: number = 3, m: number = 0): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const words = this.titleWords(this.item.title, { skipWords: true, nopunct: true, transliterate: m > 0 })
    if (!words) return ''

    return words.slice(0, n).map((word, i) => i < m ? word.charAt(0).toUpperCase() + word.slice(1) : word).join(' ')
  }

  /**
   * The first `n` words of the title, apply capitalization to first `m` of those
   * @param n number of words to select
   * @param m number of words to capitalize. `0` means no words will be capitalized. Mind that existing capitals are not removed.
   */
  public $veryshorttitle(n: number = 1, m: number = 0): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return this.$shorttitle(n, m)
  }

  /** The last 2 digits of the publication year */
  public $shortyear(): string {
    return this.format_date(this.item.date, '%y')
  }

  /** The year of the publication */
  public $year(): string {
    return this.padYear(this.format_date(this.item.date, '%-Y'), 2)
  }

  /**
   * The date of the publication
   * @param format sprintf-style format template
   */
  public $date(format: string = '%Y-%m-%d'): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return this.format_date(this.item.date, format)
  }

  /**
   * A pseudo-field from the extra field. eg if you have `Original date: 1970` in your `extra` field, you can get it as
   * `extra(originalDate)`, or `tex.shortauthor: APA` which you could
   * get with `extra('tex.shortauthor')`. Any `tex.` field will be
   * picked up, the other fields can be selected from [this list](https://retorque.re/zotero-better-bibtex/exporting/extra-fields/)
   * of key names.
   * @param variable extra-field line identifier
   */
  public $extra(variable: string): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const variables = variable.toLowerCase().trim().split(/\s*\/\s*/).filter(varname => varname)
    if (!variables.length) return ''

    const value = variables
      .map((varname: string) => this.item.extraFields.kv[varname] || this.item.extraFields.tex[varname]?.value || this.item.extraFields.tex[`tex.${ varname }`]?.value)
      .find(val => val)
    if (value) return value

    const extra: RegExpMatchArray = (this.item.extra || '')
      .split('\n')
      .map((line: string) => line.match(/^([^:]+):\s*(.+)/i))
      .find(match => match && (variables.includes(match[1].trim().toLowerCase()) || variable.toLowerCase() === match[1].trim().toLowerCase()))
    return extra?.[2] || ''
  }

  /** the original year of the publication */
  public $origyear(): string {
    return this.padYear(this.format_date(this.item.date, '%-oY'), 2)
  }

  /** the original date of the publication */
  public $origdate(): string {
    return this.format_date(this.item.date, '%oY-%om-%od')
  }

  /** the month of the publication */
  public $month(): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return this.months[this.item.date.m] || ''
  }

  /** Capitalize all the significant words of the title, and concatenate them. For example, `An awesome paper on JabRef` will become `AnAwesomePaperJabref` */
  public $title(): string {
    return (this.titleWords(this.item.title, { skipWords: true, nopunct: true }) || []).join(' ')
  }

  /**
   * a pseudo-function that sets the citekey disambiguation infix using an <a href="https://www.npmjs.com/package/sprintf-js">sprintf-js</a> format spec
   * for when a key is generated that already exists. The infix charachter appears at the place of this function of the formula instead of at the and (as postfix does).
   * You *must* include *exactly one* of the placeholders `%(n)s` (number), `%(a)s` (alpha, lowercase) or `%(A)s` (alpha, uppercase).
   * For the rest of the disambiguator you can use things like padding and extra text as sprintf-js allows. With start set to `1` the disambiguator is always included,
   * even if there is no need for it when no duplicates exist. The default  format is `%(a)s`.
   * @param format sprintf-style format template
   * @param start start value for postfix
   */
  public $infix(format = '%(a)s', start = 0): string {
    this.postfix.template = format
    this.postfix.offset = start
    return this.postfix.marker
  }

  /**
   * a pseudo-function that sets the citekey disambiguation postfix using an <a href="https://www.npmjs.com/package/sprintf-js">sprintf-js</a> format spec
   * for when a key is generated that already exists. Does not add any text to the citekey otherwise.
   * You *must* include *exactly one* of the placeholders `%(n)s` (number), `%(a)s` (alpha, lowercase) or `%(A)s` (alpha, uppercase).
   * For the rest of the disambiguator you can use things like padding and extra text as sprintf-js allows. With start set to `1` the disambiguator is always included,
   * even if there is no need for it when no duplicates exist. The default  format is `%(a)s`.
   * @param format sprintf-style format template
   * @param start start value for postfix
   */
  public $postfix(format: Template<'postfix'> = '%(a)s', start = 0): string {
    this.postfix.template = format as string
    this.postfix.offset = start
    return ''
  }

  /**
   * This will return a comma-separated list of creator type information for all creators on the item
   * in the form `<1 or 2><creator-type>`, where `1` or `2` denotes a 1-part or 2-part creator, and `creator-type` is one of {{% citekey-formatters/creatortypes %}}, or `primary` for
   * the primary creator-type of the Zotero item under consideration. The list is prefixed by the item type, so might look like `audioRecording:2performer,2performer,1composer`.
   * @param match  Regex to test the creator-type list. When passed, and the creator-type list does not match the regex, jump to the next formule. When it matches, return nothing but stay in the current formule. When no regex is passed, output the creator-type list for the item (mainly useful for debugging).
   */
  public $creatortypes(match?: RegExp): string {
    const creators = [...(new Set([ '', (itemCreators[client.slug][this.item.itemType] || [])[0] || '' ]))].sort() // this will shake out duplicates and put the empty string first
      .map(primary => (this.item.creators || []).map(cr => `${ typeof cr.name === 'string' ? 1 : 2 }${ cr.creatorType === primary ? 'primary' : cr.creatorType }`).join(';'))
      .map(cr => `${ this.item.itemType }:${ cr }`)

    if (match && !creators.find(cr => cr.match(match))) skip()
    return creators[0]
  }
  public $$creatortypes(match?: RegExp): string {
    this.$creatortypes(match)
    return '$$creatortypes'
  }

  private padYear(year: string, length: number): string {
    return year ? year.replace(/[0-9]+/, y => y.length >= length ? y : (`0000${ y }`).slice(-length)) : ''
  }

  /**
   * Returns the given text if no output was generated
   * @param text literal text to return
   */
  public _default(input: string, text: string): string {
    return input || text
  }

  /**
   * If the length of the output does not match the given number, skip to the next pattern.
   * @param relation comparison operator
   * @param length value to compare length with
   */
  public _len(input: string, relation: '<' | '<=' | '==' | '!=' | '>=' | '>' = '>', length = 0): string {
    return this.len(input, relation, length)
  }
  public __len(input: string, relation: '<' | '<=' | '==' | '!=' | '>=' | '>' = '>', length = 0): string {
    this._len(input, relation, length)
    return '__len'
  }

  /**
   * If the output does not match the given string/regex, skip to the next pattern.
   * @param match regex or string to match. String matches are case-insensitive
   * @param clean   transliterates the current output and removes unsafe characters during matching
   */
  public _match(input: string, match: RegExp | string, clean = false): string {
    if (!match) return input

    const cleaned = (t: string) => clean ? this.clean(t, true) : t

    if (typeof match === 'string') match = new RegExp(rescape(cleaned(match)), 'i')
    const m = cleaned(input).match(match)
    if (!m) skip()
    if (m.length === 1) return input
    return m.slice(1).join('')
  }
  public __match(input: string, match: RegExp | string, clean = false): string {
    this._match(input, match, clean)
    return '__match'
  }

  /**
   * Finds a text in the string and returns it.
   * @param match regex or string to match. String matches are case-insensitive
   * @param clean   transliterates the current output and removes unsafe characters during matching
   * @param passthrough if no match is found, pass through input.
   */
  public _find(input: string, match: RegExp | string, passthrough = false): string {
    try {
      return this._match(input, match)
    }
    catch (err) {
      if (err.next) {
        return passthrough ? input : ''
      }
      else {
        throw err
      }
    }
  }

  private len(input: string, relation: '<' | '<=' | '==' | '!=' | '>=' | '>', n: number): string {
    const $input = input.replace(/\s/g, '').replace(this.postfix.marker, '')
    switch (relation) {
      case '<':
        if (!($input.length < n)) skip()
        break
      case '<=':
        if (!($input.length <= n)) skip()
        break
      case '==':
        if (!($input.length === n)) skip()
        break
      case '!=':
        if (!($input.length !== n)) skip()
        break
      case '>':
        if (!($input.length > n)) skip()
        break
      case '>=':
        if (!($input.length >= n)) skip()
        break
      default:
        throw new Error(`Unexpected length comparison ${ relation }`)
    }

    return input
  }

  /** discards the input */
  public _discard(input: string): string { // eslint-disable-line @typescript-eslint/no-unused-vars
    return ''
  }

  /** transforms date/time to local time. Mainly useful for dateAdded and dateModified as it requires an ISO-formatted input. */
  public _localTime(input: string): string {
    const m = input.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})[ T]([0-9]{2}):([0-9]{2}):([0-9]{2})Z?$/)
    if (!m) return ''
    const date = new Date(`${input}Z`)
    date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
    return date.toISOString().replace('.000Z', '').replace('T', ' ')
  }

  /**
   * formats date as by replacing y, m and d in the format
   * @param format sprintf-style format template
   */
  public _formatDate(input: string, format = '%Y-%m-%d'): string {
    return this.format_date(input, format)
  }

  public format_date(input: string | PartialDate, format: string): string {
    if (!input) return ''

    const date = (typeof input === 'string') ? parseDate(input) : input

    let keep = true
    const formatted = format.split(/(%-?o?[a-z]|%%)/i).map((spec, i) => {
      if ((i % 2) === 0) return spec
      if (spec === '%%') return '%'

      const pad = spec[1] !== '-'
      const field = spec.substring(pad ? 1 : 2)
      let repl: string = date[field]
      if (typeof repl !== 'string') throw new Error(`:format-date: unsupported formatter ${ JSON.stringify(spec) }`)
      if (!repl) return null

      if (pad) repl = this.padYear(repl, (field === 'Y' || field === 'oY') ? 4 : 2)

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
  public _numeric(input: string): string {
    return isNaN(parseInt(input)) ? '' : input
  }

  /**
   * replaces text, for the text to match you can pass either:
   * - a string: `.replace('.etal','&etal')` which will match case-insensitive, so will replace `.EtAl` with `&etal`.
   * - [javascript regular expression](https://www.simplilearn.com/tutorials/javascript-tutorial/javascript-regex): `.replace(/[.]etal/ig, '&etal')`
   * @param find string or regex to match. String matches are case-insensitive
   * @param replace literal text to replace the match with
   */
  public _replace(input: string, find: string | RegExp, replace: string): string {
    if (!find) return input
    if (typeof find === 'string') find = new RegExp(rescape(find), 'ig')
    return input.replace(find, replace)
  }

  /**
   * replaces spaces in the value passed in. You can specify what to replace it with by adding it as a
   * parameter, e.g `.condense('_')` will replace spaces with underscores. Equivalent to `.replace(/\s+/g, sep)`.
   * @param sep replacement character
   */
  public _condense(input: string, sep: string = ''): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    return input.replace(/\s+/g, sep)
  }

  /**
   * prefixes with its parameter, so `.prefix('_')` will add an underscore to the front if, and only if, the value
   * it is supposed to prefix isn't empty.
   * @param prefix prefix string
   */
  public _prefix(input: string, prefix: string): string {
    return (input && prefix) ? `${prefix}${input}` : input
  }

  /**
   * postfixes with its parameter, so `postfix('_')` will add an underscore to the end if, and only if, the value
   * it is supposed to postfix isn't empty
   * @param postfix postfix string
   */
  public _postfix(input: string, postfix: string): string {
    return (input && postfix) ? `${input}${postfix}` : input
  }

  /**
   * Abbreviates the text. Only the first character and subsequent characters following white space will be included.
   * @param chars number of characters to return per word
   */
  public _abbr(input: string, chars = 1): string {
    return input.split(/\s+/).map(word => word.substring(0, chars)).join('')
  }

  /**
   * Does an acronym lookup for the text.
   * @param list lookup list. The list must be a CSV file and live in the `Zotero/better-bibtex` directory in your Zotero profile, and must use commas as the delimiter.
   * @param reload reload the list for every call. When off, the list will only be read at startup of Better BibTeX. You can set this to true temporarily to live-reload a list.
   * @param passthrough if no match is found, pass through input.
   */
  public _acronym(input: string, list = 'acronyms', reload = false, passthrough = false): string {
    list = list.replace(/\.csv$/i, '')

    if (reload) delete this.acronyms[list]
    if (!this.acronyms[list]) {
      const acronyms: Record<string, string> = {}

      try {
        for (const row of csv2list(PathUtils.join(Zotero.BetterBibTeX.dir, `${ list }.csv`))) {
          if (row.length !== 2) {
            log.error('unexpected row in', `${ list }.csv`, ':', row)
            continue
          }
          if (row[0] === 'full' && row[1] === 'acronym') continue

          let [ full, acronym ] = row
          full = full.trim().toLowerCase()
          acronym = acronym.trim()
          if (full && acronym) {
            if (acronyms[full]) log.error('acronyms: parsing', list, row, 'duplicate')
            acronyms[full] = acronym
          }
          else {
            log.error('acronyms: parsing', list, row, 'incomplete')
          }
        }
      }
      catch {
        log.error('error parsing acronym list', list)
      }

      this.acronyms[list] = acronyms
    }

    return this.acronyms[list][input.toLowerCase()] || (passthrough ? input : '')
  }

  /** Forces the text inserted by the field marker to be in lowercase. For example, `auth.lower` expands to the last name of the first author in lowercase. */
  public _lower(input: string): string {
    return input.toLowerCase()
  }

  /** Forces the text inserted by the field marker to be in uppercase. For example, `auth.upper` expands the last name of the first author in uppercase. */
  public _upper(input: string): string {
    return input.toUpperCase()
  }

  /**
   * filters out common words like 'of', 'the', ... the list of words can be seen and changed by going into
   * `about:config` under the key `extensions.zotero.translators.better-bibtex.skipWords` as a comma-separated,
   * case-insensitive list of words.
   *
   * If you want to strip words like 'Jr.' from names, you could use something like `Auth.nopunct.skipwords.fold`
   * after adding `jr` to the skipWords list.
   * Note that this filter is always applied with `nopunct` on if you use `title` (which is different from `Title`) or `shorttitle`.
   * @param nopunct remove punctuation from words
   */
  public _skipwords(input: string, nopunct: boolean = false): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const words = this.titleWords(input, { skipWords: true, nopunct })
    return words ? words.join(' ') : ''
  }

  /**
   * selects words from the value passed in. The format is `select(start,number)` (1-based), so `select(1,4)` or `select(n=4)`
   * would select the first four words. If `n` is not given, all words from `start` to the end are
   * selected.
   * @param start first word to select (1-based)
   * @param n number of words to select. Default is all.
   */
  public _select(input: string, start: number = 1, n?: number): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    const values = input.split(/\s+/)
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

    return values.slice(start, end).join(' ')
  }

  /**
   * `substring(start,n)` selects `n` (default: all) characters starting at `start`
   * @param start starting character (1-based)
   * @param n number of characters to select (default: remainder from `start`)
   */
  public _substring(input: string, start: number = 1, n?: number): string { // eslint-disable-line @typescript-eslint/no-inferrable-types
    if (typeof n === 'undefined') n = input.length

    return input.slice(start - 1, (start - 1) + n)
  }

  /** removes all non-ascii characters */
  public _ascii(input: string): string {
    return input.replace(/[^ -~]/g, '').split(/\s+/).join(' ').trim()
  }

  /** clears out everything but unicode alphanumeric characters (unicode character classes `L` and `N`) */
  public _alphanum(input: string): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return Zotero.Utilities.XRegExp.replace(input, this.re.alphanum, '', 'all').split(/\s+/).join(' ').trim()
  }

  /** uppercases the first letter of each word */
  public _capitalize(input: string): string {
    return input.replace(/((^|\s)[a-z])/g, m => m.toUpperCase())
  }

  private nopunct(text: string, dash = '-'): string {
    text = Zotero.Utilities.XRegExp.replace(text, this.re.dash, dash, 'all')
    text = Zotero.Utilities.XRegExp.replace(text, this.re.punct, '', 'all')
    return text
  }

  /** Removes punctuation
    * @param dash replace dashes with given character
    */
  public _nopunct(input: string, dash = '-'): string {
    return this.nopunct(input, dash)
  }

  /** Removes punctuation and word-connecting dashes. alias for `nopunct(dash='')` */
  public _nopunctordash(input: string): string {
    return this._nopunct(input, '')
  }

  /** Treat ideaographs as individual words */
  public _ideographs(input: string): string {
    return input.replace(CJK, ' $1 ').trim()
  }

  /**
    * word segmentation for Chinese items. Uses substantial memory, and adds about 7 seconds to BBTs startup time; must be enabled under Preferences -> Better BibTeX -> Advanced -> Citekeys
    * @param mode segmentation mode
    */
  public _jieba(input: string, mode?: 'cn' | 'tw' | 'hant'): string {
    if (!chinese.load(Preference.jieba)) return input
    if (mode === 'hant') mode = 'tw'
    mode = mode || (this.item.transliterateMode === 'chinese-traditional' ? 'tw' : 'cn')
    return chinese.jieba(input, mode).join(' ').trim()
  }

  /** word segmentation for Japanese items. Uses substantial memory; must be enabled under Preferences -> Better BibTeX -> Advanced -> Citekeys */
  public _kuromoji(input: string): string {
    if (!Preference.kuroshiro || !kuroshiro.enabled) return input
    return kuroshiro.tokenize(input || '').join(' ').trim()
  }

  /** transliterates the citation key and removes unsafe characters */
  public _clean(input: string): string {
    return this.clean(input, true)
  }

  /** transliterates the citation key to pinyin */
  public _pinyin(input: string): string {
    return chinese.load(Preference.jieba) ? chinese.pinyin(input) : input
  }

  /**
   * transliterates the citation key. If you don't specify a mode, the mode is derived from the item language field
   * @param mode specialized translateration modes for german, japanese or chinese.
   */
  public _transliterate(input: string, mode?: 'minimal' | 'de' | 'german' | 'ja' | 'japanese' | 'zh' | 'chinese' | 'tw' | 'zh-hant' | 'ar' | 'arabic' | 'uk' | 'ukranian' | 'mn' | 'mongolian' | 'ru' | 'russian'): string {
    return this.transliterate(input, mode)
  }

  private transliterate(str: string, mode?: 'minimal' | 'de' | 'german' | 'ja' | 'japanese' | 'zh' | 'chinese' | 'tw' | 'zh-hant' | 'chinese-traditional' | 'ar' | 'arabic' | 'uk' | 'ukranian' | 'mn' | 'mongolian' | 'ru' | 'russian'): string {
    mode = mode || this.item.transliterateMode || 'minimal'

    let replace: Record<string, string> = {}
    switch (mode) {
      case 'minimal':
        break

      case 'de':
      case 'german':
        replace = {
          ä: 'ae', // eslint-disable-line quote-props
          ö: 'oe', // eslint-disable-line quote-props
          ü: 'ue', // eslint-disable-line quote-props
          Ä: 'Ae', // eslint-disable-line quote-props
          Ö: 'Oe', // eslint-disable-line quote-props
          Ü: 'Ue', // eslint-disable-line quote-props
        }
        break

      case 'tw':
      case 'zh-hant':
      case 'zh':
      case 'chinese-traditional':
      case 'chinese':
        if (chinese.load(Preference.jieba)) str = chinese.pinyin(str)
        break

      case 'ja':
      case 'japanese':
        if (Preference.kuroshiro && kuroshiro.enabled) str = kuroshiro.convert(str, { to: 'romaji' })
        break

      case 'ar':
      case 'arabic':
        str = arabic(str)
        break

      case 'uk':
      case 'ukranian':
        str = ukranian(str)
        break

      case 'mn':
      case 'mongolian':
        str = mongolian(str)
        break

      case 'ru':
      case 'russian':
        str = russian(str)
        break

      default:
        throw new Error(`Unsupported fold mode "${ mode }"`)
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
    return this.transliterate(str).replace(allow_spaces ? this.re.unsafechars_allow_spaces : this.re.unsafechars, '').trim()
  }

  private split(title: string): string[] {
    const contracted: Term[] = []
    let tail: Term
    const sentences: { terms: Term[] }[] = nlp(title).json()
    for (const sentence of sentences) {
      sentence.terms.forEach((term, i) => {
        if (i !== 0 && tail.post === '-') {
          tail.text += tail.post + term.text
          tail.post = term.post
        }
        else {
          contracted.push(tail = term)
        }
      })
    }
    return contracted.map(term => term.text).filter(term => !this.skipWords.has(term.toLowerCase()))
  }

  private titleWords(title, options: { transliterate?: boolean; skipWords?: boolean; nopunct?: boolean } = {}): string[] {
    if (!title) return null

    title = title.replace(/<\/?(?:i|b|sc|nc|code|span[^>]*)>|["]/ig, '').replace(/[/:]/g, ' ')
    let words = this.split(title)
      .map(word => options.nopunct ? this.nopunct(word, '') : word)
      .filter(word => word && !(options.skipWords && ucs2decode(word).length === 1 && !word.match(/^\d+$/) && !word.match(CJK)))

    // apply jieba.cut and flatten.
    if (chinese.load(Preference.jieba) && options.skipWords && this.item.transliterateMode.startsWith('chinese')) {
      const mode = this.item.transliterateMode === 'chinese-traditional' ? 'tw' : 'cn'
      words = words
        .flatMap((word: string) => chinese.jieba(word, mode))
        .filter((word: string) => !this.skipWords.has(word.toLowerCase())) // remove CJK skipwords
    }

    if (Preference.kuroshiro && kuroshiro.enabled && options.skipWords && this.item.transliterateMode === 'japanese') {
      words = words
        .flatMap((word: string) => kuroshiro.tokenize(word))
        .filter((word: string) => !this.skipWords.has(word.toLowerCase()))
    }

    if (options.transliterate) {
      words = words.map((word: string) => {
        if (this.item.transliterateMode) {
          return this.transliterate(word)
        }
        else if (Preference.kuroshiro && kuroshiro.enabled) {
          return this.transliterate(kuroshiro.convert(word, { to: 'romaji' }), 'minimal')
        }
        else if (chinese.load(Preference.jieba)) {
          return this.transliterate(chinese.pinyin(word), 'minimal')
        }
        else {
          return this.transliterate(word)
        }
      })
    }

    // remove transliterated and non-CJK skipwords
    if (options.skipWords) words = words.filter((word: string) => !this.skipWords.has(word.toLowerCase()))

    if (words.length === 0) return null

    return words
  }

  private innerText(str: string): string {
    if (!str) return ''
    return innerText(parseFragment(`<span>${ str }</span>`))
  }

  private stripQuotes(name: string): string {
    if (!name) return ''
    if (name.length >= 2 && name[0] === '"' && name[name.length - 1] === '"') return name.slice(1, -1)
    return name
  }

  private initials(creator, all = true): string {
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

  private name(creator: Creator, template: string): string {
    return sprintf(template, {
      f: this.stripQuotes(this.innerText(creator.lastName || creator.name)),
      g: this.stripQuotes(this.innerText(creator.firstName || '')),
      I: this.initials(creator),
      i: this.initials(creator, false),
    }) as string
  }

  private creators(select: AuthorType, template: string): string[] {
    const types = itemCreators[client.slug][this.item.itemType] || []
    const primary = types[0]

    const creators = {
      editor: [],
      author: [],
      translator: [],
      collaborator: [],
    }

    for (const creator of this.item.creators) {
      const name = this.name(creator, template)
      if (!name) continue

      let hasEditor = false
      let hasSeriesEditor = false
      switch (creator.creatorType) {
        case 'editor':
          hasEditor = true
          creators.editor.push(name)
          break

        case 'serieseditor':
          if (!hasEditor || hasSeriesEditor) {
            hasSeriesEditor = true
            creators.editor.push(name)
          }
          break

        case 'translator':
          creators.translator.push(name)
          break

        case primary:
          creators.author.push(name)
          break

        default:
          creators.collaborator.push(name)
      }
    }

    const candidates: AuthorType[] = select === '*' ? [ 'author', 'editor', 'translator', 'collaborator' ] : [select]

    for (const kind of candidates) {
      if (creators[kind].length) return creators[kind] as string[]
    }
    return []
  }

  public formula_log(k: string, v: string, e?: Error & { next?: boolean }): string {
    if (e && e.next) {
      log.info('formula: skip')
    }
    else if (e) {
      log.error('formula:', e)
    }
    else {
      log.info('formula:', k, '=>', v)
    }
    return v
  }

  public formula_sequence(...e: (() => string)[]): string {
    const final = e.pop()
    for (const attempt of e) {
      try {
        return attempt()
      }
      catch (err) {
        if (!err.next) {
          log.error('formula: sequence element', err)
          throw err
        }
      }
    }
    return final()
  }

  public formula_test(f: () => string): string {
    try {
      return f()
    }
    catch (err: any) {
      if (err.next) return ''
      log.error('formula:', err)
      throw err
    }
  }
}

export const Formatter = new PatternFormatter // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
