declare const Translator: any

const YAML = require('js-yaml')

import Exporter = require('./csl/csl.ts')
import debug = require('./lib/debug.ts')
import markupParser = require('./lib/markupparser.ts')

const htmlConverter = new class HTML {
  private markdown: string

  public convert(html) {
    this.markdown = ''
    this.walk(markupParser.parse(html))
    return this.markdown
  }

  private walk(tag) {
    if (!tag) return

    if (['#text', 'pre'].includes(tag.name)) {
      this.markdown += tag.text.replace(/([\[*~^])/g, '\\$1')
      return
    }

    let span_attrs = ''
    switch (tag.name) {
      case 'i': case 'em': case 'italic':
        this.markdown += '*'
        break

      case 'b': case 'strong':
        this.markdown += '**'
        break

      case 'a':
        /* zotero://open-pdf/0_5P2KA4XM/7 is actually a reference. */
        if (tag.attr.href && tag.attr.href.length) this.markdown += '['
        break

      case 'sup':
        this.markdown += '^'
        break

      case 'sub':
        this.markdown += '~'
        break

      case 'sc':
        this.markdown += '<span style="font-variant:small-caps;">'
        tag.attr.style = 'font-variant:small-caps;'
        break

      case 'span':
        for (const [k, v] of Object.entries(tag.attr)) {
          span_attrs += ` ${k}="${v}"`
        }
        if (span_attrs) this.markdown += `<span${span_attrs}>`
        break

      case 'tbody': case '#document': case 'html': case 'head': case 'body':
        break // ignore

      default:
        debug(`unexpected tag '${tag.name}'`)
    }

    for (const child of tag.children) {
      this.walk(child)
    }

    switch (tag.name) {
      case 'i': case 'italic': case 'em':
        this.markdown += '*'
        break

      case 'b': case 'strong':
        this.markdown += '**'
        break

      case 'sup':
        this.markdown += '^'
        break

      case 'sub':
        this.markdown += '~'
        break

      case 'a':
        if (tag.attr.href && tag.attr.href.length) this.markdown += `](${tag.attr.href})`
        break

      case 'sc':
        this.markdown += '</span>'
        break

      case 'span':
        if (span_attrs) this.markdown += '</span>'
        break
    }
  }
}

Exporter.serialize = csl => {
  for (const [k, v] of Object.entries(csl)) {
    if (typeof v === 'string' && v.indexOf('<') >= 0) csl[k] = htmlConverter.convert(v)
  }
  return YAML.safeDump([csl], {skipInvalid: true})
}

Exporter.flush = items => `---\nreferences:\n${items.join('\n')}...\n`

Translator.doExport = () => Exporter.doExport()
