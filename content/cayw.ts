import { Formatter } from './cayw/formatter'
import { Picker, type PickResult } from './cayw/pick'
import { TeXstudio } from './tex-studio'
import { flash } from './flash'
import { log, stringify } from './logger'
import { orchestrator } from './orchestrator'
import { Server } from './server'
import { toClipboard } from './text'

type Citation = {
  id: number
  locator: string
  suppressAuthor: boolean
  prefix: string
  suffix: string
  label: string
  citationKey: string

  uri?: string
  itemType?: string
  title?: string
}

function citationItems(picks: PickResult[]): Citation[] {
  const items: Citation[] = []

  for (const pick of picks) {
    for (const item of pick.citationItems || []) {
      items.push({
        id: Number(item.id),
        locator: typeof item.locator === 'string' ? item.locator : '',
        suppressAuthor: !!item['suppress-author'],
        prefix: typeof item.prefix === 'string' ? item.prefix : '',
        suffix: typeof item.suffix === 'string' ? item.suffix : '',
        label: typeof item.label === 'string' ? item.label : (item.locator ? 'page' : ''),
        citationKey: Zotero.BetterBibTeX.KeyManager.get(Number(item.id))?.citationKey || '',

        uri: Array.isArray(item.uris) ? item.uris[0] : undefined,
        itemType: typeof item.itemData?.type === 'string' ? item.itemData.type : undefined,
        title: typeof item.itemData?.title === 'string' ? item.itemData.title : undefined,
      })
    }
  }

  return items
}

function getFormatter(options) {
  const formatter = options.format || 'latex'
  if (!Formatter[formatter]) throw new Error(`No such formatter ${ JSON.stringify(formatter) }`)
  return Formatter[formatter]
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export async function pick(options: any): Promise<string> {
  await Zotero.BetterBibTeX.ready

  const formatter = getFormatter(options)

  try {
    const picker = new Picker({
      documentId: options.documentId || `better-bibtex-cayw-${ Zotero.Utilities.generateObjectKey() }`,
      processorName: 'Better BibTeX',
    })
    const picked = citationItems(await picker.pick())
    const citation: string = picked.length ? await formatter(picked, options) : ''

    if (options.select && picked.length) {
      const zoteroPane = Zotero.getActiveZoteroPane()

      // don't know why zotero-types is not picked up here
      await zoteroPane.selectItems(picked.map(item => item.id), true)
    }

    return citation
  }
  catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    log.error('CAYW error:', error, `${ error }`, error.stack, options)
    flash('CAYW pick failed', stringify(error))
    return ''
  }
}

async function selected(options): Promise<string> {
  const formatter = getFormatter(options)
  const pane = Zotero.getActiveZoteroPane()
  const items = pane.getSelectedItems()
  const picked: Citation[] = items.map(item => ({
    id: item.id,
    locator: '',
    suppressAuthor: false,
    prefix: '',
    suffix: '',
    label: '',
    citationKey: Zotero.BetterBibTeX.KeyManager.get(item.id)?.citationKey || '',

    uri: undefined,
    itemType: undefined,
    title: item.getField('title'),
  }))
  return picked.length ? await formatter(picked, options) : ''
}

function getStyle(id): { url: string } | null {
  try {
    return Zotero.Styles.get(id) as { url: string }
  }
  catch {
    return null
  }
}

class Handler {
  public supportedMethods = ['GET']
  public OK = 200
  public SERVER_ERROR = 500

  public async init(request) {
    const options = Server.queryParams(request)

    if (options.probe) return [ this.OK, 'text/plain', Zotero.BetterBibTeX.starting ? 'starting' : 'ready' ]

    try {
      if (!options.style || !options.contentType || !options.locale) {
        const format = Zotero.QuickCopy.unserializeSetting(Zotero.Prefs.get('export.quickCopy.setting'))
        if (!options.style && format.mode === 'bibliography') options.style = format.id
        options.contentType = options.contentType || format.contentType || 'text'
        options.locale = options.locale || format.locale || Zotero.Prefs.get('export.quickCopy.locale') || 'en-US'
      }
      const style
        = getStyle(options.style)
          || getStyle(`http://www.zotero.org/styles/${ options.style }`)
          || getStyle(`http://juris-m.github.io/styles/${ options.style }`)
      options.style = style ? style.url : 'http://www.zotero.org/styles/apa'

      const citation = options.selected ? (await selected(options)) : (await pick(options))

      if (options.minimize) (Zotero.getMainWindow() as any)?.minimize()

      if (options.texstudio) {
        if (!TeXstudio.enabled) return [ this.SERVER_ERROR, 'application/text', 'TeXstudio not found' ]
        await TeXstudio.push(citation)
      }

      if (options.clipboard) toClipboard(citation)

      return [ this.OK, 'text/html; charset=utf-8', citation ]
    }
    catch (err) {
      const error = err instanceof Error ? err : new Error(String(err))
      log.error('CAYW request failed:', options, error)
      flash('CAYW Failed', error.message)
      return [ this.SERVER_ERROR, 'application/text', `CAYW failed: ${ error.message }\n${ error.stack }` ]
    }
  }
}

orchestrator.add({
  id: 'cayw',
  description: 'CAYW endpoint',
  needs: ['translators'],

  startup: async () => { // eslint-disable-line @typescript-eslint/require-await
    Server.register('/better-bibtex/cayw', Handler)
    Server.startup()
  },

  shutdown: async () => { // eslint-disable-line @typescript-eslint/require-await
    Server.shutdown()
  },
})
