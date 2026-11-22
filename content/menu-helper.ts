import { toClipboard, sentenceCase as toSentenceCase } from './text'
import { Preference } from './prefs'
import { flash } from './flash'
import * as Extra from './extra'
import { log } from './logger'
import * as CAYW from './cayw'
import { TeXstudio } from './tex-studio'
import { Translators } from './translators'
import { parse } from './dateparser'
import { parseAsync as parseBibTeX } from '@retorquere/bibtex-parser'
import { readonly } from './library'

function biblatexField(field: string, itemType: string): string {
  switch (field) {
    case 'publicationTitle':
      if (['bookSection', 'conferencePaper', 'encyclopediaArticle', 'dictionaryEntry', 'film', 'tvBroadcast', 'videoRecording'].includes(itemType)) return 'booktitle'
      if (itemType === 'webpage') return 'organization'
      return 'journaltitle'
    case 'publisher':
      if (['report', 'thesis'].includes(itemType)) return 'institution'
      if (['computerProgram', 'document'].includes(itemType)) return 'organization'
      return 'publisher'
    case 'place':
      return itemType === 'presentation' ? 'venue' : 'location'
    default:
      return ({
        abstractNote: 'abstract',
        accessDate: 'urldate',
        conferenceName: 'eventtitle',
        meetingName: 'eventtitle',
        eventPlace: 'venue',
        eventDate: 'eventdate',
        numPages: 'pagetotal',
        numberOfVolumes: 'volumes',
        versionNumber: 'version',
        originalDate: 'origdate',
        originalPlace: 'origlocation',
        originalPublisher: 'origpublisher',
        journalAbbreviation: 'shortjournal',
        status: 'pubstate',
      }[field] || field).toLowerCase()
  }
}

function biblatexCreator(type: string, video: boolean, register: (base: 'editor' | 'name', type: string) => string): string {
  switch (type) {
    case 'author':
    case 'inventor':
    case 'interviewer':
    case 'programmer':
    case 'artist':
    case 'podcaster':
    case 'presenter':
      return 'author'
    case 'director':
      return video ? 'editor' : 'author'
    case 'bookAuthor':
      return 'bookauthor'
    case 'commenter':
      return 'commentator'
    case 'assignee':
      return 'holder'
    case 'editor':
    case 'translator':
      return type
    case 'seriesEditor':
      return register('editor', 'redactor')
    case 'scriptwriter':
      return video ? register('editor', 'scriptwriter') : register('name', 'collaborator')
    default:
      return register('name', 'collaborator')
  }
}

export async function migrateTeX(items: Zotero.Item[]): Promise<void> {
  for (const item of items) {
    if (!item.isRegularItem() || item.isFeedItem || readonly(item)) {
      throw new Error(`Cannot migrate TeX for item ${item.id}: item is not editable`)
    }

    const itemType = Zotero.ItemTypes.getName(item.itemTypeID)
    const inputs: string[] = []
    const updates: Array<{ field: string; index: number }> = []
    const extra: string[] = []
    const hasTeX = (value: string): boolean => /\\|\$[\s\S]*\$/.test(value)

    for (const id of Zotero.ItemFields.getItemTypeFields(item.itemTypeID)) {
      const field = Zotero.ItemFields.getName(id)
      if (field === 'extra') continue
      const value = item.getField(field)
      if (typeof value !== 'string' || !hasTeX(value)) continue
      const base = Zotero.ItemFields.getBaseIDFromTypeAndField(item.itemTypeID, id)
      const name = biblatexField(base ? Zotero.ItemFields.getName(base) : field, itemType)
      extra.push(`tex.${name}= ${value.replace(/[\r\n]+/g, ' ')}`)
      updates.push({ field, index: inputs.push(value) - 1 })
    }

    const creators = item.getCreators()
    const hasEditor = creators.some(creator => Zotero.CreatorTypes.getName(creator.creatorTypeID) === 'editor')
    const video = ['film', 'tvBroadcast', 'videoRecording'].includes(itemType)
    const registered: Record<string, string> = {}
    const occupied = new Set<string>
    const register = (base: 'editor' | 'name', type: string): string => {
      if (registered[type]) return registered[type]
      for (const suffix of base === 'editor' ? ['', 'a', 'b', 'c'] : ['a', 'b', 'c']) {
        const name = `${base}${suffix}`
        if (hasEditor && name === 'editor') continue
        if (occupied.has(name) && suffix !== 'c') continue
        occupied.add(name)
        return registered[type] = name
      }
      throw new Error(`Cannot assign BibLaTeX creator field for ${type}`)
    }
    if (video) register('editor', 'director')
    const creatorGroups: Record<string, typeof creators> = {}
    const creatorUpdates: Array<{ creator: typeof creators[number]; field: 'firstName' | 'lastName'; index: number }> = []
    for (const creator of creators) {
      const type = Zotero.CreatorTypes.getName(creator.creatorTypeID)
      const name = biblatexCreator(type, video, register)
      ;(creatorGroups[name] ??= []).push({ ...creator })
      for (const field of ['firstName', 'lastName'] as const) {
        const value = creator[field]
        if (value && hasTeX(value)) creatorUpdates.push({ creator, field, index: inputs.push(value) - 1 })
      }
    }
    for (const [name, group] of Object.entries(creatorGroups)) {
      if (!group.some(creator => hasTeX(creator.firstName || '') || hasTeX(creator.lastName || ''))) continue
      const names = group.map(creator => {
        if (creator.fieldMode === 1) return `{${creator.lastName}}`
        return [creator.lastName, creator.firstName].filter(Boolean).join(', ')
      }).join(' and ')
      extra.push(`tex.${name}= ${names.replace(/[\r\n]+/g, ' ')}`)
    }

    if (!inputs.length) continue
    const fieldMode = Object.fromEntries(inputs.map((_, index) => [`bbt${index}`, 'literal' as const]))
    const source = `@misc{migrate,\n${inputs.map((value, index) => `bbt${index} = {${value}}`).join(',\n')}\n}`
    const parsed = await parseBibTeX(source, { fieldMode, caseProtection: 'off', unsupported: 'tex' })
    if (parsed.errors.length) throw new Error(`Cannot migrate TeX for item ${item.id}: ${parsed.errors.map(error => error.error).join('; ')}`)
    const fields = parsed.entries[0]?.fields
    if (!fields) throw new Error(`Cannot migrate TeX for item ${item.id}: parser returned no entry`)
    const converted = inputs.map((_, index) => {
      const value = fields[`bbt${index}`]
      if (typeof value !== 'string') throw new Error(`Cannot migrate TeX for item ${item.id}: parser did not return field bbt${index}`)
      return value
    })

    for (const { field, index } of updates) item.setField(field, converted[index])
    for (const { creator, field, index } of creatorUpdates) creator[field] = converted[index]
    if (creatorUpdates.length) item.setCreators(creators)
    item.setField('extra', [item.getField('extra'), ...extra].filter(Boolean).join('\n'))
    await item.saveTx()
  }
}

export async function clipSelected(translatorID: string): Promise<void> {
  const items = Zotero.getActiveZoteroPane()?.getSelectedItems() || []
  if (!items.length) return

  toClipboard(await Translators.queueJob({
    translatorID,
    displayOptions: { worker: true },
    scope: { type: 'items', items },
  }))
}

export async function patchDates(): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane()?.getSelectedItems() || []
    if (!items.length) return

    const mapping: Record<string, string> = {}
    try {
      for (const assignment of Preference.patchDates.trim().split(/\s*,\s*/)) {
        const m = assignment.trim().match(/^([-_a-z09]+)\s*=\s*(dateadded|datemodified)$/i)
        if (m) {
          const [ , k, v ] = m
          mapping[k.toLowerCase()] = mapping[`tex.${k.toLowerCase()}`] = { dateadded: 'dateAdded', datemodified: 'dateModified' }[v.toLowerCase()]!
        }
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
        for (const [ k, v ] of Object.entries(extra.extraFields.tex!)) {
          if (mapping[k]) {
            const date = parse(v.value)
            if (date.type === 'date' && date.day) {
              delete extra.extraFields.tex![k]
              const time = typeof date.seconds === 'number'
              const timestamp = new Date(
                date.year, date.month! - 1, date.day,
                time ? date.hour : 0, time ? date.minute! - (date.offset || 0) : 0, time ? date.seconds : 0, 0
              )
              item.setField(mapping[k], timestamp.toISOString())
              save = true
            }
          }
        }
        if (save) {
          item.setField('extra', Extra.set(extra.extra, extra.extraFields))
          await item.saveTx({ skipDateModifiedUpdate: true })
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

export function selectedItemsHaveCitationKeyInExtra(): boolean {
  return Zotero.getActiveZoteroPane()?.getSelectedItems().some(item => {
    if (item.isFeedItem || !item.isRegularItem()) return false
    return !!Extra.citationKey(item.getField('extra')).citationKey
  }) || false
}

export async function applyCitationKeyFromExtra(move: boolean): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane()?.getSelectedItems()
    if (!items?.length) return

    for (const item of items) {
      if (item.isFeedItem || !item.isRegularItem()) continue

      const { citationKey, extra } = Extra.citationKey(item.getField('extra'))
      if (!citationKey) continue

      if (move) item.setField('citationKey', citationKey)
      item.setField('extra', extra)
      await item.saveTx()
    }
  }
  catch (err) {
    log.error('applyCitationKeyFromExtra:', err)
  }
}

export async function sentenceCase(): Promise<void> {
  try {
    const items = Zotero.getActiveZoteroPane()?.getSelectedItems() || []
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
    const items = Zotero.getActiveZoteroPane()?.getSelectedItems() || []
    if (items.length !== 1) {
      flash('Citation links only works for a single item')
      return
    }

    const extra = items[0].getField('extra') || ''
    const citations = new Set(extra.split('\n').filter((line: string) => line.startsWith('cites:')))
    const picked = (await CAYW.pick({ format: 'citationLinks' })).output.split('\n').filter(citation => !citations.has(citation))

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
