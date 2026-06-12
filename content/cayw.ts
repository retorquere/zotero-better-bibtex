import { Formatter } from './cayw/formatter'
import { Picker, type PickResult, type State } from './cayw/pick'
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
  note?: string
}

type CitationFormatter = (citations: Citation[], options: any) => Promise<string>

type CAYWOptions = Record<string, unknown> & {
  format?: string
  documentId?: string
  state?: State
  select?: boolean
  selected?: boolean
  style?: string
  contentType?: string
  locale?: string
  probe?: boolean | string
  minimize?: boolean | string
  texstudio?: boolean | string
  clipboard?: boolean | string
}

type PickResponse = {
  state: State
  pick: PickResult[]
  output: string
}

function citationItems(picks: PickResult[]): Citation[] {
  const items: Citation[] = []

  for (const result of picks) {
    for (const item of result.citationItems || []) {
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
        note: typeof item.itemData?.note === 'string' ? item.itemData.note : undefined,
      })
    }
  }

  return items
}

function pickedItems(picks: PickResult[]): Record<string, unknown>[] {
  const items: Record<string, unknown>[] = []

  for (const result of picks) {
    for (const item of result.citationItems || []) {
      if (item.itemData && typeof item.itemData === 'object') {
        items.push({
          ...item.itemData,
          ...(item.id ? { id: item.id } : {}),
          ...(item.uris ? { uris: item.uris } : {}),
        })
      }
      else {
        items.push({ ...item })
      }
    }
  }

  return items
}

function itemPicks(citations: Citation[]): Citation[] {
  return citations.filter(citation => citation.itemType !== 'note')
}

function getFormatter(options: CAYWOptions): CitationFormatter {
  const formatter = options.format || 'latex'
  const resolved = Formatter[formatter] as CitationFormatter | undefined
  if (!resolved) throw new Error(`No such formatter ${ JSON.stringify(formatter) }`)
  return resolved
}

export async function pick(options: CAYWOptions): Promise<PickResponse> {
  await Zotero.BetterBibTeX.ready

  log.info('CAYW pick requested', options)
  const picker = new Picker({
    documentId: options.documentId || `better-bibtex-cayw-${ Zotero.Utilities.generateObjectKey() }`,
    processorName: 'Better BibTeX',
    state: options.state,
  })
  const picks = await picker.pick()
  if ((options.format || 'latex') === 'pick') {
    return {
      state: picker.state,
      pick: picks,
      output: JSON.stringify(pickedItems(picks)),
    }
  }

  const formatter = getFormatter(options)
  const picked = itemPicks(citationItems(picks))
  const output = picked.length ? await formatter(picked, options) : ''

  if (options.select && picked.length) {
    await Zotero.getActiveZoteroPane().selectItems(picked.map(item => item.id), true)
  }
  log.info('CAYW pick completed', { state: picker.state, pick: picks })

  return {
    state: picker.state,
    pick: picks,
    output,
  }
}

async function formattedPick(options: CAYWOptions): Promise<string> {
  try {
    return (await pick(options)).output
  }
  catch (err) {
    const error = err instanceof Error ? err : new Error(String(err))
    log.error('CAYW error:', error, `${ error }`, error.stack, options)
    flash('CAYW pick failed', stringify(error))
    return ''
  }
}

async function selected(options: CAYWOptions): Promise<string> {
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
  const itemPicked = itemPicks(picked)
  return itemPicked.length ? await formatter(itemPicked, options) : ''
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
  public supportedMethods = ['GET', 'POST']
  public supportedDataTypes = ['application/json']
  public OK = 200
  public SERVER_ERROR = 500

  public async init(request) {
    const options = { ...(request.data || {}), ...Server.queryParams(request) } as CAYWOptions

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

      if (request.method === 'POST') {
        const response = options.selected
          ? { state: options.state || {}, pick: [], output: await selected(options) }
          : await pick(options)

        return [ this.OK, 'application/json', JSON.stringify(response) ]
      }

      const citation = options.selected ? (await selected(options)) : (await formattedPick(options))

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
      return [ this.SERVER_ERROR, 'application/text', `CAYW failed: ${JSON.stringify(options)} requested: ${error.message}` ]
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
