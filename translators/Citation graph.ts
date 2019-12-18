declare const Translator: ITranslator

declare const Zotero: any

function node(id, label, style = null) {
  Zotero.write('  node [\n')
  Zotero.write(`    id ${id}\n`)
  Zotero.write(`    label ${JSON.stringify(label)}\n`)
  if (style) Zotero.write(`    graphics [ outlineStyle "${style}" ]\n`)
  Zotero.write('  ]\n')
}
function edge(source, target, bidi = false) {
  Zotero.write('  edge [\n')
  Zotero.write(`    source ${source}\n`)
  Zotero.write(`    target ${target}\n`)
  if (bidi) {
    Zotero.write('    graphics [\n')
    Zotero.write('      fill  "#000000"\n')
    Zotero.write('      sourceArrow "standard"\n')
    Zotero.write('      targetArrow "standard"\n')
    Zotero.write('    ]\n')
  }
  Zotero.write('  ]\n')
}

type Item = {
  id: number
  uri: string
  cites: string[]
  relations: string[]
}

Translator.doExport = () => {
  Zotero.write('Creator "Zotero Better BibTeX"\n')
  Zotero.write('Version "2.15"\n')
  Zotero.write('graph [\n')
  Zotero.write('  hierarchic 0\n')
  Zotero.write('  label ""\n')
  Zotero.write('  directed 1\n')

  const items: Record<string, Item> = {}

  let _item
  let id = -1
  const add = {
    title: Zotero.getOption('Title'),
    authors: Zotero.getOption('Authors'),
    year: Zotero.getOption('Year'),
  }

  while ((_item = Zotero.nextItem())) {
    if (['note', 'attachment'].includes(_item.itemType)) continue

    id += 1

    const label = [ _item.citekey ]

    if (add.title && _item.title) {
      label.push(`\u201C${_item.title.replace(/"/g, "'")}\u201D`)
    }

    if (add.authors && _item.creators && _item.creators.length) {
      const name = _item.creators?.map(author => (author.name || author.lastName || '').replace(/"/g, "'")).filter(author => author).join(', ')
      if (name) label.push(name)
    }

    if (add.year && _item.date) {
      let date = Zotero.BetterBibTeX.parseDate(_item.date)
      if (date.from) date = date.from
      if (date.year) label.push(`(${date.year})`)
    }

    node(id, label.join(' '))
    items[_item.citekey] = items[_item.uri] = {
      id,
      uri: _item.uri,
      relations: _item.relations?.['dc:relation'] || [],
      cites: [].concat.apply([],
        (_item.extra || '')
          .split('\n')
          .filter(line => line.startsWith('cites:'))
          .map(line => line.replace(/^cites:/, '').trim())
          .filter(keys => keys)
          .map(keys => keys.split(/\s*,\s*/))
        ),
    }
  }

  const bidi: string[] = []
  for (const item of Object.values(items)) {
    for (const cited of item.cites) {
      if (!items[cited]) {
        id += 1
        items[cited] = {
          id,
          uri: `http://${cited}`,
          cites: [],
          relations: [],
        }

        node(id, cited, 'dashed')
      }

      edge(item.id, items[cited].id)

    }

    for (const other of item.relations) {
      if (!items[other]) {
        id += 1
        items[other] = {
          id,
          uri: other,
          cites: [],
          relations: [],
        }

        node(id, '??', 'dashed')
      }

      const rel = [item.uri, other].sort().join('\t')
      if (!bidi.includes(rel)) bidi.push(rel)
    }
  }

  for (const rel of bidi) {
    const [from, to] = rel.split('\t')
    edge(items[from].id, items[to].id, true)
  }

  Zotero.write(']\n')
}
