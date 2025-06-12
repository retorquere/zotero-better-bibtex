import { toClipboard, sentenceCase as toSentenceCase } from './text'
import { Preference } from './prefs'
import { flash } from './flash'
import * as Extra from './extra'
import * as DateParser from './dateparser'
import { log } from './logger'
import * as CAYW from './cayw'
import { TeXstudio } from './tex-studio'
import * as blink from 'blinkdb'
import { AutoExport } from './auto-export'
import { Translators } from './translators'

export async function clipSelected(translatorID: string): Promise<void> {
  const items = Zotero.getActiveZoteroPane().getSelectedItems()
  toClipboard(await Translators.queueJob({
    translatorID,
    displayOptions: { worker: true },
    scope: { type: 'items', items },
  }))
}

export async function patchDates(): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane().getSelectedItems()
    const mapping: Record<string, string> = {}
    try {
      for (const assignment of Preference.patchDates.trim().split(/\s*,\s*/)) {
        const [ , k, v ] = assignment.trim().match(/^([-_a-z09]+)\s*=\s*(dateadded|datemodified)$/i)
        mapping[k.toLowerCase()] = mapping[`tex.${ k.toLowerCase() }`] = { dateadded: 'dateAdded', datemodified: 'dateModified' }[v.toLowerCase()]
      }
    }
    catch {
      flash('could not parse field mapping', `could not parse field mapping ${ Preference.patchDates }`)
      return
    }

    for (const item of items) {
      let save = false
      try {
        const extra = Extra.get(item.getField('extra'), 'zotero', { tex: true })
        for (const [ k, v ] of Object.entries(extra.extraFields.tex)) {
          if (mapping[k]) {
            const date = DateParser.parse(v.value)
            if (date.type === 'date' && date.day) {
              delete extra.extraFields.tex[k]
              const time = typeof date.seconds === 'number'
              const timestamp = new Date(
                date.year, date.month - 1, date.day,
                time ? date.hour : 0, time ? date.minute - (date.offset || 0) : 0, time ? date.seconds : 0, 0
              )
              item.setField(mapping[k], timestamp.toISOString())
              save = true
            }
          }
        }
        if (save) {
          item.setField('extra', Extra.set(extra.extra, extra.extraFields))
          await item.saveTx()
        }
      }
      catch (err) {
        log.error('patchDates:', err)
      }
    }
  }
  catch (err) {
    log.error('patchDates:', err)
  }
}

export async function sentenceCase(): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane().getSelectedItems()
    for (const item of items) {
      let save = false

      const title = item.getField('title')
      let sentenceCased = toSentenceCase(title)
      if (title !== sentenceCased) {
        save = true
        item.setField('title', sentenceCased)
      }

      const shortTitle = item.getField('shortTitle')
      if (sentenceCased.toLowerCase().startsWith(shortTitle.toLowerCase())) {
        sentenceCased = sentenceCased.substr(0, shortTitle.length)
        if (shortTitle !== sentenceCased) {
          item.setField('shortTitle', sentenceCased)
          save = true
        }
      }

      if (save) await item.saveTx()
    }
  }
  catch (err) {
    log.error('sentenceCase:', err)
  }
}

export async function addCitationLinks(): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane().getSelectedItems()
    if (items.length !== 1) {
      flash('Citation links only works for a single item')
      return
    }

    const extra = items[0].getField('extra') || ''
    const citations = new Set(extra.split('\n').filter((line: string) => line.startsWith('cites:')))
    const picked = (await CAYW.pick({ format: 'citationLinks' })).split('\n').filter(citation => !citations.has(citation))

    if (picked.length) {
      items[0].setField('extra', `${ extra }\n${ picked.join('\n') }`.trim())
      await items[0].saveTx()
    }
  }
  catch (err) {
    log.error('addCitationLinks:', err)
  }
}

export async function toTeXstudio(): Promise<void> {
  try {
    await TeXstudio.push()
  }
  catch (err) {
    log.error('toTeXstudio:', err)
  }
}

export function AEisHidden(elem: any, _ev: Event): boolean { // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
  const { library, collection } = selected()

  if (!library && !collection) return true

  let n: number
  const m = elem.getAttribute('id')?.match(/^better-bibtex-collection-menu-ae-(\d+)$/)
  if (m) {
    n = parseInt(m[1])
  }
  else {
    n = 0
  }

  const aes = blink.many(AutoExport.db, {
    where: { type: library ? 'library' : 'collection', id: library ? library.id : collection.id },
    sort: { key: 'path', order: 'asc' },
  })
  const ae = aes[n]
  if (!ae) return true

  if (m) elem.setAttribute('label', ae.path)
  return false
}

export function selected(): { library?: Zotero.Group; collection?: Zotero.Collection } {
  const zp = Zotero.getActiveZoteroPane()
  const cv = zp?.collectionsView
  if (!cv) return {}

  return {
    library: cv.selectedTreeRow?.isLibrary(true) ? (Zotero.Libraries.get(zp.getSelectedLibraryID()) as unknown as Zotero.Group) || null : null,
    collection: cv.selection?.count && cv.selectedTreeRow?.isCollection() ? zp.getSelectedCollection() : null,
  }
}

export function pullExport(): void {
  let { library, collection } = selected()

  if (!library && !collection) return
  if (!library) library = Zotero.Libraries.get(collection.libraryID) as unknown as Zotero.Group

  const root = `http://127.0.0.1:${Zotero.Prefs.get('httpServer.port')}/better-bibtex/export?`
  const params = {
    url: {
      long: root,
      short: root,
    },
  }

  if (library.groupID) {
    params.url.short += `/group;id:${library.groupID}`
    params.url.long += `/group;name:${encodeURIComponent(library.name)}`
  }
  else {
    params.url.short += `/library;id:${library.libraryID}`
    params.url.long += `/library;name:${encodeURIComponent(library.name)}`
  }

  if (collection) {
    params.url.short += `/collection;key:${collection.key}`
    let path = `/${encodeURIComponent(collection.name)}`
    while (typeof collection.parentID === 'number') {
      collection = Zotero.Collections.get(collection.parentID)
      path = `/${encodeURIComponent(collection.name)}${path}`
    }
    params.url.long += `/collection${path}`
  }
  else {
    params.url.short += `/${encodeURIComponent(library.name) || 'library'}`
    params.url.long += `/${encodeURIComponent(library.name) || 'library'}`
  }

  Zotero.getMainWindow().openDialog('chrome://zotero-better-bibtex/content/ServerURL.xhtml', '', 'chrome,dialog,centerscreen,modal', params)
}
