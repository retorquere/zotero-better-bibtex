import { toSentenceCase } from '@retorquere/bibtex-parser'

import type { MarkupNode } from '../typings/markup'
import { titleCased } from './csl-titlecase'

import { serialize, parseFragment } from 'parse5'

import Language from '../gen/babel/langmap.json'
// import Tag from '../gen/babel/tag.json'
const LanguagePrefixes = Object.keys(Language).sort().reverse().filter(prefix => prefix.length > 3)

const RE = new class {
  public leadingUnprotectedWord: RegExp
  public protectedWords: RegExp
  public unprotectedWord: RegExp
  public sentenceEnd = /^[:?]/
  public url = /^(https?|mailto):\/\/[^\s]+/
  public whitespace: RegExp
  public titleCaseKeep: RegExp
  public singleLetter: RegExp
  public notAlphaNum: RegExp

  constructor() {
    const P = /\.\u002D\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]^_`{\|}~/.source
    const char = '\\p{Ll}\\p{Lt}\\p{Lm}\\p{Lo}\\p{Mn}\\p{Mc}\\p{Nd}\\p{Nl}'
    const Char = `\\p{Lu}${char}`
    const whitespace = ' \t\n\r\u00A0'
    const protectedWord = [
      `[${char}]*[\\p{Lu}][-${Char}]*`,
    ].join('|')
    const L = '\\p{Lu}\\p{Ll}\\p{Lt}\\p{Lm}\\p{Lo}'

    this.leadingUnprotectedWord = new RegExp(`^([\\p{Lu}][${char}]*)[${whitespace}${P}]`, 'u')
    this.protectedWords = new RegExp(`^(${protectedWord})(([${whitespace}])(${protectedWord}))*`, 'u')
    this.unprotectedWord = new RegExp(`^[${Char}]+`, 'u')
    this.whitespace = new RegExp(`^[${whitespace}]+`)

    this.titleCaseKeep = new RegExp(`(?:(?:[>:?]?[${whitespace}]+)[${L}][${P}]?(?:[${whitespace}]|$))|(?:(?:<span class="nocase">.*?</span>)|(?:<nc>.*?</nc>))`, 'ugi')
    this.notAlphaNum = new RegExp(`[^${L}\\p{Nd}\\p{Nl}]`, 'u')
    this.singleLetter = new RegExp(`^([>:?])?[${whitespace}]+(.)`)
  }
}

const ligatures = {
  // '\u01F1': 'DZ',
  // '\u01F2': 'Dz',
  ǳ: 'dz',
  // '\u01C4': 'D\u017D',
  // '\u01C5': 'D\u017E',
  // '\u01C6': 'd\u017E',
  ﬀ: 'ff',
  ﬁ: 'fi',
  ﬂ: 'fl',
  ﬃ: 'ffi',
  ﬄ: 'ffl',
  // '\uFB05': '\u017Ft',
  ﬆ: 'st',
  // '\u0132': 'IJ',
  ĳ: 'ij',
  // '\u01C7': 'LJ',
  // '\u01C8': 'Lj',
  ǉ: 'lj',
  // '\u01CA': 'NJ',
  // '\u01CB': 'Nj',
  ǌ: 'nj',
}

export function titleCase(text: string): string {
  let titlecased: string = titleCased(text)

  // restore single-letter "words". Shame firefox doesn't do lookbehind, but this will work
  text.replace(RE.titleCaseKeep, (match: string, offset: number) => {
    if (match[0] !== '<') {
      const [ , punc, l ] = match.match(RE.singleLetter)
      if (punc && (l === 'a' || l === 'A')) {
        match = match.toUpperCase()
      }
    }
    titlecased = titlecased.substr(0, offset) + match + titlecased.substr(offset + match.length)
    return match
  })

  return titlecased
}

export function sentenceCase(text: string): string {
  let sentencecased: string = toSentenceCase(text)

  // restore protected parts from original
  text.replace(/<span class="nocase">.*?<\/span>|<nc>.*?<\/nc>/gi, (match: string, offset: number) => {
    sentencecased = sentencecased.substr(0, offset) + match + sentencecased.substr(offset + match.length)
    return match
  })

  return sentencecased
}

export type HTMLParserOptions = {
  html?: boolean
  caseConversion?: boolean
  exportBraceProtection?: boolean
  csquotes?: string
  exportTitleCase?: boolean
}

const CSQuotes = new class {
  #cache: Record<string, { open: RegExp; close: RegExp }> = {}

  public open(quotes: string): RegExp {
    this.ensure(quotes)
    return this.#cache[quotes].open
  }

  public close(quotes: string): RegExp {
    this.ensure(quotes)
    return this.#cache[quotes].close
  }

  private ensure(quotes) {
    if (!this.#cache[quotes]) {
      this.#cache[quotes] = {
        open: this.regex(quotes, 0),
        close: this.regex(quotes, 1),
      }
    }
  }

  private escape(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&')
  }

  private regex(str: string, close: 0 | 1): RegExp {
    let re = this.escape(Array.from(str).filter((_, i) => i % 2 === close).join(''))
    if (close) {
      re = `\\s*[${re}]`
    }
    else {
      re = `[${re}]\\s*`
    }
    return new RegExp(re, 'g')
  }
}

export const HTMLParser = new class {
  private options: HTMLParserOptions
  private sentenceStart: boolean
  private spuriousNode = new Set([ '#document-fragment', '#document', 'div', 'span' ])
  private titleCased: string
  private html: string
  private ligatures = new RegExp(`[${ Object.keys(ligatures).join('') }]`, 'g')

  public parse(html: string, options: HTMLParserOptions): MarkupNode {
    this.html = html

    let doc: MarkupNode

    this.options = { ...options, exportBraceProtection: options.caseConversion && options.exportBraceProtection }
    this.sentenceStart = true

    // add enquote tags.
    if (this.options.csquotes) {
      this.html = this.html
        .replace(CSQuotes.open(this.options.csquotes), '<span class="enquote">')
        .replace(CSQuotes.close(this.options.csquotes), '</span>')
    }

    if (!this.options.html) {
      this.html = this.html.replace(/&/g, '&amp;')

      // this pseudo-html is a PITA to parse
      this.html = this.html.replace(/<(\/?)([^<>]*)>/g, (match, close, body) => {
        if (body.match(/^(pre|emphasis|span|nc|sc|i|b|sup|sub|script)($|\n|\s)/i)) return match

        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      })
    }

    doc = this.walk(parseFragment(this.html, { sourceCodeLocationInfo: true }))

    if (this.options.caseConversion) {
      if (this.options.exportTitleCase) {
        this.titleCased = ''
        this.collectText(doc)
        this.titleCased = titleCase(this.titleCased)

        this.titleCase(doc)
      }

      const unwrapped = this.unwrapNocase(doc)
      if (unwrapped.length === 1) {
        doc = unwrapped[0]
      }
      else {
        doc = { nodeName: 'span', attr: {}, class: {}, childNodes: unwrapped }
      }
      this.cleanupNocase(doc)
    }

    // spurious wrapping span
    doc = this.unwrapSpurious(doc)
    doc.source = this.html

    return doc
  }

  private titleCase(node: MarkupNode) {
    if (node.nodeName === '#text') {
      node.value = this.titleCased.substr(node.titleCased, node.value.length)
      return
    }

    for (const child of node.childNodes) {
      if (child.nocase || child.nodeName === 'sup' || child.nodeName === 'sub') continue
      this.titleCase(child)
    }
  }

  private unwrapSpurious(node: MarkupNode) {
    // debug('spurious:', { nodeName: node.nodeName, attrs: Object.keys(node.attr).length, nocase: node.nocase, childNodes: node.childNodes.length })

    if (node.nodeName === '#text') return node

    node.childNodes = node.childNodes.map(child => this.unwrapSpurious(child))

    while (this.spuriousNode.has(node.nodeName) && Object.keys(node.attr).length === 0 && !node.nocase && node.childNodes.length === 1) node = node.childNodes[0]

    return node
  }

  // BibLaTeX is beyond insane https://github.com/retorquere/zotero-better-bibtex/issues/541#issuecomment-240999396
  private unwrapNocase(node: MarkupNode): MarkupNode[] {
    if (node.nodeName === '#text') return [node]

    // unwrap and flatten
    node.childNodes = [].concat(...node.childNodes.map(child => this.unwrapNocase(child)))

    // no nocase children? done
    if (node.nocase || !node.childNodes.find(child => child.nocase)) return [node]

    // expand nested nocase node to sibling of node
    return node.childNodes.map((child: MarkupNode) => {
      if (child.nocase) {
        return {
          ...child,
          childNodes: [{ ...node, childNodes: child.childNodes }],
        }
      }

      return {
        ...node,
        childNodes: [child],
      }
    })
  }

  private cleanupNocase(node: MarkupNode, nocased = false): MarkupNode[] {
    if (node.nodeName === '#text') return null

    if (nocased) delete node.nocase

    for (const child of node.childNodes) {
      this.cleanupNocase(child, node.nocase || nocased)
    }
  }

  private collectText(node: MarkupNode) {
    switch (node.nodeName) {
      case '#text':
        node.titleCased = this.titleCased.length
        this.titleCased += node.value
        break

      case 'script':
        // don't confuse the title caser with spurious markup. Without this,
        // the CSL title caser would consider last words in a title that actually have a following <script> block the last
        // word and would capitalize it. The prevents that behavior by adding the contents of the <script> block, but it
        // will be ignored by the BBT title caser, which only title-cases #text blocks
        this.titleCased += ''.padStart(node.value.length, 'latex')
        break

      default:
        for (const child of node.childNodes) {
          this.collectText(child)
        }
    }
  }

  private plaintext(childNodes: MarkupNode[], text, offset) {
    // replace ligatures so titlecasing works for things like "figures"
    text = text.replace(this.ligatures, (ligature: string) => (ligatures[ligature] as string))
    const l = childNodes.length
    if (l === 0 || (childNodes[l - 1].nodeName !== '#text')) {
      childNodes.push({ nodeName: '#text', offset, value: text, attr: {}, class: {}})
    }
    else {
      childNodes[l - 1].value += text
    }
  }

  private nocase(childNodes, text, offset) {
    childNodes.push({
      nodeName: 'span',
      nocase: true,
      attr: {},
      class: {},
      childNodes: [{
        nodeName: '#text',
        offset,
        value: text,
        attr: {},
        class: {},
      }],
    })
  }

  private walk(node, isNocased = false) {
    const normalized_node: MarkupNode = {
      nodeName: node.nodeName,
      childNodes: [],
      attr: {},
      class: {},
    }
    for (const { name, value } of (node.attrs || [])) {
      normalized_node.attr[name] = value
    }
    for (const cls of (normalized_node.attr.class || '').trim().split(/\s+/)) {
      if (cls) normalized_node.class[cls] = true
    }
    switch (node.type?.toLowerCase()) {
      case 'smallcaps':
        normalized_node.attr.smallcaps = 'smallcaps'
        break
    }
    if (node.type) normalized_node.class[node.type] = true

    switch (node.nodeName) {
      case '#document':
      case '#document-fragment':
        normalized_node.nodeName = 'span'
        break

      case 'script':
        return { ...normalized_node, value: serialize(node), childNodes: [] }

      case 'pre':
        if (!this.options.html || normalized_node.class.math) {
          return { ...normalized_node, nodeName: 'script', value: serialize(node), childNodes: [] }
        }
        else {
          normalized_node.nodeName = 'span'
          normalized_node.tt = true
        }
        break

      case 'nc':
        normalized_node.nodeName = 'span'
        normalized_node.attr.nocase = 'nocase'
        break

      case 'emphasis':
        normalized_node.nodeName = 'i'
        break

      case 'sc':
        normalized_node.nodeName = 'span'
        normalized_node.attr.smallcaps = 'smallcaps'
        break
    }

    if (normalized_node.attr.nocase || normalized_node.class.nocase) normalized_node.nocase = !isNocased
    if (normalized_node.attr.relax || normalized_node.class.relax) normalized_node.relax = true
    if (normalized_node.class.enquote || normalized_node.attr.enquote) normalized_node.enquote = true
    if (!normalized_node.attr.smallcaps && (normalized_node.attr.style || '').match(/small-caps/i)) normalized_node.attr.smallcaps = 'smallcaps'
    if (normalized_node.class.smallcaps || normalized_node.attr.smallcaps) normalized_node.smallcaps = true

    if (node.childNodes) {
      let m
      for (const child of node.childNodes) {
        if (child.nodeName !== '#text') {
          normalized_node.childNodes.push(this.walk(child, isNocased || normalized_node.nocase))
          continue
        }

        if (!this.options.caseConversion || isNocased) {
          this.plaintext(normalized_node.childNodes, child.value, child.sourceCodeLocation.startOffset)
          continue
        }

        let text = child.value
        const length = text.length
        while (text) {
          if (m = RE.whitespace.exec(text)) {
            this.plaintext(normalized_node.childNodes, m[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[0].length)
            continue
          }

          if (m = RE.sentenceEnd.exec(text)) {
            this.plaintext(normalized_node.childNodes, m[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[0].length)
            // this.sentenceStart = true
            continue
          }

          if (this.sentenceStart && (m = RE.leadingUnprotectedWord.exec(`${ text } `))) {
            this.sentenceStart = false
            this.plaintext(normalized_node.childNodes, m[1], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[1].length)
            continue
          }

          this.sentenceStart = false

          if (!isNocased && this.options.exportBraceProtection && (m = RE.protectedWords.exec(text))) {
            this.nocase(normalized_node.childNodes, m[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[0].length)
          }
          else if (m = RE.url.exec(text)) {
            this.nocase(normalized_node.childNodes, m[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[0].length)
          }
          else if (m = RE.unprotectedWord.exec(text)) {
            this.plaintext(normalized_node.childNodes, m[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(m[0].length)
          }
          else {
            this.plaintext(normalized_node.childNodes, text[0], child.sourceCodeLocation.startOffset + (length - text.length))
            text = text.substring(1)
          }
        }
      }
    }

    return normalized_node
  }
}

export function babelLanguage(language: string): string {
  if (!language) return ''
  const lc = language.toLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Language[lc]
    || Language[lc.replace(/[^a-z0-9]/, '-')]
    || Language[lc.replace(RE.notAlphaNum, '')]
    || (!lc.match(RE.notAlphaNum) && Language[LanguagePrefixes.find((prefix: string) => lc.startsWith(prefix))])
    || Language[lc.replace(/-.*/, '').replace(/[^a-z0-9]/, '-')]
    || language
}

const excelColumnCache: Map<number, string> = new Map
// https://www.geeksforgeeks.org/find-excel-column-name-given-number/
export function excelColumn(n: number): string {
  const cached = excelColumnCache.get(n)
  if (cached) return cached

  const arr: number[] = []
  let i = 0

  // Step 1: Converting to number assuming 0 in number system
  while (n) {
    arr[i] = n % 26
    n = Math.floor(n / 26)
    i++
  }

  // Step 2: Getting rid of 0, as 0 is not part of number system
  for (let j = 0; j < i - 1; j++) {
    if (arr[j] <= 0) {
      arr[j] += 26
      arr[j + 1] = arr[j + 1] - 1
    }
  }

  let col = ''
  for (let j = i; j >= 0; j--) {
    if (arr[j] > 0) col += String.fromCharCode(65 + arr[j] - 1)
  }
  excelColumnCache.set(n, col)

  return col
}

export function toClipboard(text: string): void {
  Components.classes['@mozilla.org/widget/clipboardhelper;1'].getService(Components.interfaces.nsIClipboardHelper).copyString(text)
}
