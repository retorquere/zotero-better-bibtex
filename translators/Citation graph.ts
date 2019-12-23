declare const Translator: ITranslator
declare const Zotero: any

function node(id, attributes = {}) {
  let _node = JSON.stringify(id)
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
  if (attrs) _node += ` [${attrs}]`
  Zotero.write(`  ${_node};\n`)
}

function edge(source, target, attributes = {}) {
  let _edge = `${JSON.stringify(source)} -> ${JSON.stringify(target)}`
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
  if (attrs) _edge += ` [${attrs}]`
  Zotero.write(`  ${_edge};\n`)
}

type Item = {
  id: string
  cites: string[]
  relations: string[]
  label: string
  citekey: string
  uri: string
}

Translator.doExport = () => {
  Zotero.write('digraph CitationGraph {\n')
  Zotero.write('  concentrate=true;\n')

  const add = {
    title: Zotero.getOption('Title'),
    authors: Zotero.getOption('Authors'),
    year: Zotero.getOption('Year'),
  }

  const items: Item[] = []
  let item
  while ((item = Zotero.nextItem())) {
    if (['note', 'attachment'].includes(item.itemType)) continue

    item.id = 'node-' + item.uri.replace(/.*\//, '')

    const label = [ item.citekey ]

    if (add.title && item.title) {
      label.push(`\u201C${item.title.replace(/"/g, "'")}\u201D`)
    }

    if (add.authors && item.creators && item.creators.length) {
      const name = item.creators?.map(author => (author.name || author.lastName || '').replace(/"/g, "'")).filter(author => author).join(', ')
      if (name) label.push(name)
    }

    if (add.year && item.date) {
      let date = Zotero.BetterBibTeX.parseDate(item.date)
      if (date.from) date = date.from
      if (date.year) label.push(`(${date.year})`)
    }

    item.label = label.join('\n')

    item.relations = item.relations?.['dc:relation'] || []

    item.cites = [].concat.apply([],
      (item.extra || '')
        .split('\n')
        .filter(line => line.startsWith('cites:'))
        .map(line => line.replace(/^cites:/, '').trim())
        .filter(keys => keys)
        .map(keys => keys.split(/\s*,\s*/))
      )

    items.push(item)
  }

  for (item of items) {
    node(item.id, { label: item.label })

    for (const uri of item.relations) {
      const other = items.find(o => o.uri === uri)
      if (other) {
        edge(item.id, other.id)
      } else {
        edge(item.id, uri.replace(/.*\//, ''), { style: 'dashed', dir: 'both' })
      }
    }

    for (const citekey of item.cites) {
      const other = items.find(o => o.citekey === citekey)

      if (other) {
        edge(item.id, other.id)
      } else {
        edge(item.id, citekey, { style: 'dashed' })
      }
    }
  }

  Zotero.write('}')
}
