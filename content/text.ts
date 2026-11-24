import { toWordsOrdinal, toOrdinal } from 'number-to-words'

import { toSentenceCase } from '@retorquere/bibtex-parser'

import { titleCased } from './csl-titlecase'

import Language from '../gen/babel/langmap.json' with { type: 'json' }
// import Tag from '../gen/babel/tag.json'
const LanguagePrefixes = Object.keys(Language).sort().reverse().filter(prefix => prefix.length > 3)

const RE = new class {
  public titleCaseKeep: RegExp
  public singleLetter: RegExp
  public notAlphaNum: RegExp

  constructor() {
    const P = /\.\u002D\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]^_`{\|}~/.source
    const whitespace = ' \t\n\r\u00A0'
    const L = '\\p{Lu}\\p{Ll}\\p{Lt}\\p{Lm}\\p{Lo}'

    this.titleCaseKeep = new RegExp(`(?:(?:[>:?]?[${whitespace}]+)[${L}][${P}]?(?:[${whitespace}]|$))|(?:(?:<span class="nocase">.*?</span>)|(?:<nc>.*?</nc>))`, 'ugi')
    this.notAlphaNum = new RegExp(`[^${L}\\p{Nd}\\p{Nl}]`, 'u')
    this.singleLetter = new RegExp(`^([>:?])?[${whitespace}]+(.)`)
  }
}

export function titleCase(text: string): string {
  let titlecased: string = titleCased(text)

  // restore single-letter "words". Shame firefox doesn't do lookbehind, but this will work
  text.replace(RE.titleCaseKeep, (match: string, offset: number) => {
    if (match[0] !== '<') {
      const [ , punc, l ] = match.match(RE.singleLetter) as RegExpMatchArray
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

export function langCode(langcode: string): string {
  if (!langcode) return ''

  const lc = langcode.toLowerCase()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Language[lc]
    || Language[lc.replace(/[^a-z0-9]/, '-')]
    || Language[lc.replace(RE.notAlphaNum, '')]
    || (!lc.match(RE.notAlphaNum) && Language[LanguagePrefixes.find((prefix: string) => lc.startsWith(prefix)) as string])
    || Language[lc.replace(/-.*/, '').replace(/[^a-z0-9]/, '-')]
    || langcode
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

export function toEnglishOrdinal(n: number | string): string {
  const sortaNum = typeof n === 'number' ? `${n}` : (n || '').replace(/(st|nd|th)$/, '')
  if (sortaNum.match(/^[0-9]{1,2}$/)) {
    return toWordsOrdinal(sortaNum).replace(/^\w/, (c: string) => c.toUpperCase()) as string
  }
  else if (sortaNum.match(/^[0-9]+$/)) {
    return toOrdinal(sortaNum).replace(/^\w/, (c: string) => c.toUpperCase()) as string
  }
  else {
    return typeof n === 'string' ? n : ''
  }
}

export function padInt(num: number, length: number): string {
  return num < 0 ? '-' + (-num + '').padStart(length, '0') : (num + '').padStart(length, '0')
}
