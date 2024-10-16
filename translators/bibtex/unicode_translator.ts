import { Translation } from '../lib/translator'
import { HTMLParser } from '../../content/text'

import type { MarkupNode } from '../../typings/markup'

import { log } from '../../content/logger/simple'
import HE = require('he')
import { Transform } from 'unicode2latex'

export type ConverterOptions = {
  caseConversion?: boolean
  html?: boolean
  creator?: boolean
  commandspacers?: boolean
}

export function replace_command_spacers(latex: string): string {
  return latex.replace(/\0(\s)/g, '{}$1').replace(/\0([^;.,!?${}_^\\/])/g, ' $1').replace(/\0/g, '')
}

export type ParseResult = { latex: string; raw: boolean; packages: string[] }

export type Mode = 'minimal' | 'bibtex' | 'biblatex'

export class HTMLConverter {
  private latex = ''
  private tx: Transform
  private stack: any[] = []
  private options: ConverterOptions = {}
  private embraced: boolean
  private packages: Set<string> = new Set
  private translation: Translation

  constructor(translation: Translation, mode: 'minimal' | 'bibtex' | 'biblatex') {
    this.translation = translation
    log.debug(`3020: ${JSON.stringify(translation.charmap)}`)
    this.tx = new Transform(mode, {
      math: this.translation.collected.preferences.mapMath,
      text: this.translation.collected.preferences.mapText,
      charmap: translation.charmap,
      ascii: this.translation.collected.preferences.ascii,
      packages: this.translation.collected.preferences.packages.trim().split(/\s*,\s*/),
    })
  }

  public tolatex(source: string, options: ConverterOptions): ParseResult {
    this.embraced = false
    this.options = options
    this.latex = ''
    this.packages = new Set
    this.stack = []

    const ast: MarkupNode = HTMLParser.parse(source, {
      html: options.html,
      caseConversion: options.caseConversion,
      exportBraceProtection: this.translation.collected.preferences.exportBraceProtection,
      csquotes: this.translation.collected.preferences.csquotes,
      exportTitleCase: this.translation.collected.preferences.exportTitleCase,
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

    return { latex: this.latex, raw: ast.nodeName === 'pre', packages: [...this.packages]}
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
        if (tag.attr.href && tag.attr.href.length) latex = `\\href{${ tag.attr.href.replace(/[{}]/g, '').replace(/([\\%#])/g, '\\$1') }}{...}`
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
        latex = `\n\n\\${ 'sub'.repeat(parseInt(tag.nodeName[1]) - 1) }section{...}\n\n`
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
        log.error(`unexpected tag '${ tag.nodeName }' (${ Object.keys(tag) })`)
        break
    }

    if (latex !== '...') latex = this.embrace(latex, /^\\[a-z]+{\.\.\.}$/.test(latex))
    if (tag.smallcaps) latex = this.embrace(`\\textsc{${ latex }}`, true)
    if (tag.nocase) latex = `{{${ latex }}}`
    if (tag.relax) latex = `{\\relax ${ latex }}`
    if (tag.enquote) {
      if (this.translation.BetterBibTeX) {
        latex = `\\enquote{${ latex }}`
      }
      else {
        latex = `\\mkbibquote{${ latex }}`
      }
    }

    const [ prefix, postfix ] = latex.split('...')

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
    return `{${ latex }}`
  }

  private chars(text, nocased) {
    if (this.options.html) text = HE.decode(text, { isAttributeValue: true })
    this.latex += this.tx.tolatex(text, { bracemath: !nocased, preservemacrospacers: true, packages: this.packages })
  }
}
