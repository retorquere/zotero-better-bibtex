declare const Translator: ITranslator

declare const Zotero: any

import { debug } from './lib/debug.ts'

function node(id, label, style = null) {
  Zotero.write('  node [\n')
  Zotero.write(`    id ${id}\n`)
  Zotero.write(`    label ${JSON.stringify(label)}\n`)
  if (style) Zotero.write(`    graphics [ outlineStyle "${style}" ]\n`)
  Zotero.write('  ]\n')
}
function edge(source, target) {
  Zotero.write('  edge [\n')
  Zotero.write(`    source ${source}\n`)
  Zotero.write(`    target ${target}\n`)
  Zotero.write('  ]\n')
}

Translator.doExport = () => {
  Zotero.write('Creator "Zotero Better BibTeX"\n')
  Zotero.write('Version "2.15"\n')
  Zotero.write('graph [\n')
  Zotero.write('  hierarchic 1\n')
  Zotero.write('  label ""\n')
  Zotero.write('  directed 1\n')

  const items: { [key: string]: { id: number, cites: string[] } } = {}

  let _item
  let id = -1
  while ((_item = Zotero.nextItem())) {
    if (['note', 'attachment'].includes(_item.itemType)) continue

    id += 1

    /*
    const label = []

    if (_item.creators && _item.creators.length) {
      const name = _item.creators[0].name || _item.creators[0].lastName
      if (name) label.push(name)
    }

    if (_item.date) {
      let date = Zotero.BetterBibTeX.parseDate(_item.date)
      if (date.from) date = date.from
      if (date.year) label.push(`(${date.year})`)
    }

    if (label.length || _item.title) {
      Zotero.write(`  ${_item.citekey} [`)
      if (label.length) Zotero.write(`label=${JSON.stringify(label.join(' '))}`)
      if (_item.title) Zotero.write(`xlabel=${JSON.stringify(_item.title)}`)
      Zotero.write('];\n')
    }
    */

    node(id, _item.citekey)
    items[_item.citekey] = {
      id,
      cites: (_item.extra || '').split('\n').filter(line => line.startsWith('cites:')).map(line => line.replace(/^cites:/, '').trim()).filter(key => key),
    }
  }

  debug(items)

  for (const item of Object.values(items)) {
    for (const cited of item.cites) {
      if (!items[cited]) {
        id += 1
        items[cited] = {
          id,
          cites: [],
        }

        node(id, cited, 'dashed')
      }

      edge(item.id, items[cited].id)
    }
  }

  Zotero.write(']\n')
}
