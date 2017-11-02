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

const shortLocator = {
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
  public async cite(citations, options) { return this.latex(citations, options) }

  public async latex(citations, options = {}) {
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

      for (const citation of this.citations) {
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
    for (citation of citations) {
      formatted += '\\'
      formatted += citation.suppressAuthor ? 'citeyear' : options.command
      if (citation.prefix) formatted += `[${citation.prefix}]`

      debug('citation:', citation)
      if (citation.locator && citation.suffix) {
        const label = citation.label === 'page' ? '' : shortLocator[citation.label] + ' '
        formatted += `[${label}${citation.locator}, ${citation.suffix}]`

      } else if (citation.locator) {
        const label = citation.label === 'page' ? '' : shortLocator[citation.label] + ' '
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

  public async mmd(citations, options = {}) {
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

  public async pandoc(citations, options = {}) {
    let formatted = []
    for (const citation of citations) {
      let cite = ''
      if (citation.prefix) cite += `${citation.prefix} `
      if (citation['suppress-author']) cite += '-'
      cite += `@${citation.citekey}`
      if (citation.locator) cite += `, ${shortLocator[citation.label]} ${citation.locator}`
      if (citation.suffix) cite += ` ${citation.suffix}`
      formatted.push(cite)
    }
    formatted = formatted.join('; ')

    if (this.brackets) formatted = `[${formatted}]`

    return formatted
  }

  public async 'asciidoctor-bibtex'(citations, options = {}) {
    let cite
    let formatted = []
    for (const citation of citations) {
      cite = citation.citekey
      if (citation.locator) {
        let label = citation.locator
        if (citation.label !== 'page') label = `${shortLocator[citation.label]} ${label}`
        cite += `(${label})`
      }
      formatted.push(cite)
    }
    formatted = formatted.join(', ')
    formatted = `${this.cite || 'cite'}:[${formatted}]`
    return formatted
  }

  public async 'scannable-cite'(citations) {

    class Mem {
      constructor(isLegal1) {
        this.isLegal = isLegal1
        this.lst = []
      }

      public set(str, punc, slug) {
        if (!punc) punc = ''
        switch (false) {
          case !str:        return this.lst.push(str + punc)
          case !!this.isLegal:  return this.lst.push(slug)
        }
      }

      public setlaw(str, punc) {
        if (!punc) punc = ''
        if (str && this.isLegal) return this.lst.push(str + punc)
      }

      public get() { return this.lst.join(' ') }
    }

    const formatted = []
    for (const citation of citations) {
      const item = Zotero.Items.get(citation.id)
      const isLegal = [ 'bill', 'case', 'gazette', 'hearing', 'patent', 'regulation', 'statute', 'treaty' ].includes(Zotero.ItemTypes.getName(item.itemTypeID))

      const key = Zotero.BetterBibTeX.Pref.get('tests') ? 'ITEMKEY' : item.key

      let id
      if (item.libraryID) {
        id = `zg:${item.libraryID}:${key}`
      } else if (Zotero.userID) {
        id = `zu:${Zotero.userID}:${key}`
      } else {
        id = `zu:0:${key}`
      }
      if (!citation.prefix) citation.prefix = ''
      if (!citation.suffix) citation.suffix = ''

      const title = new Mem(isLegal)
      title.set(item.firstCreator, ',', 'anon.')

      let includeTitle = false
      /* Prefs.get throws an error if the pref is not found */
      try {
        includeTitle = Zotero.Prefs.get('translators.ODFScan.includeTitle')
      } catch (error) {}
      if (includeTitle || !item.firstCreator) {
        title.set(item.getField('shortTitle') || item.getField('title'), ',', '(no title)')
      }

      try {
        title.setlaw(item.getField('authority'), ',')
      } catch (err) {}
      try {
        title.setlaw(item.getField('volume'))
      } catch (err) {}
      try {
        title.setlaw(item.getField('reporter'))
      } catch (err) {}
      title.setlaw(item.getField('pages'))

      const year = new Mem(isLegal)
      try {
        year.setlaw(item.getField('court'), ',')
      } catch (err) {}
      const date = Zotero.Date.strToDate(item.getField('date'))
      year.set(date.year ? date.year : item.getField('date'), '', 'no date')

      let label = `${title.get()} ${year.get()}`.trim()
      if (citation.suppressAuthor) label = `-${label}`

      formatted.push(`{${citation.prefix}|${label}|${locator}|${citation.suffix}|${id}}`)
    }

    return formatted.join('')
  }

  /*
  'atom-zotero-citations': (citations, options = {}) ->
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

  public async translate(citations, options = {}) {
    const items = await getItemsAsync(citations.map(citation(() => citation.id)))

    let translator = options.translator || 'biblatex'
    translator = Zotero.BetterBibTeX.Translators.getID(translator) || translator
    Zotero.BetterBibTeX.debug('cayw.translate:', {requested: options, got: translator})

    const exportOptions = {
      exportNotes: ['yes', 'y', 'true'].includes((options.exportNotes || '').toLowerCase())
      useJournalAbbreviation: ['yes', 'y', 'true'].includes((options.useJournalAbbreviation || '').toLowerCase()),
    }

    return Zotero.BetterBibTeX.Translators.translate(translator, {items}, exportOptions)
  }
}
