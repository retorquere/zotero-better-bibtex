declare const Zotero: any

import Translators = require('../translators.ts')
import debug = require('../debug.ts')
import getItemsAsync = require('../get-items-async.ts')
import Prefs = require('../prefs.ts')

/*
    @config.citeprefix ||= ''
    @config.citepostfix ||= ''
    @config.keyprefix ||= ''
    @config.keypostfix ||= ''
    @config.separator ||= ','
    @config.clipboard ||= false
    @config.format ||= ''
    @config.style ||= 'apa'
    @config.translator
    @config.exportNotes
    @config.useJournalAbbreviation
*/

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

export = new class Formatter {
  public async playground(citations, options) {
    const formatted = citations.map(cit => `${options.keyprefix || ''}${cit.citekey}${options.keypostfix || ''}`)
    return formatted.length ? `${options.citeprefix || ''}${formatted.join(options.separator || ',')}${options.citekeypostfix || ''}` : ''
  }

  public async cite(citations, options) { return this.latex(citations, options) }

  public async latex(citations, options) {
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

      debug('citations:', {citations, state})
      if (state.suffix === 0 && state.prefix === 0 && state.locator === 0 && (state.suppressAuthor === 0 || state.suppressAuthor === citations.length)) {
        return `\\${citations[0].suppressAuthor ? 'citeyear' : options.command}{${citations.map(citation => citation.citekey).join(',')}}`
      }
    }

    let formatted = ''
    for (const citation of citations) {
      formatted += '\\'
      formatted += citation.suppressAuthor ? 'citeyear' : options.command
      if (citation.prefix) formatted += `[${citation.prefix}]`

      debug('citation:', citation)
      if (citation.locator && citation.suffix) {
        const label = citation.label === 'page' ? '' : shortLabel[citation.label] + ' '
        formatted += `[${label}${citation.locator}, ${citation.suffix}]`

      } else if (citation.locator) {
        const label = citation.label === 'page' ? '' : shortLabel[citation.label] + ' '
        formatted += `[${label}${citation.locator}]`

      } else if (citation.suffix) {
        formatted += `[${citation.suffix}]`

      } else if (citation.prefix) {
        formatted += '[]'
      }

      formatted += `{${citation.citekey}}`
    }

    return formatted
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
      if (citation['suppress-author']) cite += '-'
      cite += `@${citation.citekey}`
      if (citation.locator) cite += `, ${shortLabel[citation.label]} ${citation.locator}`
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
        if (citation.label !== 'page') label = `${shortLabel[citation.label]} ${label}`
        cite += `(${label})`
      }
      formatted.push(cite)
    }

    return `${options.cite || 'cite'}:[${formatted.join(', ')}]`
  }

  public async 'scannable-cite'(citations) {
    // I have it on good authority that legal types are weird
    const LEGAL_TYPES = new Set(['bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty'])
    class Mem {
      private lst: string[]
      private isLegal: boolean

      constructor(item) {
        this.lst = []
        this.isLegal = LEGAL_TYPES.has(item.itemType)
      }

      public set(str, punc = '', slug = null) {
        if (str) this.lst.push(str + punc)
        else if (!this.isLegal) this.lst.push(slug)
      }

      public setlaw(str, punc = '') {
        if (str && this.isLegal) this.lst.push(str + punc)
      }

      public get() {
        return this.lst.join(' ')
      }
    }

    const testing = Prefs.get('testing')

    for (const citation of citations) {
      citation.z = await getItemsAsync(citation.id)
    }

    return citations.map(item => {
      const mem = new Mem(item)
      const memdate = new Mem(item)

      const fields = []

      // 1: prefix
      fields.push(item.prefix)

      // 2: text
      const creators = item.z.getCreators() || []
      if (creators.length) {
        mem.set(creators[0].lastName, ',')
        if (creators.length > 2) mem.set('et al.', ',')
        else if (creators.length === 2) mem.set('& ' + creators[1].lastName, ',')
      } else {
        mem.set(false, ',', 'anon.')
      }

      if (item.title) mem.set(item.title, ',', '(no title)')

      mem.setlaw(item.authority, ',')
      mem.setlaw(item.volume)
      mem.setlaw(item.reporter)
      mem.setlaw(item.pages)
      memdate.setlaw(item.court, ',')

      const date = Zotero.Date.strToDate(item.z.getField('date'))
      memdate.set((date.year) ? date.year : item.z.getField('date'), '', 'no date')

      fields.push(`${mem.get()} ${memdate.get()}`.trim())

      // 3: locator
      fields.push(item.locator ? `${shortLabel[item.label]} ${item.locator}` : '')

      // 4: suffix
      fields.push(item.suffix)

      // 5: id
      const prefix = item.z.libraryID === Zotero.Libraries.userLibraryID ? 'zu' : 'zg'
      const lib = item.z.libraryID === Zotero.Libraries.userLibraryID ? 0 : item.z.libraryID
      fields.push(`${prefix}${lib}:${testing ?  'ITEMKEY' : item.z.key}`)

      return `{ ${fields.join(' | ').trim()} }`
    }).join('')
  }

  public async 'formatted-citation'(citations) {
    const format = Zotero.Prefs.get('export.quickCopy.setting')

    debug('formatted-citations:', format, Zotero.QuickCopy.unserializeSetting(format))
    if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')

    const items = await getItemsAsync(citations.map(item => item.id))

    return Zotero.QuickCopy.getContentFromItems(items, format, null, true).text
  }

  public async 'formatted-bibliography'(citations) {
    const format = Zotero.Prefs.get('export.quickCopy.setting')

    debug('formatted-citations:', format, Zotero.QuickCopy.unserializeSetting(format))
    if (Zotero.QuickCopy.unserializeSetting(format).mode !== 'bibliography') throw new Error('formatted-citations requires the Zotero default quick-copy format to be set to a citation style')

    const items = await getItemsAsync(citations.map(item => item.id))

    return Zotero.QuickCopy.getContentFromItems(items, format, null, false).text
  }

  public async translate(citations, options) {
    const items = await getItemsAsync(citations.map(citation => citation.id))

    const label = (options.translator || 'biblatex').replace(/\s/g, '').toLowerCase().replace('better', '')
    const translator = Object.keys(Translators.byId).find(id => Translators.byId[id].label.replace(/\s/g, '').toLowerCase().replace('better', '') === label) || options.translator

    debug('cayw.translate:', {requested: options, got: translator})

    const exportOptions = {
      exportNotes: ['yes', 'y', 'true'].includes((options.exportNotes || '').toLowerCase()),
      useJournalAbbreviation: ['yes', 'y', 'true'].includes((options.useJournalAbbreviation || '').toLowerCase()),
    }

    return await Translators.translate(translator, exportOptions, items)
  }
}
