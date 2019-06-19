declare const Zotero: any
declare const Components: any
declare const AddonManager: any

import { Translators } from '../translators'
import * as log from '../debug'
import { getItemsAsync } from '../get-items-async'
import { Preferences as Prefs } from '../prefs'

const unicode2latex = Object.entries(require('unicode2latex/tables/unicode.json')).reduce((acc, pair) => {
  const unicode = pair[0] as string
  const latex = pair[1] as { text: string, math: string }
  acc[unicode] = { text: latex.text || latex.math, math: !!(latex.text) }
  return acc
}, {})
function tolatex(s) {
  if (!s) return ''

  return s.split('')
    .map(c => ({...(unicode2latex[c] || { text: c, math: false }) }) )
    .reduce((acc, c) => {
      const last = acc[acc.length - 1]
      if (last.math === c.math) {
        last.text += c.text
      } else {
        acc.push(c)
      }
      return acc
    })
    .map(c => c.math ? `$${c.text}$` : c.text)
    .join('')
}

const shortLabel = {
  article: 'art.',
  chapter: 'ch.',
  subchapter: 'subch.',
  column: 'col.',
  figure: 'fig.',
  line: 'l.',
  note: 'n.',
  issue: 'no.',
  opus: 'op.',
  page: 'p.',
  paragraph: 'para.',
  subparagraph: 'subpara.',
  part: 'pt.',
  rule: 'r.',
  section: 'sec.',
  subsection: 'subsec.',
  Section: 'Sec.',
  'sub verbo': 'sv.',
  schedule: 'sch.',
  title: 'tit.',
  verse: 'vrs.',
  volume: 'vol.',
}

function citation2latex(citation) {
  let formatted = ''

  if (citation.prefix) formatted += `[${tolatex(citation.prefix)}]`

  log.debug('citation:', citation)
  if (citation.locator && citation.suffix) {
    const label = citation.label === 'page' ? '' : (shortLabel[citation.label] || citation.label) + ' '
    formatted += `[${tolatex(label)}${tolatex(citation.locator)}, ${tolatex(citation.suffix)}]`

  } else if (citation.locator) {
    const label = citation.label === 'page' ? '' : (shortLabel[citation.label] || citation.label) + ' '
    formatted += `[${tolatex(label)}${tolatex(citation.locator)}]`

  } else if (citation.suffix) {
    formatted += `[${tolatex(citation.suffix)}]`

  } else if (citation.prefix) {
    formatted += '[]'
  }

  formatted += `{${citation.citekey}}`

  return formatted
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export let Formatter = new class { // tslint:disable-line:variable-name
  public async playground(citations, options) {
    const formatted = citations.map(cit => `${options.keyprefix || ''}${cit.citekey}${options.keypostfix || ''}`)
    return formatted.length ? `${options.citeprefix || ''}${formatted.join(options.separator || ',')}${options.citekeypostfix || ''}` : ''
  }

  public async citationLinks(citations, options) {
    return citations.map(citation => `cites: ${citation.citekey}`).join('\n')
  }

  public async cite(citations, options) { return this.natbib(citations, options) }
  public async citet(citations, options) { return this.natbib(citations, { command: 'citet', ...options } ) }
  public async citep(citations, options) { return this.natbib(citations, { command: 'citep', ...options } ) }
  public async latex(citations, options) { return this.natbib(citations, options) }

  public async natbib(citations, options) {
    if (!options.command) options.command = 'cite'

    if (citations.length === 0) return ''

    /* test for simple case where multiple references can be put in a single cite */
    if (citations.length > 1) {
      const state = {
        prefix: 0,
        suffix: 0,
        suppressAuthor: 0,
        locator: 0,
        label: 0,
      }

      for (const citation of citations) {
        for (const k of Object.keys(state)) {
          if (citation[k]) state[k]++
        }
      }

      log.debug('citations:', {citations, state})
      if (state.suffix === 0 && state.prefix === 0 && state.locator === 0 && (state.suppressAuthor === 0 || state.suppressAuthor === citations.length)) {
        return `\\${citations[0].suppressAuthor ? 'citeyear' : options.command}{${citations.map(citation => citation.citekey).join(',')}}`
      }
    }

    let formatted = ''
    for (const citation of citations) {
      formatted += '\\'
      formatted += citation.suppressAuthor ? 'citeyear' : options.command
      formatted += citation2latex(citation)
    }

    return formatted
  }

  public async biblatex(citations, options) {
    if (citations.length === 0) return ''

    let command = options.command ? options.command : 'autocite'

    if (citations.length === 1) {
      const citation = citations[0]
      // NOTE: suppressAuthor is only honored when citations.length === 1 and
      // the command is one of \cite, \autocite or \parencite; for other
      // commands, suppressAuthor doesn't make sense, and for multiple
      // citations, biblatex doesn't support suppressing authors on a case by
      // case basis
      const suppressAuthor = citation.suppressAuthor && /^(auto|paren|)cite$/.exec(command) ? '*' : ''
      return `\\${command}${suppressAuthor}${citation2latex(citation)}`
    }

    citations = citations.map(citation2latex).join('')
    if (citations.includes('[')) {
      // there are some pre/post notes → generate a full \XYcites command
      command = command.endsWith('s') ? command : `${command}s`
    } else {
      // there are no pre/post-notes, the citations can be a simple
      // comma-separated list of keys
      citations = citations.replace(/\}\{/g, ',')
    }
    return `\\${command}${citations}`
  }

  public async mmd(citations, options) {
    const formatted = []

    for (const citation of citations) {
      if (citation.prefix) {
        formatted.push(`[${citation.prefix}][#${citation.citekey}]`)
      } else {
        formatted.push(`[#${citation.citekey}][]`)
      }
    }
    return formatted.join('')
  }

  public async pandoc(citations, options) {
    const formatted = []
    for (const citation of citations) {
      let cite = ''
      if (citation.prefix) cite += `${citation.prefix} `
      if (citation.suppressAuthor) cite += '-'
      cite += `@${citation.citekey}`
      if (citation.locator) cite += `, ${shortLabel[citation.label] || citation.label} ${citation.locator}`
      if (citation.suffix) cite += ` ${citation.suffix}`
      formatted.push(cite)
    }

    return `${options.brackets ? '[' : ''}${formatted.join('; ')}${options.brackets ? ']' : ''}`
  }

  public async 'asciidoctor-bibtex'(citations, options) {
    const formatted = []
    for (const citation of citations) {
      let cite = citation.citekey
      if (citation.locator) {
        let label = citation.locator
        if (citation.label !== 'page') label = `${shortLabel[citation.label] || citation.label} ${label}`
        cite += `(${label})`
      }
      formatted.push(cite)
    }

    return `${options.cite || 'cite'}:[${formatted.join(', ')}]`
  }

  public async 'scannable-cite'(citations) {
    const deferred = Zotero.Promise.defer()
    Components.utils.import('resource://gre/modules/AddonManager.jsm')
    AddonManager.getAddonByID('rtf-odf-scan-for-zotero@mystery-lab.com', addon => deferred.resolve(addon && addon.isActive))
    const odfScan = await deferred.promise
    if (!odfScan) throw new Error('scannable-cite needs the "RTF/ODF Scan for Zotero" plugin to be installed')

    log.debug('scannable-cite:', citations)
    const items = await getItemsAsync(citations.map(picked => picked.id))
    const labels = (await Translators.exportItems('248bebf1-46ab-4067-9f93-ec3d2960d0cd', null, { items })).split(/[{}]+/).filter(cite => cite).reduce((result, item) => {
      const [ , text, , , id ] = item.split('|').map(v => v.trim())
      result[id] = text
      return result
    }, {})

    log.debug('CAYW.scannable-cite: picked=', citations, 'formatted=', labels)

    if (citations.length !== Object.keys(labels).length) throw new Error(`Scannable Cite parse error: picked ${citations.length}, found ${Object.keys(labels).length}`)

    let citation = ''
    for (const item of citations) {
      const [ , kind, lib, key ] = item.uri.match(/^http:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
      const id = `${kind === 'users' ? 'zu' : 'zg'}:${lib.startsWith('local/') ? '0' : lib}:${key}`
      if (!labels[id]) throw new Error(`No formatted citation found for ${id}`)

      const enriched = [
        item.prefix || '',
        `${item.suppressAuthor ? '-' : ''}${labels[id]}`,
        item.locator ? `${shortLabel[item.label] || item.label} ${item.locator}` : '',
        item.suffix || '',
        Prefs.testing ? 'zu:0:ITEMKEY' : id,
      ].join(' | ').replace(/ +/g, ' ')

      citation += `{ ${enriched.trim()} }`
    }
    log.debug('CAYW.scannable-cite: picked=', citations, 'formatted=', labels, 'generated=', citation)
    return citation
  }

  public async 'formatted-citation'(citations) {
    const format = Zotero.Prefs.get('export.quickCopy.setting')

    log.debug('formatted-citations:', format, Zotero.QuickCopy.unserializeSetting(format))
    if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')

    const items = await getItemsAsync(citations.map(item => item.id))

    return Zotero.QuickCopy.getContentFromItems(items, format, null, true).text
  }

  public async 'formatted-bibliography'(citations) {
    const format = Zotero.Prefs.get('export.quickCopy.setting')

    log.debug('formatted-citations:', format, Zotero.QuickCopy.unserializeSetting(format))
    if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')

    const items = await getItemsAsync(citations.map(item => item.id))

    return Zotero.QuickCopy.getContentFromItems(items, format, null, false).text
  }

  public async translate(citations, options) {
    const items = await getItemsAsync(citations.map(citation => citation.id))

    const label = (options.translator || 'biblatex').replace(/\s/g, '').toLowerCase().replace('better', '')
    const translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === label) || options.translator

    log.debug('cayw.translate:', {requested: options, got: translator})

    const exportOptions = {
      exportNotes: ['yes', 'y', 'true'].includes((options.exportNotes || '').toLowerCase()),
      useJournalAbbreviation: ['yes', 'y', 'true'].includes((options.useJournalAbbreviation || '').toLowerCase()),
    }

    return await Translators.exportItems(translator, exportOptions, items)
  }
}
