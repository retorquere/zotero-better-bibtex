import { orchestrator } from './orchestrator'

import ETA from 'node-eta'

import { japanese } from './key-manager/japanese'
import { chinese } from './key-manager/chinese'

import { Scheduler } from './scheduler'
import { log } from './logger'
import { flash } from './flash'
import { Events } from './events'
import { fetchAsync as fetchInspireHEP } from './inspire-hep'
import { excelColumn, sentenceCase } from './text'
import * as Extra from './extra'

import * as ZoteroDB from './db/zotero'

import { getItemsAsync } from './get-items-async'

import { Preference } from './prefs'
import { Formatter } from './key-manager/formatter'

import Loki from 'lokijs'

import { Cache } from './translators/worker'

import { sprintf } from 'sprintf-js'
import { newQueue } from '@henrygd/queue/rl'

import * as l10n from './l10n'

import { migrate } from './key-manager/migrate'

export type CitekeyRecord = {
  itemID: number
  libraryID: number
  itemKey: string
  citationKey: string
  lcCitationKey: string
}

type UnwatchCallback = () => void

function lc(record: Partial<CitekeyRecord>): CitekeyRecord {
  record.lcCitationKey = record.citationKey.toLowerCase()
  return record as unknown as CitekeyRecord
}

class Progress {
  private win: any
  private progress: any
  private eta: ETA

  constructor(total: number, message: string) {
    this.win = new Zotero.ProgressWindow({ closeOnClick: false })
    this.win.changeHeadline(`Better BibTeX: ${ message }`)
    const icon = `chrome://zotero/skin/treesource-unfiled${ Zotero.hiDPI ? '@2x' : '' }.png`
    this.progress = new this.win.ItemProgress(icon, message)
    this.win.show()

    this.eta = new ETA(total, { autoStart: true })
  }

  next() {
    this.eta.iterate()

    if ((this.eta.done % 10) === 1) {
      this.progress.setProgress((this.eta.done * 100) / this.eta.count)
      this.progress.setText(this.eta.format(`${ this.eta.done } / ${ this.eta.count }, {{etah}} remaining`))
    }
  }

  done() {
    this.progress.setProgress(100)
    this.progress.setText('Ready')
    this.win.close()
  }
}

type BatchedQuery = {
  query: string
  params: Array<string | number>
}

export const KeyManager = new class _KeyManager {
  public searchEnabled = false

  private db = {
    queue: newQueue(1, 1, 5000),
    batch: [] as BatchedQuery[],

    schedule(query: string, params: Array<string | number>) {
      this.batch.push({ query, params })

      this.queue.add(async () => {
        if (this.batch.length) {
          const batch = this.batch
          this.batch = []
          await Zotero.DB.executeTransaction(async () => {
            for (const q of batch) {
              await ZoteroDB.queryAsync(q.query, q.params)
            }
          })
        }
      })
    },
  }

  public keys = (new Loki('citationkeys.db')).addCollection<CitekeyRecord>('citationKeys', {
    indices: [ 'itemID', 'libraryID', 'itemKey', 'citationKey', 'lcCitationKey' ],
    unique: [ 'itemID' ],
  })

  private unwatch: UnwatchCallback[] = []

  public autopin: Scheduler<number> = new Scheduler<number>('autoPinDelay', 1000)

  private started = false

  private getField(item: { getField: ((str: string) => string) }, field: string): string {
    try {
      return item.getField(field) || ''
    }
    catch {
      return ''
    }
  }

  public async fill(ids: 'selected' | number | number[], inspireHEP = false): Promise<void> {
    log.debug('1721: fill')
    ids = this.expandSelection(ids)

    await Zotero.DB.executeTransaction(async () => {
      for (const item of await getItemsAsync(ids)) {
        if (item.isFeedItem || !item.isRegularItem()) continue

        const current = this.getField(item, 'citationKey')
        if (inspireHEP) {
          const proposed = await fetchInspireHEP(item)
          if (proposed && current !== proposed) {
            log.debug('1721: inspireHEP')
            item.setField('citationKey', proposed)
            await item.save()
          }
        }
        else {
          await this.update(item).save()
        }
      }
    })
  }

  public async refresh(ids: 'selected' | number | number[], warn = false, replace = false): Promise<void> {
    ids = this.expandSelection(ids)
    log.debug('1721: refresh', { ids, warn, replace })
    const keys = new Set(ids)
    await Cache.touch(ids)

    const warnAt = warn ? Preference.warnBulkModify : 0
    const overwrite = Preference.autoPinOverwrite
    const affected = warnAt ? this.keys.find().filter(item => overwrite || !keys.has(item.itemID)).length : 0

    if (warnAt && affected > warnAt) {
      const ignore = { value: false }
      const index = Services.prompt.confirmEx(
        null, // no parent
        'Better BibTeX for Zotero', // dialog title
        l10n.localize('better-bibtex_bulk-keys-confirm_warning', { treshold: warnAt }),
        Services.prompt.STD_OK_CANCEL_BUTTONS + Services.prompt.BUTTON_POS_2 * Services.prompt.BUTTON_TITLE_IS_STRING, // buttons
        null, null, l10n.localize('better-bibtex_bulk-keys-confirm_stop_asking'), // button labels
        null, ignore // no checkbox
      )
      switch (index) {
        case 0: // OK
          break
        case 2: // don't ask again
          Preference.warnBulkModify = 0
          break
        default:
          return
      }
    }

    const items = (await getItemsAsync(ids)).filter(item => {
      // these get no key
      if (item.isFeedItem || !item.isRegularItem()) return false
      return replace || !item.getField('citationKey')
    })

    if (!items.length) return

    // clear before refresh so they can update without hitting "claimed keys" in the deleted set
    this.clear(items.map(item => item.id as number))

    const progress: Progress = items.length > 10 ? new Progress(items.length, 'Refreshing citation keys') : null
    for (const item of items) {
      const citationKey = this.update(item, replace).getField('citationKey')

      // remove the new citekey from the aliases if present
      const aliases = Extra.get(item.getField('extra'), 'zotero', { aliases: true })
      if (aliases.extraFields.aliases.includes(citationKey)) {
        aliases.extraFields.aliases = aliases.extraFields.aliases.filter(alias => alias !== citationKey)

        if (aliases.extraFields.aliases.length) {
          item.setField('extra', Extra.set(aliases.extra, { aliases: aliases.extraFields.aliases }))
        }
        else {
          item.setField('extra', aliases.extra)
        }
      }

      progress?.next()
    }
    progress?.done()

    for (const item of items) {
      await item.saveTx()
      await Zotero.Promise.delay(10)
    }
  }

  constructor() {
    orchestrator.add({
      id: 'keymanager',
      description: 'keymanager',
      needs: [ 'worker' ],
      startup: async () => {
        this.keys.on('insert', (key: CitekeyRecord) => {
          log.debug('z8: key insert', key)
        })

        this.keys.on('pre-update', (key: CitekeyRecord) => {
          log.debug('z8: key replace', key)
        })
        this.keys.on('update', (key: CitekeyRecord) => {
          log.debug('z8: key update', key)
        })

        this.keys.on('delete', (key: CitekeyRecord) => {
          log.debug('z8: key delete', key)
        })

        await japanese.init()
        chinese.init()

        Formatter.update([Preference.citekeyFormat])

        await this.start()
      },
      shutdown: async () => {
        for (const cb of this.unwatch) {
          cb()
        }
        await this.db.queue.done()
      },
    })
  }

  private clear(ids: number[]) {
    this.keys.findAndRemove({ itemID: { $in: ids } })
  }

  private upsert(item) {
    const citationKey = item.getField('citationKey') || ''

    if (!citationKey) {
      this.clear([item.id])
      return
    }

    const record = this.keys.findOne({ itemID: item.id })
    if (record) {
      record.citationKey = citationKey
      this.keys.update(lc(record))
    }
    else {
      this.keys.insert(lc({
        itemID: item.id,
        itemKey: item.key,
        libraryID: item.libraryID,
        citationKey,
      }))
    }
  }

  private async start(): Promise<void> {
    void migrate()

    const load = `
      SELECT item.itemID, item.key AS itemKey, item.libraryID, idv.value AS citationKey
      FROM items item
      JOIN itemData id ON item.itemID = id.itemID
      JOIN fields f ON id.fieldID = f.fieldID AND f.fieldName = 'citationKey'
      JOIN itemDataValues idv ON id.valueID = idv.valueID
      WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
        AND item.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
        AND item.itemID NOT IN (SELECT itemID FROM feedItems)
      `.replace(/\n/g, ' ').trim()

    const keys: CitekeyRecord[] = []
    for (const { itemID, itemKey, libraryID, citationKey } of await Zotero.DB.queryAsync(load)) {
      keys.push(lc({ itemID, itemKey, libraryID, citationKey }))
    }
    this.keys.insert(keys)

    Events.on('preference-changed', pref => {
      switch (pref) {
        case 'autoAbbrevStyle':
        case 'citekeyFormat':
        case 'citekeyFold':
        case 'citekeyCaseInsensitive':
        case 'citekeyUnsafeChars':
        case 'skipWords':
          Formatter.update([Preference.citekeyFormat])
          break
      }
    })

    Events.on('items-removed', ({ itemIDs }) => {
      this.clear(itemIDs)
    })

    Events.on('items-changed', ({ items, action }) => {
      let warn_titlecase = 0 // should not be here

      // why do deleted items keep showing up here?
      items = items.filter(item => {
        if (item.deleted || !item.isRegularItem() || item.isFeedItem) {
          this.clear([item.id])
          return false
        }
        return true
      })

      const update = (item: Zotero.Item) => {
        log.debug('1721: items-changed')
        this.update(item, Preference.autoPinOverwrite).saveTx().catch(err => log.error('failed to update', item.id, ':', err))
      }
      for (const item of items) {
        if (Preference.testing) { // race condition for key assignment otherwise
          update(item)
        }
        else {
          this.autopin.schedule(item.id, () => {
            update(item)
          })
        }

        if (Preference.warnTitleCased) {
          const title = item.getField('title')
          if (title !== sentenceCase(title)) warn_titlecase += 1
        }
      }

      if (warn_titlecase) {
        const actioned = action === 'add' ? 'added' : 'saved'
        const msg = warn_titlecase === 1
          ? `${ warn_titlecase } item ${ actioned } which looks like it has a title-cased title`
          : `${ warn_titlecase } items ${ actioned } which look like they have title-cased titles`
        flash(`Possibly title-cased title${ warn_titlecase > 1 ? 's' : '' } ${ actioned }`, msg, 3)
      }
    })

    this.started = true
  }

  public update(item: Zotero.Item, replace = false): Zotero.Item {
    log.debug('1495: item key update, replace:', replace)
    if (item.isFeedItem || !item.isRegularItem()) return item

    do {
      const { extra, citationKey } = Extra.citationKey(item.getField('extra'))
      if (citationKey) {
        log.debug('1495: item key update, migrated:', citationKey)
        item.setField('extra', extra)
        item.setField('citationKey', citationKey)
        break
      }

      const current = item.getField('citationKey')
      if (current && !replace) break

      const proposed = this.propose(item)
      if (proposed === current) break

      log.debug('1495: update set proposed', proposed)
      item.setField('citationKey', proposed)
    } while (false) // eslint-disable-line no-constant-condition

    this.upsert(item)
    return item
  }

  public get(itemID: number): CitekeyRecord {
    // I cannot prevent being called before the init is done because Zotero unlocks the UI *way* before I'm getting the
    // go-ahead to *start* my init.
    if (!this.keys || !this.started) return null
    return this.keys.findOne({ itemID })
  }

  public first(query: LokiQuery<CitekeyRecord>): CitekeyRecord {
    return this.keys.findOne(query)
  }

  public find(query: LokiQuery<CitekeyRecord>): CitekeyRecord[] {
    return this.keys.find(query)
  }

  public all(): CitekeyRecord[] {
    return this.keys.data
  }

  // mem is for https://github.com/retorquere/zotero-better-bibtex/issues/2926
  public propose(item: Zotero.Item, mem?: Set<string>): string {
    const citationKey = Formatter.format(item)

    const ci = Preference.citekeyCaseInsensitive
    const ck = ci ? 'lcCitationKey' : 'citationKey'
    const q = {
      ...(Preference.keyScope === 'global' ? {} : { libraryID: item.libraryID }),
      [ck]: '',
      itemID: { $ne: item.id },
    }

    const seen: Set<string> = new Set
    // eslint-disable-next-line no-constant-condition
    for (let n = Formatter.postfix.offset; true; n += 1) {
      const postfixed = citationKey.replace(Formatter.postfix.marker, () => {
        let postfix = ''
        if (n) {
          const alpha = excelColumn(n)
          postfix = sprintf(Formatter.postfix.template, { a: alpha.toLowerCase(), A: alpha, n })
        }
        // this should never happen, it'd mean the postfix pattern doesn't have placeholders, which should have been caught by parsePattern
        if (seen.has(postfix)) throw new Error(`${ JSON.stringify(Formatter.postfix) } does not generate unique postfixes`)
        seen.add(postfix)
        return postfix
      })

      q[ck] = ci ? postfixed.toLowerCase() : postfixed
      if (this.keys.findOne(q)) continue
      if (mem) {
        if (mem.has(postfixed)) continue
        mem.add(postfixed)
      }
      return postfixed
    }
  }

  public async tagDuplicates(libraryID: number): Promise<void> {
    const tag = '#duplicate-citation-key'

    const tagged = (await ZoteroDB.queryAsync(`
      SELECT items.itemID
      FROM items
      JOIN itemTags ON itemTags.itemID = items.itemID
      JOIN tags ON tags.tagID = itemTags.tagID
      WHERE (items.libraryID = ? OR 'global' = ?) AND tags.name = ? AND items.itemID NOT IN (select itemID from deletedItems)
    `, [ libraryID, Preference.keyScope, tag ])).map((item: { itemID: number }) => item.itemID)

    const citekeys: Record<string, any[]> = {}
    for (const item of this.keys.find(Preference.keyScope === 'global' ? {} : { libraryID })) {
      citekeys[item.citationKey] ??= []
      citekeys[item.citationKey].push({ itemID: item.itemID, tagged: tagged.includes(item.itemID), duplicate: false })
      if (citekeys[item.citationKey].length > 1) citekeys[item.citationKey].forEach(i => i.duplicate = true)
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    const mistagged = Object.values(citekeys).reduce((acc, val) => acc.concat(val), []).filter(i => i.tagged !== i.duplicate).map(i => i.itemID)
    for (const item of await getItemsAsync(mistagged)) {
      if (tagged.includes(item.id)) {
        item.removeTag(tag)
      }
      else {
        item.addTag(tag)
      }

      await item.saveTx()
    }
  }

  private expandSelection(ids: 'selected' | number | number[]): number[] {
    if (Array.isArray(ids)) return ids

    if (ids === 'selected') {
      try {
        return Zotero.getActiveZoteroPane().getSelectedItems(true)
      }
      catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
        log.error('Could not get selected items:', err)
        return []
      }
    }

    return [ids]
  }
}
