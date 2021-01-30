/* eslint-disable prefer-arrow/prefer-arrow-functions */
declare const Zotero: any

import format = require('string-template')

import { Translator } from './lib/translator'
export { Translator }
import { ZoteroTranslator } from '../gen/typings/serialized-item'

import { Exporter } from './bibtex/exporter'

function select_by_key(item) {
  const [ , kind, lib, key ] = item.uri.match(/^https?:\/\/zotero\.org\/(users|groups)\/((?:local\/)?[^/]+)\/items\/(.+)/)
  return (kind === 'users') ? `zotero://select/library/items/${key}` : `zotero://select/groups/${lib}/items/${key}`
}
function select_by_citekey(item) {
  return `zotero://select/items/@${encodeURIComponent(item.citationKey)}`
}

const Mode = {
  // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
  gitbook(items) {
    const citations = items.map(item => `{{ "${item.citationKey}" | cite }}`)
    Zotero.write(citations.join(''))
  },

  atom(items) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const keys = items.map(item => item.citationKey)
    if (keys.length === 1) {
      Zotero.write(`[](#@${keys[0]})`)
    }
    else {
      Zotero.write(`[](?@${keys.join(',')})`)
    }
  },

  latex(items) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const keys = items.map(item => item.citationKey)

    const cmd = `${Translator.preferences.citeCommand}`.trim()
    if (cmd === '') {
      Zotero.write(keys.join(','))
    }
    else {
      Zotero.write(`\\${cmd}{${keys.join(',')}}`)
    }
  },

  citekeys(items) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const keys = items.map(item => item.citationKey)
    Zotero.write(keys.join(','))
  },

  pandoc(items) {
    let keys = items.map(item => `@${item.citationKey}`)
    keys = keys.join('; ')
    if (Translator.preferences.quickCopyPandocBrackets) keys = `[${keys}]`
    Zotero.write(keys)
  },

  roamCiteKey(items) {
    let keys = items.map(item => `[[@${item.citationKey}]]`)
    keys = keys.join(' ')
    Zotero.write(keys)
  },

  orgRef(items) {
    if (!items.length) return  ''
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Zotero.write(`cite:${items.map(item => item.citationKey).join(',')}`)
  },

  orgmode(items) {
    for (const item of items) {
      Zotero.write(`[[${select_by_key(item)}][@${item.citationKey}]]`)
    }
  },
  orgmode_citekey(items) {
    for (const item of items) {
      Zotero.write(`[[${select_by_citekey(item)}][@${item.citationKey}]]`)
    }
  },

  selectLink(items) {
    Zotero.write(items.map(select_by_key).join('\n'))
  },
  selectLink_citekey(items) {
    Zotero.write(items.map(select_by_citekey).join('\n'))
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
        }
        else {
          ref.push(date.year)
        }
      }
      else {
        ref.push('no date')
      }

      return ref.join(', ')
    })
    Zotero.write(`{${reference.join('; ')}}`)
  },

  'string-template'(items) {
    try {
      const { citation, item, sep } = JSON.parse(Translator.preferences.citeCommand)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      Zotero.write(format(citation || '{citation}', { citation: items.map(i => format(item || '{item}', { item: i })).join(sep || '') }))
    }
    catch (err) {
      Zotero.write(`${err}`)
    }
  },
}

export function doExport(): void {
  Translator.init('export')

  let item: ZoteroTranslator.Item
  const items = []
  while ((item = Exporter.nextItem())) {
    if (item.citationKey) items.push(item)
  }

  const mode = Mode[`${Translator.options.quickCopyMode}`] || Mode[`${Translator.preferences.quickCopyMode}`]
  if (mode) {
    mode.call(null, items)
  }
  else {
    throw new Error(`Unsupported Quick Copy format '${Translator.options.quickCopyMode || Translator.preferences.quickCopyMode}', I only know about: ${Object.keys(Mode).join(', ')}`)
  }
}
