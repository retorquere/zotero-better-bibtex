/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-unsafe-return, @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-shadow */

import { Translators } from '../translators'
import { getItemsAsync } from '../get-items-async'
import { Preference } from '../prefs'
import { fromPairs } from '../object'
import { escapeHTML } from '../text'
import { scannableCite } from '../../gen/ScannableCite'
import { citeCreators, yearFromDate } from '../../translators/Better BibTeX Citation Key Quick Copy'
import { Eta } from 'eta'
const eta = new Eta({ autoEscape: true })
import { simplifyForExport } from '../../gen/items/simplify'

import * as unicode_table from 'unicode2latex/tables/minimal.json'

const unicode2latex = (fromPairs(
  Object
    .entries(unicode_table.base)
    .map(([unicode, latex]: [string, { text: string, math: string }]) => [ unicode, { text: latex.text || latex.math, math: !(latex.text) }])
) as Record<string, { text: string, math: boolean }>)

function serialized(item) {
  if (item) {
    const ser = simplifyForExport(Zotero.Utilities.Internal.itemToExportFormat(item, false, true))
    ser.uri = Zotero.URI.getItemURI(item)
    ser.itemID = item.id
    return ser
  }
  return undefined
}

function tolatex(s: string): string {
  if (!s) return ''

  return s.split('')
    .map(c => ({...(unicode2latex[c] || { text: c, math: false }) }) )
    .reduce((acc, c) => {
      const last = acc[acc.length - 1]
      if (last && last.math === c.math) {
        last.text += c.text
      }
      else {
        acc.push(c)
      }
      return acc
    }, [])
    .map(c => c.math ? `$${c.text}$` : c.text)
    .join('')
}

function shortLabel(label: string, options): string {
  if (typeof options[label] === 'string') return options[label]

  return {
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
  }[label] || label
}

function citation2latex(citation, options) {
  let formatted = ''
  // despite Mozilla's claim that trimStart === trimLeft, and that trimStart should be preferred, trimStart does not seem to exist in FF chrome code.
  const label = (`${shortLabel(citation.label, { page: '', ...options })} `).trimLeft()

  if (citation.prefix) formatted += `[${tolatex(citation.prefix)}]`

  if (citation.locator && citation.suffix) {
    formatted += `[${tolatex(label)}${tolatex(citation.locator)}, ${tolatex(citation.suffix)}]`

  }
  else if (citation.locator) {
    formatted += `[${tolatex(label)}${tolatex(citation.locator)}]`

  }
  else if (citation.suffix) {
    formatted += `[${tolatex(citation.suffix)}]`

  }
  else if (citation.prefix) {
    formatted += '[]'
  }

  formatted += `{${citation.citationKey}}`

  return formatted
}

// export singleton: https://k94n.com/es6-modules-single-instance-pattern
export const Formatter = new class { // eslint-disable-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public async citationLinks(citations, _options): Promise<string> {
    return await citations.map(citation => `cites: ${citation.citationKey}`).join('\n')
  }

  public async cite(citations, options) { return this.natbib(citations, options) }
  public async citet(citations, options) { return this.natbib(citations, { command: 'citet', ...options } ) }
  public async citep(citations, options) { return this.natbib(citations, { command: 'citep', ...options } ) }
  public async latex(citations, options) { return this.natbib(citations, options) }

  public async natbib(citations, options) {
    if (!options.command) options.command = 'cite'

    if (citations.length === 0) return ''

    // test for simple case where multiple entries can be put in a single cite
    if (citations.length > 1) {
      const state = citations.reduce((acc, cit) => {
        for (const field of ['prefix', 'suffix', 'suppressAuthor', 'locator', 'label']) {
          // eslint-disable-next-line @typescript-eslint/restrict-plus-operands
          acc[field] = (acc[field] || 0) + (cit[field] ? 1 : 0)
        }
        return acc
      }, {})

      if (state.suffix === 0 && state.prefix === 0 && state.locator === 0 && (state.suppressAuthor === 0 || state.suppressAuthor === citations.length)) {
        return `\\${citations[0].suppressAuthor ? 'citeyear' : options.command}{${citations.map(citation => citation.citationKey).join(',')}}`
      }
    }

    let formatted = ''
    for (const citation of citations) {
      formatted += `\\${citation.suppressAuthor ? 'citeyear' : options.command}${citation2latex(citation, options)}`
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
      return `\\${command}${suppressAuthor}${citation2latex(citation, options)}`
    }

    citations = citations.map(citation2latex).join('')
    if (citations.includes('[')) {
      // there are some pre/post notes → generate a full \XYcites command
      command = command.endsWith('s') ? command : `${command}s`
    }
    else {
      // there are no pre/post-notes, the citations can be a simple
      // comma-separated list of keys
      citations = citations.replace(/\}\{/g, ',')
    }
    return `\\${command}${citations}`
  }

  public async mmd(citations, _options) {
    const formatted = []

    for (const citation of citations) {
      if (citation.prefix) {
        formatted.push(`[${citation.prefix}][#${citation.citationKey}]`)
      }
      else {
        formatted.push(`[#${citation.citationKey}][]`)
      }
    }
    return formatted.join('')
  }

  public async jekyll(citations, _options) {
    return citations.map(cit => `{% cite ${cit.citationKey} %}`).join('')
  }

  public async pandoc(citations, options) {
    const formatted = []
    for (const citation of citations) {
      let cite = ''
      if (citation.prefix) cite += `${citation.prefix} `
      if (citation.suppressAuthor) cite += '-'
      cite += `@${citation.citationKey}`
      if (citation.locator) cite += `, ${shortLabel(citation.label, options)} ${citation.locator}`.replace(/\s+/, ' ')
      if (citation.suffix) cite += ` ${citation.suffix}`
      formatted.push(cite)
    }

    return `${options.brackets ? '[' : ''}${formatted.join('; ')}${options.brackets ? ']' : ''}`
  }

  public async 'asciidoctor-bibtex'(citations, options) {
    const formatted = []
    for (const citation of citations) {
      let cite = citation.citationKey
      if (citation.locator) {
        const label = `${shortLabel(citation.label, { page: '', ...options })} ${citation.locator}`.trim()
        cite += `(${label})`
      }
      formatted.push(cite)
    }

    return `${options.cite || 'cite'}:[${formatted.join(', ')}]`
  }

  public async 'scannable-cite'(citations, options) {
    let markers = ''
    for (const citation of citations) {
      const scannable = scannableCite(await getItemsAsync(citation.id))

      const enriched = [
        citation.prefix || '',
        `${citation.suppressAuthor ? '-' : ''}${scannable.label}`,
        citation.locator ? `${shortLabel(citation.label, options)} ${citation.locator}`.trim() : '',
        citation.suffix || '',
        Preference.testing ? 'zu:0:ITEMKEY' : scannable.id,
      ].join(' | ').replace(/ +/g, ' ')

      markers += `{ ${enriched.trim()} }`
    }
    return markers
  }

  public async 'formatted-citation'(citations, options) {
    const format = {
      mode: 'bibliography',
      contentType: options.contentType,
      id: options.style,
      locale: options.locale,
    }

    // items must be pre-loaded for the citation processor
    await getItemsAsync(citations.map(item => item.id))

    const csl = Zotero.Styles.get(format.id).getCiteProc(format.locale)
    csl.updateItems(citations.map(item => item.id))

    const citation = {
      citationItems: citations.map(item => ({ ...item, 'suppress-author': item.suppressAuthor })),
      properties: {},
    }

    const output = csl.previewCitationCluster(citation, [], [], format.contentType)
    return output
  }

  public async 'formatted-bibliography'(citations, options) {
    const format = {
      mode: 'bibliography',
      contentType: options.contentType,
      id: options.style,
      locale: options.locale,
    }

    const items = await getItemsAsync(citations.map(item => item.id))

    return Zotero.QuickCopy.getContentFromItems(items, format, null, false)[format.contentType]
  }

  public async jupyter(citations, _options) {
    const items = await getItemsAsync(citations.map(cit => cit.id))
    let picked = ''
    for (const cit of citations) {
      const i = items.find(item => item.id === cit.id)
      const item = i ? { creators: i.getCreatorsJSON(), date: i.getField('date') } : {}
      picked += `<cite data-cite="${escapeHTML(cit.citationKey)}">(${escapeHTML(citeCreators(item.creators))}, ${escapeHTML(yearFromDate(item.date))})</cite>`
    }
    return picked
  }

  public async eta(citations, options) {
    if (!options.template) throw new Error('No template provided')
    const items = await getItemsAsync(citations.map(cit => cit.id))
    for (const cit of citations) {
      cit.item = serialized(items.find(item => item.id === cit.id))
    }
    return eta.renderString(options.template, { items: citations })
  }

  public async translate(citations, options) {
    const items = await getItemsAsync(citations.map(citation => citation.id))

    const label = (options.translator || 'biblatex').replace(/\s/g, '').toLowerCase().replace('better', '')
    const translatorID = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === label) || options.translator

    const displayOptions = {
      exportNotes: ['yes', 'y', 'true'].includes((options.exportNotes || '').toLowerCase()),
      useJournalAbbreviation: ['yes', 'y', 'true'].includes((options.useJournalAbbreviation || '').toLowerCase()),
    }

    return await Translators.exportItems({translatorID, displayOptions, scope: { type: 'items', items }})
  }

  public async json(citations, _options) {
    const items = await getItemsAsync(citations.map(cit => cit.id))
    for (const cit of citations) {
      cit.item = serialized(items.find(item => item.id === cit.id))
    }
    return JSON.stringify(citations)
  }
}
