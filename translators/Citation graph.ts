declare const Zotero: any

import { Collected } from './lib/collect'
import { Translation } from './lib/translator'
import type { Translators } from '../typings/translators.d.ts'
declare var ZOTERO_TRANSLATOR_INFO: Translators.Header // eslint-disable-line no-var

function node(id, attributes = {}) {
  let n = JSON.stringify(id)
  const attrs = Object.entries(attributes).map(([ key, value ]) => `${ key }=${ JSON.stringify(value) }`).join(', ')
  if (attrs) n += ` [${ attrs }]`
  return `  ${ n };\n`
}

function edge(source, target, attributes = {}) {
  let e = `${ JSON.stringify(source) } -> ${ JSON.stringify(target) }`
  const attrs = Object.entries(attributes).map(([ key, value ]) => `${ key }=${ JSON.stringify(value) }`).join(', ')
  if (attrs) e += ` [${ attrs }]`
  return `  ${ e };\n`
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
  const translation = Translation.Export(new Collected(ZOTERO_TRANSLATOR_INFO, 'export'))

  translation.output.body += 'digraph CitationGraph {\n'
  translation.output.body += '  concentrate=true;\n'

  const add = {
    title: Zotero.getOption('Title'),
    authors: Zotero.getOption('Authors'),
    year: Zotero.getOption('Year'),
  }

  const items: Item[] = []
  for (const ref of translation.collected.items.regular) {
    const label = [ref.citationKey]

    if (add.title && ref.title) {
      label.push(`\u201C${ ref.title.replace(/"/g, '\'') }\u201D`)
    }

    const author = []
    if (add.authors && ref.creators && ref.creators.length) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      const name = ref.creators?.map(creator => (creator.name || creator.lastName || '').replace(/"/g, '\'')).filter(creator => creator).join(', ')
      if (name) author.push(name)
    }
    if (add.year && ref.date) {
      let date = Zotero.BetterBibTeX.parseDate(ref.date)
      if (date.from) date = date.from
      if (date.year) author.push(`(${ date.year })`)
    }
    if (author.length) label.push(author.join(' '))

    items.push({
      id: `node-${ items.length }`,
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
    translation.output.body += node(item.id, { label: item.label })

    for (const uri of item.relations) {
      const other = items.find(o => o.uri === uri)
      if (other) {
        translation.output.body += edge(item.id, other.id)
      }
      else {
        translation.output.body += edge(item.id, uri.replace(/.*\//, ''), { style: 'dashed', dir: 'both' })
      }
    }

    for (const citationKey of item.cites) {
      const other = items.find(o => o.citationKey === citationKey)

      if (other) {
        translation.output.body += edge(item.id, other.id)
      }
      else {
        translation.output.body += edge(item.id, citationKey, { style: 'dashed' })
      }
    }
  }

  translation.output.body += '}'

  Zotero.write(translation.output.body)
}
