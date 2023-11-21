import { clone } from '../../content/object'
import { Translation } from '../lib/translator'
import { HTMLParser } from '../../content/text'

import type { MarkupNode } from '../../typings/markup'
import type { TeXMap } from '../../content/prefs'

import { log } from '../../content/logger'
import HE = require('he')
const combining_diacritics = /^[^\u0300-\u036F][\u0300-\u036F]+/

import * as unicode2latex from 'unicode2latex'

const switchMode = {
  math: 'text',
  text: 'math',
}

export type ConverterOptions = {
  caseConversion?: boolean
  html?: boolean
  creator?: boolean
  commandspacers?: boolean
}

export function replace_command_spacers(latex: string): string {
  return latex.replace(/\0(\s)/g, '{}$1').replace(/\0([^;.,!?${}_^\\/])/g, ' $1').replace(/\0/g, '')
}

export type ParseResult = { latex: string, raw: boolean, packages: string[] }

type LatexRepresentation = { text?: string, math?: string, textpackages?: string[], mathpackages?: string[], commandspacer?: boolean }

export class HTMLConverter {
  private latex = ''
  private mapping: TeXMap
  private stack: any[] = []
  private options: ConverterOptions = {}
  private embraced: boolean
  private packages: { [key: string]: boolean } = {}
  private translation: Translation

  constructor(charmap: TeXMap, translation: Translation) {
    this.translation = translation
    this.mapping = this.init(charmap)
  }

  private init(charmap: TeXMap): TeXMap {
    let mapping: TeXMap

    if (this.translation.unicode) {
      mapping = unicode2latex.unicode
    }
    else if (this.translation.BetterBibTeX) {
      /* https://github.com/retorquere/zotero-better-bibtex/issues/1189
        Needed so that composite characters are counted as single characters
        for in-text citation generation. This messes with the {} cleanup
        so the resulting TeX will be more verbose; doing this only for
        bibtex because biblatex doesn't appear to need it.

        Only testing ascii.text because that's the only place (so far)
        that these have turned up.
      */
      mapping = unicode2latex.ascii_bibtex_creator
    }
    else {
      mapping = unicode2latex.ascii
    }

    // safeguard against modifications for reusable workers
    mapping = clone({
      ...mapping,
      ...(charmap || {}),
    })

    for (const c of this.translation.preferences.ascii) {
      mapping[c] = unicode2latex.ascii[c]
    }

    for (const keep of Object.keys(switchMode).sort()) {
      const remove = switchMode[keep]
      const unicode = this.translation.preferences[`map${keep[0].toUpperCase()}${keep.slice(1)}`]
      for (const c of unicode) {
        if (mapping[c] && mapping[c].text && mapping[c].math) {
          delete mapping[c][remove]
        }
      }
    }

    return mapping
  }

  public tolatex(source: string, options: ConverterOptions): ParseResult {
    this.embraced = false
    this.options = options
    this.latex = ''
    this.packages = {}
    this.stack = []

    const ast: MarkupNode = HTMLParser.parse(source, {
      html: options.html,
      caseConversion: options.caseConversion,
      exportBraceProtection: this.translation.preferences.exportBraceProtection,
      csquotes: this.translation.preferences.csquotes,
      exportTitleCase: this.translation.preferences.exportTitleCase,
    })
    this.walk(ast)

    if (!options.commandspacers) this.latex = replace_command_spacers(this.latex)

    this.latex = this.latex
      // .replace(/(\\\\)+[^\S\n]*\n\n/g, '\n\n') // I don't recall why I had the middle match, replaced by match below until I figure it out
      .replace(/(\\\\)+\n\n/g, '\n\n') // paragraph breaks followed by line breaks == line breaks
      .replace(/\n\n\n+/g, '\n\n') // line breaks > 3 is the same as two line breaks.
      .replace(/(\\par[\n\s~]+)+/g, '\\par\n')
      .replace(/\n*\\par\n*$/, '')
      .replace(/^\n*\\par\n*/, '')

    return { latex: this.latex, raw: ast.nodeName === 'pre', packages: Object.keys(this.packages) }
  }

  private walk(tag: MarkupNode, nocased = false) {
    if (!tag) return

    switch (tag.nodeName) {
      case '#text':
        this.chars(tag.value, nocased)
        return
      case 'pre':
      case 'script':
        this.latex += tag.value
        return
    }

    this.stack.unshift(tag)

    let latex = '...' // default to no-op
    switch (tag.nodeName) {
      case 'i':
      case 'em':
      case 'italic':
      case 'emphasis':
        latex = '\\emph{...}'
        break

      case 'b':
      case 'strong':
        latex = '\\textbf{...}'
        break

      case 'tt':
      case 'code':
        latex = '\\texttt{...}'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (tag.attr.href && tag.attr.href.length) latex = `\\href{${tag.attr.href.replace(/[{}]/g, '').replace(/([\\%#])/g, '\\$1')}}{...}`
        break

      case 'sup':
        latex = '\\textsuperscript{...}'
        break

      case 'sub':
        latex = '\\textsubscript{...}'
        break

      case 'br':
        latex = ''
        /* line-breaks on empty line makes LaTeX sad */
        if (this.latex !== '' && this.latex[this.latex.length - 1] !== '\n') latex = '\\\\'
        latex += '\n...'
        break

      case 'p':
      case 'div':
      case 'table':
      case 'tr':
        latex = '\n\\par\n...\n\\par\n'
        break

      case 'h1':
      case 'h2':
      case 'h3':
      case 'h4':
        latex = `\n\n\\${'sub'.repeat(parseInt(tag.nodeName[1]) - 1)}section{...}\n\n`
        break

      case 'ol':
        latex = '\n\n\\begin{enumerate}\n...\n\n\\end{enumerate}\n'
        break
      case 'ul':
        latex = '\n\n\\begin{itemize}\n...\n\n\\end{itemize}\n'
        break
      case 'li':
        latex = '\n\\item ...'
        break

      case 'span':
      case 'sc':
      case 'nc':
        break // ignore, handled by the relax/nocase/smallcaps handler below

      case 'header':
      case 'section':
        break // not really a good analogue for this

      case 'td':
      case 'th':
        latex = ' ... '
        break

      case '#comment':
      case '#document':
      case '#document-fragment':
      case 'tbody':
      case 'html':
      case 'head':
      case 'body':
        break // ignore

      case 'blockquote':
        latex = '\n\n\\begin{quotation}\n...\n\n\\end{quotation}\n'
        break

      case 'img':
        // latex does not support remote images
        // if (tag.attr.src) latex = `\\includegraphics{${tag.attr.src}}`
        break


      default:
        log.error(`unexpected tag '${tag.nodeName}' (${Object.keys(tag)})`)
        break
    }

    if (latex !== '...') latex = this.embrace(latex, /^\\[a-z]+{\.\.\.}$/.test(latex))
    if (tag.smallcaps) latex = this.embrace(`\\textsc{${latex}}`, true)
    if (tag.nocase) latex = `{{${latex}}}`
    if (tag.relax) latex = `{\\relax ${latex}}`
    if (tag.enquote) {
      if (this.translation.BetterBibTeX) {
        latex = `\\enquote{${latex}}`
      }
      else {
        latex = `\\mkbibquote{${latex}}`
      }
    }

    const [prefix, postfix] = latex.split('...')

    this.latex += prefix
    for (const child of tag.childNodes) {
      this.walk(child, nocased || tag.nocase)
    }
    this.latex += postfix

    this.stack.shift()

  }

  private embrace(latex: string, condition: boolean): string {
    /* holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane */
    /* https://github.com/retorquere/zotero-better-bibtex/issues/541 */
    /* https://github.com/plk/biblatex/issues/459 ... oy! */
    if (!this.embraced) this.embraced = this.options.caseConversion && (((this.latex || latex)[0] !== '\\') || this.translation.BetterBibTeX)
    if (!this.embraced || !condition) return latex
    return `{${latex}}`
  }

  private chars(text, nocased) {
    if (this.options.html) text = HE.decode(text, { isAttributeValue: true })

    let latex = ''
    let mode = 'text'
    let braced = 0

    const switchTo = {
      math: (nocased ? '$' : '{$'),
      text: (nocased ? '$' : '$}'),
    }

    text = text.normalize('NFD') // required for multi-diacritics
    let mapped: LatexRepresentation
    let switched: boolean
    let m: RegExpExecArray | RegExpMatchArray
    let i: number
    let diacritic: { command: string, mode: string }
    const l: number = text.length
    for (i = 0; i < l; i++) {
      mapped = null

      // tie "i","︠","a","︡"
      if (text[i + 1] === '\ufe20' && text[i + 3] === '\ufe21') {
        mapped = this.mapping[text.substr(i, 4)] || { text: `${text[i]}${text[i + 2]}` }
        i += 3
      }

      if (!mapped && !this.translation.unicode) {
        // combining diacritics. Relies on NFD always being mapped, otherwise NFC won't be tested

        if (m = combining_diacritics.exec(text.substring(i))) {
          // try compact representation first
          mapped = this.mapping[m[0].normalize('NFC')]

          // normal char + 1 or two following combining diacritics
          if (!mapped && (diacritic = unicode2latex.diacritics.tolatex[m[0].substr(1,2)])) {
            const char = (this.mapping[text[i]] || { text: text[i], math: text[i] })[diacritic.mode]
            if (char) {
              const cmd = diacritic.command.match(/[a-z]/)

              if (this.translation.BetterBibTeX && diacritic.mode === 'text') {
                // needs to be braced to count as a single char for name abbreviation
                mapped = ({ [diacritic.mode]: `{\\${diacritic.command}${cmd ? ' ': ''}${char}}` } as LatexRepresentation)

              }
              else if (cmd && char.length === 1) {
                mapped = ({ [diacritic.mode]: `\\${diacritic.command} ${char}` } as LatexRepresentation)

              }
              else if (cmd) {
                mapped = ({ [diacritic.mode]: `\\${diacritic.command}{${char}}` } as LatexRepresentation)

              }
              else {
                mapped = ({ [diacritic.mode]: `\\${diacritic.command}${char}` } as LatexRepresentation)
              }

              // support for multiple-diacritics is taken from tipa, which doesn't support more than 2
              if (m[0].length > 3) log.error('discarding diacritics > 2 from', m[0])
            }
          }

          if (mapped) i += m[0].length - 1
        }
      }

      // ??
      if (!mapped && text[i + 1] && (mapped = this.mapping[text.substr(i, 2)])) {
        i += 1
      }

      // fallback -- single char mapping
      if (!mapped) mapped = this.mapping[text[i]] || { text: text[i] }

      // in and out of math mode
      if (!mapped[mode]) {
        mode = switchMode[mode]
        latex += switchTo[mode]
        switched = true
      }
      else {
        switched = false
      }

      // balance out braces with invisible braces until http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754 is widely deployed
      switch (mapped[mode]) {
        case '\\{': braced += 1; break
        case '\\}': braced -= 1; break
      }
      if (braced < 0) {
        latex += '\\vphantom\\{'
        braced = 0
      }

      // if we just switched out of math mode, and there's a lone sup/sub at the end, unpack it. The extra option brace is for when we're in nocased mode (see switchTo)
      if (switched && mode === 'text' && (m = latex.match(/([\^_])\{(.)\}(\$\}?)$/))) {
        latex = latex.slice(0, latex.length - m[0].length) + m[1] + m[2] + m[3]
      }

      latex += mapped[mode]
      if (mapped.commandspacer) latex += '\0' // clean up below

      // only try to merge sup/sub if we were already in math mode, because if we were previously in text mode, testing for _^ is tricky.
      if (!switched && mode === 'math' && (m = latex.match(/(([\^_])\{[^{}]+)\}\2{(.\})$/))) {
        latex = latex.slice(0, latex.length - m[0].length) + m[1] + m[3]
      }

      const pkgs = (mapped[`${mode}packages`] as string[])
      if (pkgs) {
        for (const pkg of pkgs) {
          this.packages[pkg] = true
        }
      }
    }

    // add any missing closing phantom braces
    switch (braced) {
      case 0:
        break
      case 1:
        latex += '\\vphantom\\}'
        break
      default:
        latex += `\\vphantom{${'\\}'.repeat(braced)}}`
        break
    }

    // might still be in math mode at the end
    if (mode === 'math') latex += switchTo.text

    this.latex += latex.normalize('NFC')
  }
}
