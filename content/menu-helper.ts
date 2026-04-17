import { toClipboard, sentenceCase as toSentenceCase } from './text'
import { Preference } from './prefs'
import { flash } from './flash'
import * as Extra from './extra'
import { log } from './logger'
import * as CAYW from './cayw'
import { TeXstudio } from './tex-studio'
import { Translators } from './translators'

export async function clipSelected(translatorID: string): Promise<void> {
  const items = Zotero.getActiveZoteroPane().getSelectedItems()
  toClipboard(await Translators.queueJob({
    translatorID,
    displayOptions: { worker: true },
    scope: { type: 'items', items },
  }))
}

const re = /^(?<year>\d{4,})-(?<month>\d{2})-(?<day>\d{2}) (?<hour>\d{2}):(?<minute>\d{2}):(?<second>\d{2})( (?<offset>[+-]\d{4}))?$/
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
            const date: Record<string, number> = Object.entries(v.value.match(re)?.groups || {})
              .reduce((acc, [dk, dv]) => ({ ...acc, [dk]: typeof dv === 'undefined' ? 0 : parseInt(dv, 10) }), {})
            if (typeof date.year === 'number') {
              delete extra.extraFields.tex[k]
              const { year, month, day, hour, minute, second, offset } = date
              const timestamp = new Date(year, month - 1, day, hour, minute - offset, second)
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
