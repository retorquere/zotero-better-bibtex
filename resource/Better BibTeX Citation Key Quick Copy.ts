import { ITranslator } from '../gen/translator'
declare const Translator: ITranslator

declare const Zotero: any

import Exporter = require('./lib/exporter.ts')
import debug = require('./lib/debug.ts')

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

  orgmode(items) {
    for (const item of items) {
      let id
      const m = item.uri.match(/\/(users|groups)\/([0-9]+|(local\/[^\/]+))\/items\/([A-Z0-9]{8})$/)
      if (!m) throw new Error(`Malformed item uri ${item.uri}`)

      const [, type, groupID, , key ] = m

      switch (type) {
        case 'users':
          if (groupID.indexOf('local') !== 0) debug(`Link to synced item ${item.uri}`)
          id = key
          break
        case 'groups':
          id = `${groupID}~${key}`
          break
      }

      Zotero.write(`[[zotero://select/items/${id}][@${item.citekey}]]`)
    }
  },
}

Translator.doExport = () => {
  let item
  const items = []
  while ((item = Exporter.nextItem())) {
    items.push(item)
  }

  const mode = Mode[`${Translator.options.quickCopyMode}`] || Mode[`${Translator.preferences.quickCopyMode}`]
  if (mode) {
    mode.call(null, items)
  } else {
    throw new Error(`Unsupported Quick Copy format '${Translator.options.quickCopyMode || Translator.preferences.quickCopyMode}'`)
  }
}
