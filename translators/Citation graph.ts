declare const Zotero: any

import { Translation, TranslatorMetadata } from './lib/translator'
declare var ZOTERO_TRANSLATOR_INFO: TranslatorMetadata // eslint-disable-line no-var

function node(id, attributes = {}) {
  let n = JSON.stringify(id)
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
  if (attrs) n += ` [${attrs}]`
  return `  ${n};\n`
}

function edge(source, target, attributes = {}) {
  let e = `${JSON.stringify(source)} -> ${JSON.stringify(target)}`
  const attrs = Object.entries(attributes).map(([key, value]) => `${key}=${JSON.stringify(value)}`).join(', ')
  if (attrs) e += ` [${attrs}]`
  return `  ${e};\n`
}

type Item = {
  id: string
  cites: string[]
  relations: string[]
  label: string
  citationKey: string
  uri: string
}

export function doExport(): void {
  const translation = new Translation(ZOTERO_TRANSLATOR_INFO, 'export')

  this.translation.output += 'digraph CitationGraph {\n'
  this.translation.output += '  concentrate=true;\n'

  const add = {
    title: Zotero.getOption('Title'),
    authors: Zotero.getOption('Authors'),
    year: Zotero.getOption('Year'),
  }

  const items: Item[] = []
  for (const ref of translation.data.items.regular) {
    const label = [ ref.citationKey ]

    if (add.title && ref.title) {
      label.push(`\u201C${ref.title.replace(/"/g, "'")}\u201D`)
    }

    const author = []
    if (add.authors && ref.creators && ref.creators.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const name = ref.creators?.map(creator => (creator.name || creator.lastName || '').replace(/"/g, "'")).filter(creator => creator).join(', ')
      if (name) author.push(name)
    }
    if (add.year && ref.date) {
      let date = Zotero.BetterBibTeX.parseDate(ref.date)
      if (date.from) date = date.from
      if (date.year) author.push(`(${date.year})`)
    }
    if (author.length) label.push(author.join(' '))

    items.push({
      id: `node-${ref.uri.replace(/.*\//, '')}`,
      label: label.join('\n'),
      relations: (ref.relations?.['dc:relation'] || []),
      // eslint-disable-next-line prefer-spread
      cites: [].concat.apply([],
        (ref.extra || '')
          .split('\n')
          .filter((line: string) => line.startsWith('cites:'))
          .map((line: string) => line.replace(/^cites:/, '').trim())
          .filter((keys: string) => keys)
          .map((keys: string) => keys.split(/\s*,\s*/))
      ),
      citationKey: ref.citationKey,
      uri: ref.uri,
    })
  }

  for (const item of items) {
    this.translation.output += node(item.id, { label: item.label })

    for (const uri of item.relations) {
      const other = items.find(o => o.uri === uri)
      if (other) {
        this.translation.output += edge(item.id, other.id)
      }
      else {
        this.translation.output += edge(item.id, uri.replace(/.*\//, ''), { style: 'dashed', dir: 'both' })
      }
    }

    for (const citationKey of item.cites) {
      const other = items.find(o => o.citationKey === citationKey)

      if (other) {
        this.translation.output += edge(item.id, other.id)
      }
      else {
        this.translation.output += edge(item.id, citationKey, { style: 'dashed' })
      }
    }
  }

  this.translation.output += '}'

  Zotero.write(this.translation.output)
}
