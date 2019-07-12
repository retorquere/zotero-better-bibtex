declare const Translator: ITranslator

declare const Zotero: any

import { debug } from '../lib/debug'

import HE = require('he')
import unicodeMapping = require('unicode2latex')

/* https://github.com/retorquere/zotero-better-bibtex/issues/1189
  Needed so that composite characters are counted as single characters
  for in-text citation generation. This messes with the {} cleanup
  so the resulting TeX will be more verbose; doing this only for
  bibtex because biblatex doesn't appear to need it.

  Only testing ascii.text because that's the only place (so far)
  that these have turned up.
*/
if (Translator.BetterBibTeX) {
  let m
  for (const tex of Object.values(unicodeMapping.ascii)) {
    if (!tex.text) continue

    if (tex.text.match(/^\\[`'^~"=.][A-Za-z]$/)) {
      tex.text = `{${tex.text}}`
    } else if (tex.text.match(/^\\[^]\\[ij]$/)) {
      tex.text = `{${tex.text}}`
    } else if (tex.text.match(/^\\[kr]\{[a-zA-Z]\}$/)) {
      tex.text = `{${tex.text}}`
    } else if (m = tex.text.match(/^\\(L|O|AE|AA|DH|DJ|OE|SS|TH|NG)\{\}$/i)) {
      tex.text = `{\\${m[1]}}`
    }
  }
}

const switchMode = {
  math: 'text',
  text: 'math',
}

const htmlConverter = new class HTMLConverter {
  private latex: string
  private mapping: any
  private stack: any[]
  private options: { caseConversion?: boolean, html?: boolean }
  private embraced: boolean
  private packages: { [key: string]: boolean }

  public convert(html, options) {
    this.embraced = false
    this.options = options
    this.latex = ''
    this.packages = {}
    this.mapping = (Translator.unicode ? unicodeMapping.unicode : unicodeMapping.ascii)

    if (!this.mapping.initialized) {
      // translator is re-ran every time it's used, not cached ready-to-run, so safe to modify the mapping
      for (const c of Translator.preferences.ascii) {
        this.mapping[c] = unicodeMapping.ascii[c]
      }

      if (Translator.preferences.mapUnicode === 'conservative') {
        for (const keep of Object.keys(switchMode).sort()) {
          const remove = switchMode[keep]
          const unicode = Translator.preferences[`map${keep[0].toUpperCase()}${keep.slice(1)}`]
          for (const c of unicode) {
            if (this.mapping[c] && this.mapping[c].text && this.mapping[c].math) {
              debug('deleting', this.mapping[c][remove])
              delete this.mapping[c][remove]
            }
          }
        }

      } else {
        const remove = switchMode[Translator.preferences.mapUnicode]
        if (remove) {
          for (const tex of (Object.values(this.mapping) as any[])) {
            debug('deleting', tex[remove])
            if (tex.text && tex.math) delete tex[remove]
          }
        }
      }

      this.mapping.initialized = true
    }

    this.stack = []

    const ast: IZoteroMarkupNode = Zotero.BetterBibTeX.parseHTML(html, this.options)
    this.walk(ast)

    this.latex = this.latex
    // .replace(/(\\\\)+[^\S\n]*\n\n/g, '\n\n') // I don't recall why I had the middle match, replaced by match below until I figure it out
    .replace(/(\\\\)+\n\n/g, '\n\n') // paragraph breaks followed by line breaks == line breaks
    .replace(/\n\n\n+/g, '\n\n') // line breaks > 3 is the same as two line breaks.
    // .replace(/{}([}])/g, '$1') // seems to have become obsolete

    return { latex: this.latex, raw: ast.nodeName === 'pre', packages: Object.keys(this.packages) }
  }

  private walk(tag: IZoteroMarkupNode, nocased = false) {
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
        latex = '\\emph{...}'
        break

      case 'b':
      case 'strong':
        latex = '\\textbf{...}'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (tag.attr.href && tag.attr.href.length) latex = `\\href{${tag.attr.href}}{...}`
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
        latex = '\n\n...\n\n'
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

      case 'td':
      case 'th':
        latex = ' ... '
        break

      case '#document':
      case '#document-fragment':
      case 'tbody':
      case 'html':
      case 'head':
      case 'body':
        break // ignore

      default:
        debug(`unexpected tag '${tag.nodeName}' (${Object.keys(tag)})`)
    }

    if (latex !== '...') latex = this.embrace(latex, latex.match(/^\\[a-z]+{\.\.\.}$/))
    if (tag.smallcaps) latex = this.embrace(`\\textsc{${latex}}`, true)
    if (tag.nocase) latex = `{{${latex}}}`
    if (tag.relax) latex = `{\\relax ${latex}}`
    if (tag.enquote) {
      if (Translator.BetterBibTeX) {
        latex = `\\enquote{${latex}}`
      } else {
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

  private embrace(latex, condition) {
    /* holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane */
    /* https://github.com/retorquere/zotero-better-bibtex/issues/541 */
    /* https://github.com/plk/biblatex/issues/459 ... oy! */
    if (!this.embraced) this.embraced = this.options.caseConversion && (((this.latex || latex)[0] !== '\\') || Translator.BetterBibTeX)
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

    // const chars = Zotero.Utilities.XRegExp.split(text.normalize('NFC'), '')
    const chars: string[] = Array.from(text.normalize('NFC'))
    let mapped, switched, m
    while (chars.length) {
      if (chars.length > 1 && (mapped = this.mapping[chars[0] + chars[1]])) {
        chars.splice(0, 2)

      } else {
        mapped = this.mapping[chars[0]] || { text: chars[0] }
        chars.shift()

      }

      // in and out of math mode
      if (!mapped[mode]) {
        mode = switchMode[mode]
        latex += switchTo[mode]
        switched = true
      } else {
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
        latex = latex.slice(0, latex.length - m[0].length) + m[1] + m[2] + m[3] // tslint:disable-line no-magic-numbers
      }

      latex += mapped[mode]

      // only try to merge sup/sub if we were already in math mode, because if we were previously in text mode, testing for _^ is tricky.
      if (!switched && mode === 'math' && (m = latex.match(/(([\^_])\{[^{}]+)\}\2{(.\})$/))) {
        latex = latex.slice(0, latex.length - m[0].length) + m[1] + m[3] // tslint:disable-line no-magic-numbers
      }

      const pkg = mapped[mode + 'package']
      if (pkg) this.packages[pkg] = true
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

    this.latex += latex
  }
}

export function html2latex(html, options) {
  if (typeof options.html === 'undefined') options.html = true
  const latex = htmlConverter.convert(html, options)
  latex.latex = latex.latex
  return latex
}

export function text2latex(text, options: { caseConversion?: boolean, html?: boolean } = {}) {
  if (typeof options.html === 'undefined') options.html = false
  return html2latex(text, options)
}
