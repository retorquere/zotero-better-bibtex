import { Translation } from '../lib/translator'
import { titleCase } from '../../content/text'

import { log } from '../../content/logger'
import { regex as escapeRE } from '../../content/escape'
import { decodeHTMLAttribute } from 'entities'
import { Transform } from '@retorquere/bibtex-parser'
import { parseFragment, serialize } from 'parse5'
import type { DefaultTreeAdapterTypes } from 'parse5'

const punctuation = /\.\u002D\u2000-\u206F\u2E00-\u2E7F\\'!"#\$%&\(\)\*\+,\/:;<=>\?@\[\]^_`{\|}~/.source
const lower = '\\p{Ll}\\p{Lt}\\p{Lm}\\p{Lo}\\p{Mn}\\p{Mc}\\p{Nd}\\p{Nl}'
const letters = `\\p{Lu}${lower}`
const whitespace = ' \t\n\r\u00A0'
const protectedWord = `[${lower}]*[\\p{Lu}][${letters}]*`
const leadingUnprotectedWord = new RegExp(`^([\\p{Lu}][${lower}]*)[${whitespace}${punctuation}]`, 'u')
const protectedWords = new RegExp(`^(${protectedWord})((([-${whitespace}])(${protectedWord}))|(-\\d+))*`, 'u')
const unprotectedWord = new RegExp(`^[${letters}]+`, 'u')
const leadingWhitespace = new RegExp(`^[${whitespace}]+`)
const ligatures: Record<string, string> = { ǳ: 'dz', ﬀ: 'ff', ﬁ: 'fi', ﬂ: 'fl', ﬃ: 'ffi', ﬄ: 'ffl', ﬆ: 'st', ĳ: 'ij', ǉ: 'lj', ǌ: 'nj' }
const ligatureRE = new RegExp(`[${Object.keys(ligatures).join('')}]`, 'g')
const spuriousNodes = new Set([ '#document-fragment', '#document', 'div', 'span' ])
const quotePatterns = new Map<string, { re: RegExp; repl: string }>

type Tag = {
  nodeName: string
  attr: Record<string, string>
  class: Record<string, boolean>
  smallcaps?: boolean
  nocase?: boolean
  relax?: boolean
  enquote?: boolean
  tt?: boolean
}

// Text offsets and lengths are UTF-16 code units, not UTF-8 bytes.
type Event =
  | { kind: 'open'; tag: Tag; children: number; latex: string }
  | { kind: 'close' }
  | { kind: 'text'; value: string; offset: number; title: boolean }
  | { kind: 'raw'; value: string }

type Fragment = { tag: Tag; body: Event[]; children: number }

export type ConverterOptions = {
  exportCaseProtection?: boolean
  exportTitleCase?: boolean
  html?: boolean
  creator?: boolean
  /** Keep NUL command-boundary markers for resolution after the caller joins LaTeX fragments. */
  commandspacers?: boolean
}

/**
 * The Unicode transformer can map a character such as `æ` to the TeX control word `\ae`.
 * TeX reads following letters as part of that command, so naively converting `æther` to
 * `\aether` would invoke the wrong command. Also, TeX consumes a space immediately after
 * a control word, so `æ ther` cannot simply become `\ae ther` without losing the space.
 *
 * The transformer leaves a NUL after such commands because text nodes, markup and creator
 * name parts can be converted separately: only after joining them is the next output
 * character known. Resolve the marker using that context:
 * - `\ae\0ther` becomes `\ae ther`; TeX consumes the space as a command delimiter.
 * - `\ae\0 ther` becomes `\ae{} ther`; the empty group preserves the following space.
 * - `\ae\0,` becomes `\ae,`; `;.,!?${}_^\/` are emitted without a spacer.
 * Other non-whitespace characters receive a delimiter space; a final marker is removed.
 */
export function replace_command_spacers(latex: string): string {
  return latex.replace(/\0(\s)/g, '{}$1').replace(/\0([^;.,!?${}_^\\/])/g, ' $1').replace(/\0/g, '')
}

export type TeX = { latex: string; raw: boolean; packages: string[] }

/** Convert Zotero's limited markup or full HTML to LaTeX, tracking case protection and required packages. */
export class HTMLConverter {
  private latex = ''
  private tx!: Transform
  private txt!: Transform
  private txc!: Transform
  private options: ConverterOptions = {}
  private embraced!: boolean
  private packages: Set<string> = new Set
  private translation: Translation
  private sentenceStart = true
  private titleText = ''

  /** Configure the Unicode transformers for this translation and its export preferences. */
  constructor(translation: Translation) {
    this.translation = translation

    const options = {
      math: this.translation.collected.preferences.mapMath,
      text: this.translation.collected.preferences.mapText,
      charmap: translation.charmap,
      ascii: this.translation.collected.preferences.ascii,
      packages: this.translation.collected.preferences.packages.trim().split(/\s*,\s*/),
    }

    // Unicode exports use minimal escaping; BibTeX creators have separate name-escaping rules.
    const mode = translation.unicode ? 'minimal' : (translation.BetterBibTeX ? 'bibtex' : 'biblatex')
    this.txt = new Transform(mode, options)
    this.txc = mode === 'bibtex' ? new Transform('bibtex-creator', options) : this.txt
  }

  /** Reset per-conversion state, build and render the event stream, and return LaTeX and used packages. */
  public tolatex(source: string, options: ConverterOptions): TeX {
    this.tx = options.creator ? this.txc : this.txt

    this.embraced = false
    this.options = options
    this.latex = ''
    this.packages = new Set
    this.sentenceStart = true
    this.titleText = ''

    // Title casing needs the complete text, and nocase can move outside its
    // ancestors. Build output operations during the single parse5 tree walk,
    // then render them once the title and the final wrapper order are known.
    const stream = this.parse(source)
    const title = options.exportCaseProtection && options.exportTitleCase !== false ? titleCase(this.titleText) : ''
    const stack: { postfix: string; nocase: boolean }[] = []
    let nocased = false
    // Open/close events maintain output order and the enclosing case-protection state.
    for (const event of stream) {
      switch (event.kind) {
        case 'text':
          this.chars(title && event.title ? title.substr(event.offset, event.value.length) : event.value, nocased)
          break
        case 'raw':
          this.latex += event.value
          break
        case 'open': {
          // With case protection enabled, suppress nested nocase markers; retain meaningful <pre> wrappers.
          const tag = this.options.exportCaseProtection && nocased && event.tag.nocase ? { ...event.tag, nocase: false } : event.tag
          const spurious = spuriousNodes.has(tag.nodeName) && Object.keys(tag.attr).length === 0 && !tag.nocase && !tag.tt && event.children === 1
          const postfix = spurious ? '' : this.open(tag, event.latex)
          stack.push({ postfix, nocase: nocased })
          nocased ||= !!tag.nocase
          break
        }
        case 'close': {
          const state = stack.pop()!
          this.latex += state.postfix
          nocased = state.nocase
          break
        }
      }
    }

    // Creator parts retain markers until their caller has assembled and joined the names.
    if (!options.commandspacers) this.latex = replace_command_spacers(this.latex)

    this.latex = this.latex
      // .replace(/(\\\\)+[^\S\n]*\n\n/g, '\n\n') // I don't recall why I had the middle match, replaced by match below until I figure it out
      .replace(/(\\\\)+\n\n/g, '\n\n') // paragraph breaks followed by line breaks == line breaks
      .replace(/\n\n\n+/g, '\n\n') // line breaks > 3 is the same as two line breaks.
      .replace(/(\\par[\n\s~]+)+/g, '\\par\n')
      .replace(/\n*\\par\n*$/, '')
      .replace(/^\n*\\par\n*/, '')

    return { latex: this.latex, raw: false, packages: [...this.packages] }
  }

  /** Preprocess quotes and minimal markup, then turn the parse5 fragment into output events. */
  private parse(source: string): Event[] {
    const csquotes = this.translation.collected.preferences.csquotes
    if (csquotes) {
      // Quote pairs are literal; cache their combined pattern and mark matches for LaTeX quotation.
      let action = quotePatterns.get(csquotes)
      if (!action) {
        const patterns: string[] = []
        let repl = '<span class="enquote">'
        for (const pair of csquotes.match(/../g) || []) {
          const open = escapeRE(pair[0])
          const close = escapeRE(pair[1])
          patterns.push(`${open}\\s*([^${close}]*?)\\s*${close}`)
          repl += `$${patterns.length}`
        }
        action = { re: new RegExp(patterns.join('|'), 'g'), repl: patterns.length ? `${repl}</span>` : '' }
        quotePatterns.set(csquotes, action)
      }
      if (action.repl) source = source.replace(action.re, action.repl)
    }

    // Pseudo-HTML preserves literal entities and treats tags outside the allowlist as text.
    if (!this.options.html) {
      source = source.replace(/&/g, '&amp;')
      source = source.replace(/<(\/?)([^<>]*)>/g, (match, close, body) => {
        if (body.match(/^(pre|emphasis|span|nc|sc|i|b|sup|sub|script)($|\n|\s)/i)) return match
        return match.replace(/</g, '&lt;').replace(/>/g, '&gt;')
      })
    }

    // Case-protection hoisting can split the root into several sibling fragments.
    const fragments = this.parseNode(parseFragment(source), false, false)
    if (fragments.length === 1) return this.events(fragments[0])
    return this.events({ tag: this.tag('span'), body: fragments.flatMap(fragment => this.events(fragment)), children: fragments.length })
  }

  /** Wrap a fragment's body in open/close events; text and raw scripts already contain their events. */
  private events(fragment: Fragment): Event[] {
    if (fragment.tag.nodeName === '#text' || fragment.tag.nodeName === 'script') return fragment.body
    return [{ kind: 'open', tag: fragment.tag, children: fragment.children, latex: this.template(fragment.tag) }, ...fragment.body, { kind: 'close' }]
  }

  /** Create the normalized tag representation used by the event stream. */
  private tag(nodeName: string): Tag {
    return { nodeName, attr: {}, class: {} }
  }

  /**
   * Normalize one parse5 node and its descendants into fragments.
   * isNocased and noTitle describe the enclosing context, not the current node.
   */
  private parseNode(node: DefaultTreeAdapterTypes.Node, isNocased: boolean, noTitle: boolean): Fragment[] {
    const tag = this.tag(node.nodeName)
    for (const { name, value } of ('attrs' in node ? node.attrs : [])) tag.attr[name] = value
    for (const cls of (tag.attr.class || '').trim().split(/\s+/)) {
      if (cls) tag.class[cls] = true
    }
    switch (node.nodeName) {
      case '#document':
      case '#document-fragment':
        tag.nodeName = 'span'
        break
      case 'script':
        // Raw LaTeX is emitted without interpreting its contents as markup.
        if ('childNodes' in node) return this.raw(tag, serialize(node))
        break
      case 'pre':
        // Pseudo-HTML and math pre blocks are raw; ordinary HTML pre blocks are monospaced.
        if ((!this.options.html || tag.class.math) && 'childNodes' in node) {
          tag.nodeName = 'script'
          return this.raw(tag, serialize(node))
        }
        tag.nodeName = 'span'
        tag.tt = true
        break
      case 'nc':
        // Normalize Zotero's shorthand tags to the flags used by the renderer.
        tag.nodeName = 'span'
        tag.attr.nocase = 'nocase'
        break
      case 'emphasis':
        tag.nodeName = 'i'
        break
      case 'sc':
        tag.nodeName = 'span'
        tag.attr.smallcaps = 'smallcaps'
        break
    }

    // Only the outermost explicit nocase marker needs to be emitted.
    if (tag.attr.nocase || tag.class.nocase) tag.nocase = !isNocased
    if (tag.attr.relax || tag.class.relax) tag.relax = true
    if (tag.class.enquote || tag.attr.enquote) tag.enquote = true
    if (!tag.attr.smallcaps && (tag.attr.style || '').match(/small-caps/i)) tag.attr.smallcaps = 'smallcaps'
    if (tag.class.smallcaps || tag.attr.smallcaps) tag.smallcaps = true

    // Superscripts, subscripts, and protected content contribute to title context but are not title-cased.
    const children: Fragment[] = []
    const skipTitle = noTitle || !!tag.nocase || tag.nodeName === 'sup' || tag.nodeName === 'sub'
    for (const child of ('childNodes' in node ? node.childNodes : [])) {
      if (child.nodeName !== '#text' || !('value' in child)) {
        children.push(...this.parseNode(child, isNocased || !!tag.nocase, skipTitle))
        continue
      }

      // Already protected text, or text exported without case protection, needs no word splitting.
      if (!this.options.exportCaseProtection || isNocased) {
        this.plaintext(children, child.value, skipTitle)
        continue
      }

      let text: string = child.value
      let match: RegExpExecArray | null
      while (text) {
        // Whitespace and sentence punctuation do not consume the initial-word exemption.
        if ((match = leadingWhitespace.exec(text)) || (match = /^[:?]/.exec(text))) {
          this.plaintext(children, match[0], skipTitle)
          text = text.substring(match[0].length)
          continue
        }
        // A normally capitalized initial word is not automatically brace-protected.
        if (this.sentenceStart && (match = leadingUnprotectedWord.exec(`${text} `))) {
          this.sentenceStart = false
          this.plaintext(children, match[1], skipTitle)
          text = text.substring(match[1].length)
          continue
        }
        this.sentenceStart = false
        // Preserve capitalized words when requested, and URLs even without automatic brace protection.
        if ((this.translation.collected.preferences.exportBraceProtection && (match = protectedWords.exec(text))) || (match = /^(https?|mailto):\/\/[^\s]+/.exec(text))) {
          const value = match[0]
          const protectedTag = this.tag('span')
          protectedTag.nocase = true
          const event: Event = { kind: 'text', value, offset: this.titleText.length, title: false }
          this.titleText += value
          children.push({ tag: protectedTag, body: [event], children: 1 })
          text = text.substring(value.length)
        }
        else {
          match = unprotectedWord.exec(text)
          const value = match ? match[0] : text[0]
          this.plaintext(children, value, skipTitle)
          text = text.substring(value.length)
        }
      }
    }

    // Lift protected children outside their formatting parent, duplicating the parent around each sibling.
    if (this.options.exportCaseProtection && !tag.nocase && children.some(child => child.tag.nocase)) {
      return children.map(child => {
        if (child.tag.nocase) {
          const inner: Fragment = { tag, body: child.body, children: child.children }
          return { tag: child.tag, body: this.events(inner), children: 1 }
        }
        return { tag, body: this.events(child), children: 1 }
      })
    }
    return [{ tag, body: children.flatMap(child => this.events(child)), children: children.length }]
  }

  /** Emit raw LaTeX and reserve equal-length placeholder text for title-case offsets and context. */
  private raw(tag: Tag, value: string): Fragment[] {
    this.titleText += ''.padStart(value.length, 'latex')
    return [{ tag, body: [{ kind: 'raw', value }], children: 0 }]
  }

  /** Expand ligatures, merge adjacent text events, and record their positions in the full title text. */
  private plaintext(children: Fragment[], text: string, noTitle: boolean): void {
    text = text.replace(ligatureRE, ligature => ligatures[ligature])
    const previous = children.at(-1)
    if (previous?.tag.nodeName === '#text') {
      const event = previous.body[0]
      if (event.kind === 'text') event.value += text
    }
    else {
      children.push({
        tag: this.tag('#text'),
        body: [{ kind: 'text', value: text, offset: this.titleText.length, title: !noTitle }],
        children: 0,
      })
    }
    this.titleText += text
  }

  /** Map a tag to a LaTeX template; the control character marks where its children will be rendered. */
  private template(tag: Tag): string {
    let latex = '\x1D' // default to no-op
    switch (tag.nodeName) {
      case 'i':
      case 'em':
      case 'italic':
      case 'emphasis':
        // BibLaTeX uses its bibliography-aware emphasis command.
        if (this.translation.BetterBibTeX) {
          latex = '\\emph{\x1D}'
        }
        else {
          latex = '\\mkbibemph{\x1D}'
        }
        break

      case 'b':
      case 'strong':
        latex = '\\textbf{\x1D}'
        break

      case 'tt':
      case 'code':
        latex = '\\texttt{\x1D}'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (tag.attr?.href && tag.attr.href.length) latex = `\\href{${ tag.attr.href.replace(/[{}]/g, '').replace(/([\\%#])/g, '\\$1') }}{\x1D}`
        break

      case 'sup':
        latex = '\\textsuperscript{\x1D}'
        break

      case 'sub':
        latex = '\\textsubscript{\x1D}'
        break

      case 'br':
        latex = '\n\x1D'
        break

      case 'p':
      case 'div':
      case 'table':
      case 'tr':
        // Block elements delimit their contents with paragraphs; cleanup removes redundant breaks.
        latex = '\n\\par\n\x1D\n\\par\n'
        break

      case 'ol':
        latex = '\n\n\\begin{enumerate}\n\x1D\n\n\\end{enumerate}\n'
        break
      case 'ul':
        latex = '\n\n\\begin{itemize}\n\x1D\n\n\\end{itemize}\n'
        break
      case 'li':
        latex = '\n\\item \x1D'
        break

      case 'span':
      case 'sc':
      case 'nc':
        break // ignore, handled by the relax/nocase/smallcaps handler below

      case 'address':
        latex = '\x1D'
        break // take only contents

      case 'header':
      case 'section':
        break // not really a good analogue for this

      case 'td':
      case 'th':
        latex = ' \x1D '
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
        latex = '\n\n\\begin{quotation}\n\x1D\n\n\\end{quotation}\n'
        break

      case 'img':
        // latex does not support remote images
        // if (tag.attr.src) latex = `\\includegraphics{${tag.attr.src}}`
        break

      default:
        if (tag.nodeName.match(/^h\d+$/)) {
          latex = `\n\n\\${ 'sub'.repeat(parseInt(tag.nodeName[1]) - 1) }section{\x1D}\n\n`
        }
        else {
          // Unknown tags retain their contents but are logged for diagnosis.
          log.error(`unexpected tag '${ tag.nodeName }' (${ Object.keys(tag) })`)
        }
        break
    }

    return latex
  }

  /** Emit a tag's prefix and return its postfix after applying formatting and protection wrappers. */
  private open(tag: Tag, latex: string): string {
    // Line breaks on an empty line make LaTeX unhappy.
    if (tag.nodeName === 'br' && this.latex !== '' && this.latex.at(-1) !== '\n') latex = `\\\\${latex}`
    if (latex !== '\x1D') latex = this.embrace(latex, /^\\[a-z]+{\x1D}$/.test(latex)) // eslint-disable-line no-control-regex
    // Wrapper order is significant: case protection encloses formatting, then relax and quotation.
    if (tag.smallcaps) latex = this.embrace(`\\textsc{${ latex }}`, true)
    if (tag.tt) latex = this.embrace(`\\texttt{${ latex }}`, true)
    if (tag.nocase) latex = `{{${ latex }}}`
    if (tag.relax) latex = `{\\relax ${ latex }}`
    if (tag.enquote) {
      // Use BibLaTeX's bibliography-aware quote command when not exporting Better BibTeX.
      if (this.translation.BetterBibTeX) {
        latex = `\\enquote{${ latex }}`
      }
      else {
        latex = `\\mkbibquote{${ latex }}`
      }
    }

    const [ prefix, postfix ] = latex.split('\x1D')

    this.latex += prefix
    return postfix
  }

  /** Add the extra braces needed for eligible formatting commands under Bib(La)TeX case conversion. */
  private embrace(latex: string, condition: boolean): string {
    /* holy mother of %^$#^%$@ the bib(la)tex case conversion rules are insane */
    /* https://github.com/retorquere/zotero-better-bibtex/issues/541 */
    /* https://github.com/plk/biblatex/issues/459 ... oy! */
    // BibTeX allows the extra protection even when the output starts with a command.
    if (!this.embraced) {
      this.embraced = (this.options.exportCaseProtection && (((this.latex || latex)[0] !== '\\') || this.translation.BetterBibTeX)) as boolean
    }
    if (!this.embraced || !condition) return latex
    return `{${ latex }}`
  }

  /** Transform text to LaTeX, suppressing math braces inside nocase and collecting required packages. */
  private chars(text, nocased) {
    if (this.options.html) text = decodeHTMLAttribute(text)
    // Retain command-boundary markers until all markup and adjacent text have been rendered.
    this.latex += this.tx.tolatex(text, { bracemath: !nocased, preservemacrospacers: true, packages: this.packages })
  }
}
