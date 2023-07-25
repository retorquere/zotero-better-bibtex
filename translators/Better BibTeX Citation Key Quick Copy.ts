/* eslint-disable prefer-arrow/prefer-arrow-functions */
declare const Zotero: any

import { simplifyForExport } from '../gen/items/simplify'

import { Eta } from 'eta'
const eta = new Eta({ autoEscape: false })

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

  latex(items) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const keys = items.map(item => item.citationKey)

    const cmd = `${Zotero.getHiddenPref('better-bibtex.citeCommand')}`.trim()
    if (cmd === '') {
      Zotero.write(keys.join(','))
    }
    else {
      Zotero.write(`\\${cmd}{${keys.join(', ')}}`)
    }
  },

  citekeys(items) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const keys = items.map(item => item.citationKey)
    Zotero.write(keys.join(', '))
  },

  pandoc(items) {
    let keys = items.map(item => `@${item.citationKey}`)
    keys = keys.join('; ')
    if (Zotero.getHiddenPref('better-bibtex.quickCopyPandocBrackets')) keys = `[${keys}]`
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
    Zotero.write(`cite:${items.map(item => item.citationKey).join(', ')}`)
  },

  orgRef3(items) {
    if (!items.length) return  ''
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    Zotero.write(`cite:&${items.map(item => item.citationKey).join(';&')}`)
  },

  orgmode(items) {
    switch (Zotero.getHiddenPref('better-bibtex.quickCopyOrgMode')) {
      case 'zotero':
        for (const item of items) {
          Zotero.write(`[[${select_by_key(item)}][@${item.citationKey}]]`)
        }
        break
      case 'citationkey':
        for (const item of items) {
          Zotero.write(`[[${select_by_citekey(item)}][@${item.citationKey}]]`)
        }
        break
    }
  },

  selectlink(items) {
    switch (Zotero.getHiddenPref('better-bibtex.quickCopySelectLink')) {
      case 'zotero':
        Zotero.write(items.map(select_by_key).join('\n'))
        break
      case 'citationkey':
        Zotero.write(items.map(select_by_citekey).join('\n'))
        break
    }
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

  eta(items) {
    try {
      Zotero.write(eta.renderString(Zotero.getHiddenPref('better-bibtex.quickCopyEta'), { items: items.map(simplifyForExport) }))
    }
    catch (err) {
      Zotero.write(`${err}`)
    }
  },
}

export function doExport(): void {
  const items = []
  let item: any
  while (item = Zotero.nextItem()) {
    if (item.citationKey) items.push(item)
  }
  items.sort((a: any, b: any) => {
    const ka = [ a.citationKey || a.itemType, a.dateModified || a.dateAdded, a.itemID ].join('\t')
    const kb = [ b.citationKey || b.itemType, b.dateModified || b.dateAdded, b.itemID ].join('\t')
    return ka.localeCompare(kb, undefined, { sensitivity: 'base' })
  })

  const mode = Mode[Zotero.getOption('quickCopyMode')] || Mode[Zotero.getHiddenPref('better-bibtex.quickCopyMode')]
  if (mode) {
    mode.call(null, items)
  }
  else {
    throw new Error(`Unsupported Quick Copy format '${Zotero.getOption('quickCopyMode') || Zotero.getHiddenPref('better-bibtex.quickCopyMode')}', I only know about: ${Object.keys(Mode).join(', ')}`)
  }
}
