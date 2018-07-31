declare const Translator: ITranslator

declare const Zotero: any

import format = require('string-template')

import { Exporter } from './lib/exporter'

function select_link(item, mode) {
  switch (mode) {
    case 'id': return item.libraryID > 1 ? `zotero://select/items/${item.libraryID}_${item.key}` : `zotero://select/items/${item.key}`
    case 'citekey': return `zotero://select/items/@${encodeURIComponent(item.citekey)}`
    default: throw new Error(`Unsupported link mode ${mode}`)
  }
}

const Mode = { // tslint:disable-line:variable-name
  gitbook(items) {
    const citations = items.map(item => `{{ \"${item.citekey}\" | cite }}`)
    Zotero.write(citations.join(''))
  },

  atom(items) {
    const keys = items.map(item => item.citekey)
    if (keys.length === 1) {
      Zotero.write(`[](#@${keys[0]})`)
    } else {
      Zotero.write(`[](?@${keys.join(',')})`)
    }
  },

  latex(items) {
    const keys = items.map(item => item.citekey)

    const cmd = `${Translator.preferences.citeCommand}`.trim()
    if (cmd === '') {
      Zotero.write(keys.join(','))
    } else {
      Zotero.write(`\\${cmd}{${keys.join(',')}}`)
    }
  },

  citekeys(items) {
    const keys = items.map(item => item.citekey)
    Zotero.write(keys.join(','))
  },

  pandoc(items) {
    let keys = items.map(item => `@${item.citekey}`)
    keys = keys.join('; ')
    if (Translator.preferences.quickCopyPandocBrackets) keys = `[${keys}]`
    Zotero.write(keys)
  },

  orgRef(items) {
    if (!items.length) return  ''
    Zotero.write(`cite:${items.map(item => item.citekey).join(',')}`)
  },

  orgmode(items) {
    for (const item of items) {
      Zotero.write(`[[${select_link(item, 'id')}][@${item.citekey}]]`)
    }
  },
  orgmode_citekey(items) {
    for (const item of items) {
      Zotero.write(`[[${select_link(item, 'citekey')}][@${item.citekey}]]`)
    }
  },

  selectLink(items) {
    Zotero.write(items.map(item => select_link(item, 'id')).join('\n'))
  },
  selectLink_citekey(items) {
    Zotero.write(items.map(item => select_link(item, 'citekey')).join('\n'))
  },

  rtfScan(items) {
    const reference = items.map(item => {
      const ref = []

      // author
      const creators = item.creators || []
      const creator = creators[0] || {}
      let name = creator.name || creator.lastName || 'no author'
      if (creators.length > 1) name += ' et al.'
      ref.push(name)

      // title
      if (item.title) ref.push(JSON.stringify(item.title))

      // year
      if (item.date) {
        let date = Zotero.BetterBibTeX.parseDate(item.date)
        if (date.type === 'interval') date = date.from

        if (date.type === 'verbatim' || !date.year) {
          ref.push(item.date)
        } else {
          ref.push(date.year)
        }
      } else {
        ref.push('no date')
      }

      return ref.join(', ')
    })
    Zotero.write(`{${reference.join('; ')}}`)
  },

  'string-template'(items) {
    try {
      const { citation, item, sep } = JSON.parse(Translator.preferences.citeCommand)
      Zotero.write(format(citation || '{citation}', { citation: items.map(i => format(item || '{item}', { item: i })).join(sep || '') }))
    } catch (err) {
      Zotero.write(`${err}`)
    }
  },
}

Translator.doExport = () => {
  let item: ISerializedItem
  const items = []
  while ((item = Exporter.nextItem())) {
    items.push(item)
  }

  const mode = Mode[`${Translator.options.quickCopyMode}`] || Mode[`${Translator.preferences.quickCopyMode}`]
  if (mode) {
    mode.call(null, items)
  } else {
    throw new Error(`Unsupported Quick Copy format '${Translator.options.quickCopyMode || Translator.preferences.quickCopyMode}', I only know about: ${Object.keys(Mode).join(', ')}`)
  }
}
