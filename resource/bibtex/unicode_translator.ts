import { ITranslator } from '../../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import debug = require('../lib/debug.ts')
import MarkupParser = require('../lib/markupparser.ts')
const unicodeMapping = require('./unicode_translator.json')

const htmlConverter = new class HTMLConverter {
  private latex: string
  private mapping: any
  private stack: any[]
  private options: { caseConversion?: boolean, mode?: string }
  private embraced: boolean

  public convert(html, options) {
    this.embraced = false
    this.options = options
    this.latex = ''
    this.mapping = (Translator.unicode ? unicodeMapping.unicode : unicodeMapping.ascii)

    this.stack = []

    const ast = MarkupParser.parse(html, this.options)
    this.walk(ast)
    return { latex: this.latex, raw: ast.name === 'pre' }
  }

  private walk(tag) {
    if (!tag) return

    switch (tag.name) {
      case '#text':
        this.chars(tag.text)
        return
      case 'pre':
        this.latex += tag.text
        return
    }

    this.stack.unshift(tag)

    let latex = '...' // default to no-op
    switch (tag.name) {
      case 'i': case 'em': case 'italic':
        latex = '\\emph{...}'
        break

      case 'b': case 'strong':
        latex = '\\textbf{...}'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if ((tag.attrs.href ? tag.attrs.href.length : undefined) > 0) latex = `\\href{${tag.attrs.href}}{...}`
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

      case 'p': case 'div': case 'table': case 'tr':
        latex = '\n\n...\n\n'
        break

      case 'h1': case 'h2': case 'h3': case 'h4':
        latex = `\n\n\\${(new Array(parseInt(tag.name[1]))).join('sub')}section{...}\n\n`
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

      case 'enquote':
        if (Translator.BetterBibTeX) {
          latex = '\\enquote{...}'
        } else {
          latex = '\\mkbibquote{...}'
        }
        break

      case 'span':
      case 'sc':
      case 'nc':
        break // ignore, handled by the relax/nocase/smallcaps handler below

      case 'td':
      case 'th':
        latex = ' ... '
        break

      case 'tbody': case '#document': case 'html': case 'head': case 'body':
        break // ignore

      default:
        debug(`unexpected tag '${tag.name}' (${Object.keys(tag)})`)
    }

    if (latex !== '...') latex = this.embrace(latex, latex.match(/^\\[a-z]+{\.\.\.}$/))
    if (tag.smallcaps) latex = this.embrace(`\\textsc{${latex}}`, true)
    if (tag.nocase) latex = `{{${latex}}}`
    if (tag.relax) latex = `{\\relax ${latex}}`

    const [prefix, postfix] = latex.split('...')

    this.latex += prefix
    for (const child of tag.children) {
      this.walk(child)
    }
    this.latex += postfix

    this.stack.shift()

  }

  private embrace(latex, condition) {
    /* holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane */
    /* https://github.com/retorquere/zotero-better-bibtex/issues/541 */
    /* https://github.com/plk/biblatex/issues/459 ... oy! */
    if (!this.embraced) this.embraced = this.options.caseConversion && (((this.latex || latex)[0] !== '\\') || Translator.BetterBibTeX)
    if (!this.embraced || !condition) return latex
    return `{${latex}}`
  }

  private chars(text) {
    let latex = ''
    let math = false
    let braced = 0

    for (let c of Zotero.Utilities.XRegExp.split(text, '')) {
      // in and out of math mode
      if (!!this.mapping.math[c] !== math) {
        latex += '$'
        math = !!this.mapping.math[c]
      }

      /* balance out braces with invisible braces until http://tex.stackexchange.com/questions/230750/open-brace-in-bibtex-fields/230754#comment545453_230754 is widely deployed */
      switch (c) {
        case '{': braced += 1; break
        case '}': braced -= 1; break
      }
      if (braced < 0) {
        latex += '\\vphantom\\{'
        braced = 0
      }

      c = this.mapping.math[c] || this.mapping.text[c] || c
      latex += this.embrace(c, unicodeMapping.embrace[c])
    }

    // add any missing closing phantom braces
    switch (braced) {
      case 0:
        break // pass
      case 1: latex += '\\vphantom\\}'; break
      default: latex += `\\vphantom{${(new Array(braced + 1)).join('\\}')}}`
    }

    // might still be in math mode at the end
    if (math) latex += '$'

    /* minor cleanup */
    latex = latex.replace(/([^\\])({})+([^ 0-9a-z])/ig, '$1$3')

    this.latex += latex
  }
}

export function html2latex(html, options) {
  if (!options.mode) options.mode = 'html'
  const latex = htmlConverter.convert(html, options)
  latex.latex = latex.latex
    .replace(/(\\\\)+[^\S\n]*\n\n/g, '\n\n')
    .replace(/\n\n\n+/g, '\n\n')
    .replace(/{}([}])/g, '$1')
  return latex
}

export function text2latex(text, options: { caseConversion?: boolean, mode?: string } = {}) {
  if (!options.mode) options.mode = 'text'
  return html2latex(text, options)
}
