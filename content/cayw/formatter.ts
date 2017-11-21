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
        const label = citation.label === 'page' ? '' : (shortLabel[citation.label] || citation.label) + ' '
        formatted += `[${label}${citation.locator}, ${citation.suffix}]`

      } else if (citation.locator) {
        const label = citation.label === 'page' ? '' : (shortLabel[citation.label] || citation.label) + ' '
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
    debug('scannable-cite:', citations)
    const testing = Prefs.get('testing')
    const items = await getItemsAsync(citations.map(picked => picked.id))
    const scannable_cites = (await Translators.translate('248bebf1-46ab-4067-9f93-ec3d2960d0cd', null, { items } )).split(/[{}]+/).filter(cite => cite)

    if (citations.length !== scannable_cites.length) throw new Error(`Scannable Cite parse error: picked ${citations.length}, found ${scannable_cites.length}`)

    let citation = ''
    for (let i = 0; i < citations.length; i++) {
      const scannable = scannable_cites[i]
      const picked = citations[i]

      const [ , text, , , id ] = scannable.split('|').map(v => v.trim())

      const [ , kind, lib, key ] = picked.uri.match(/^http:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^\/]+)\/items\/(.+)/)
      const pickedID = `${kind === 'users' ? 'zu' : 'zg'}:${lib.startsWith('local/') ? '0' : lib}:${key}`
      if (id !== pickedID) throw new Error(`Expected ${pickedID}, found ${id}`)

      const enriched = [
        picked.prefix || '',
        `${picked.suppressAuthor ? '-' : ''}${text}`,
        picked.locator ? `${shortLabel[picked.label] || picked.label} ${picked.locator}` : '',
        picked.suffix || '',
        testing ? 'zu:0:ITEMKEY' : id,
      ].join(' | ')

      citation += `{ ${enriched.trim()} }`
    }
    return citation
  }

  /*
  'atom-zotero-citations': (citations, options) ->
    citekeys = citations.map(citation -> citation.citekey)
    options.style = options.style || 'apa'

    itemIDs = citekeys.map(citekey -> KeyManager.keys.findOne({ citekey })).map(citekey -> if citekey then citekey.itemID else null)
    style = getStyle(options.style)

    let style = Zotero.Styles.get(`http://www.zotero.org/styles/${options.style}`) || Zotero.Styles.get(`http://juris-m.github.io/styles/${id}`) || Zotero.Styles.get(id)

    cp = style.getCiteProc()
    cp.setOutputFormat('markdown')
    cp.updateItems(itemIDs)
    label = cp.appendCitationCluster({ citationItems: itemIDs.map(id -> { return { id } }), properties:{} }, true)[0][1]

    if citekeys.length == 1
      return "[#{label}](#@#{citekeys.join(',')})"
    else
      return "[#{label}](?@#{citekeys.join(',')})"
  */

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
