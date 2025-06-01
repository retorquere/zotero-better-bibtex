/*
declare var Services: any
if (typeof Services == 'undefined') {
  var { Services } = ChromeUtils.import('resource://gre/modules/Services.jsm') // eslint-disable-line no-var
}
*/

import { orchestrator } from './orchestrator'

import ETA from 'node-eta'

import { alert, prompt } from './prompt'

import { japanese } from './key-manager/japanese'
import { chinese } from './key-manager/chinese'

import { Scheduler } from './scheduler'
import { log } from './logger'
import { flash } from './flash'
import { Events } from './events'
import { fetchAsync as fetchInspireHEP } from './inspire-hep'
import * as Extra from './extra'
import { excelColumn, sentenceCase } from './text'

import * as ZoteroDB from './db/zotero'

import { getItemsAsync } from './get-items-async'

import { Preference } from './prefs'
import { Formatter } from './key-manager/formatter'

import { createDB, createTable, Query, BlinkKey } from 'blinkdb'
import * as blink from 'blinkdb'
import { Cache } from './translators/worker'

import { monkey } from './monkey-patch'

import { sprintf } from 'sprintf-js'
import { newQueue } from '@henrygd/queue'

import * as l10n from './l10n'

type CitekeyRecord = {
  itemID: number
  libraryID: number
  itemKey: string
  citationKey: string
  lcCitationKey: string
  pinned: boolean | 0 | 1
}

type UnwatchCallback = () => void

function lc(record: Partial<CitekeyRecord>): CitekeyRecord {
  record.lcCitationKey = record.citationKey.toLowerCase()
  return record as unknown as CitekeyRecord
}

function byItemID(itemID) {
  return { where: { itemID }}
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

export const KeyManager = new class _KeyManager {
  public searchEnabled = false
  private queue = newQueue(1)

  // Table<CitekeyRecord, "itemID">
  public keys = createTable<CitekeyRecord>(createDB({ clone: true }), 'citationKeys')({
    primary: 'itemID',
    indexes: [ 'itemKey', 'libraryID', 'citationKey', 'lcCitationKey' ],
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

  public async set(): Promise<void> {
    const ids = this.expandSelection('selected')

    if (ids.length !== 1) return alert({ text: l10n.localize('better-bibtex_citekey_set_toomany') })

    const existingKey = this.get(ids[0]).citationKey
    const citationKey = prompt({ text: l10n.localize('better-bibtex_citekey_set_change'), value: existingKey }) || existingKey
    if (citationKey === existingKey) return

    await Cache.touch(ids)

    const item = await getItemsAsync(ids[0])
    item.setField('extra', Extra.set(item.getField('extra'), { citationKey }))
    await item.saveTx() // this should cause an update and key registration
  }

  public async pin(ids: 'selected' | number | number[], inspireHEP = false): Promise<void> {
    ids = this.expandSelection(ids)

    for (const item of await getItemsAsync(ids)) {
      if (item.isFeedItem || !item.isRegularItem()) continue

      const extra = this.getField(item, 'extra')
      const parsed = Extra.get(extra, 'zotero')
      let citationKey: string = null

      if (inspireHEP) {
        citationKey = await fetchInspireHEP(item)
        if (!citationKey || parsed.extraFields.citationKey === citationKey) continue
      }
      else {
        if (parsed.extraFields.citationKey) continue

        citationKey = this.get(item.id).citationKey || this.update(item)
      }

      item.setField('extra', Extra.set(extra, { citationKey }))
      await item.saveTx() // this should cause an update and key registration
    }
  }

  public async unpin(ids: 'selected' | number | number[]): Promise<void> {
    ids = this.expandSelection(ids)

    for (const item of await getItemsAsync(ids)) {
      if (item.isFeedItem || !item.isRegularItem()) continue

      const parsed = Extra.get(item.getField('extra'), 'zotero', { citationKey: true })
      if (!parsed.extraFields.citationKey) continue

      item.setField('extra', parsed.extra) // citekey is stripped here but will be regenerated by the notifier
      item.saveTx()
    }
  }

  public async refresh(ids: 'selected' | number | number[], manual = false): Promise<void> {
    ids = this.expandSelection(ids)
    await Cache.touch(ids)

    const warnAt = manual ? Preference.warnBulkModify : 0
    const affected = blink.many(this.keys, {
      where: {
        itemID: { in: ids },
        pinned: { in: [ 0, false ]},
      },
    }).length

    if (warnAt > 0 && affected > warnAt) {
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

    const save: Set<number> = new Set
    const items = (await getItemsAsync(ids)).filter(item => {
      // these get no key
      if (item.isFeedItem || !item.isRegularItem()) return false

      const pinned = Extra.get(item.getField('extra'), 'zotero', { citationKey: true })
      if (pinned.extraFields.citationKey) {
        if (manual) {
          item.setField('extra', pinned.extra)
          save.add(item.id)
        }
        else {
          return false
        }
      }

      return true
    })

    if (!items.length) return

    // clear before refresh so they can update without hitting "claimed keys" in the deleted set
    this.clear(items.map(item => item.id as number))

    const progress: Progress = items.length > 10 ? new Progress(items.length, 'Refreshing citation keys') : null
    for (const item of items) {
      const citationKey = this.update(item)

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
        save.add(item.id)
      }

      progress?.next()
    }
    progress?.done()

    for (const item of items) {
      if (!save.has(item.id)) continue
      await item.saveTx()
      await Zotero.Promise.delay(10)
    }

    /* this already happens in the trigger on the key store
    const updates: Zotero.Item[] = items.filter(item => !save.has(item.id))
    if (updates.length) void Events.emit('items-changed', { items: updates, action: 'modify', reason: 'key-refresh' })
    */
  }

  constructor() {
    orchestrator.add({
      id: 'keymanager',
      description: 'keymanager',
      needs: [ 'worker', 'sqlite'],
      startup: async () => {
        await japanese.init()
        chinese.init()

        Formatter.update([Preference.citekeyFormat])

        await this.start()
      },
      shutdown: async () => {
        for (const cb of this.unwatch) {
          cb()
        }
        await this.queue.done()
      },
    })
    orchestrator.add({
      id: 'citekeysearch',
      description: 'citation key search',
      needs: ['keymanager'],
      startup: async () => { // eslint-disable-line @typescript-eslint/require-await
        this.enableSearch()
      },
    })
  }

  private enableSearch(): void {
    if (this.searchEnabled) return
    this.searchEnabled = true

    const citekeySearchCondition = {
      name: 'citationKey',
      operators: {
        is: true,
        isNot: true,
        contains: true,
        doesNotContain: true,
      },
      table: 'betterbibtex.citationkey',
      field: 'citationKey',
      localized: 'Citation Key',
    }

    monkey.patch(Zotero.Search.prototype, 'addCondition', original => function addCondition(condition: string, operator: any, value: any, _required: any) {
      // detect a quick search being set up
      if (condition.match(/^quicksearch/)) this.__add_bbt_citekey = true
      // creator is always added in a quick search so use it as a trigger
      if (condition === 'creator' && this.__add_bbt_citekey) {
        original.call(this, citekeySearchCondition.name, operator, value, false)
        delete this.__add_bbt_citekey
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
      return original.apply(this, arguments)
    })
    monkey.patch(Zotero.SearchConditions, 'hasOperator', original => function hasOperator(condition: string, operator: string | number) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      if (condition === citekeySearchCondition.name) return citekeySearchCondition.operators[operator]
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
      return original.apply(this, arguments)
    })
    monkey.patch(Zotero.SearchConditions, 'get', original => function get(condition: string) {
      if (condition === citekeySearchCondition.name) return citekeySearchCondition
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
      return original.apply(this, arguments)
    })
    monkey.patch(Zotero.SearchConditions, 'getStandardConditions', original => function getStandardConditions() {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
      return original.apply(this, arguments).concat({
        name: citekeySearchCondition.name,
        localized: citekeySearchCondition.localized,
        operators: citekeySearchCondition.operators,
      }).sort((a: { localized: string }, b: { localized: any }) => a.localized.localeCompare(b.localized))
    })
    monkey.patch(Zotero.SearchConditions, 'getLocalizedName', original => function getLocalizedName(str: string) {
      if (str === citekeySearchCondition.name) return citekeySearchCondition.localized
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, prefer-rest-params
      return original.apply(this, arguments)
    })
  }

  // serialize so background stores from onRemove at all happen in order
  private async store(key: CitekeyRecord) {
    await this.queue.add(() => this.$store(key))
  }

  private async $store(key: CitekeyRecord) {
    await Zotero.DB.queryAsync('REPLACE INTO betterbibtex.citationkey (itemID, itemKey, libraryID, citationKey, pinned) VALUES (?, ?, ?, ?, ?)', [
      key.itemID,
      key.itemKey,
      key.libraryID,
      key.citationKey,
      key.pinned ? 1 : 0,
    ])

    if (!blink.first(this.keys, byItemID(key.itemID))) return

    let item
    try {
      item = await Zotero.Items.getAsync(key.itemID)
      if (!item) log.error('could not load', key.itemID)
    }
    catch (err) {
      log.error('could not load', key.itemID, err)
    }
    if (!item) return

    if (item.isFeedItem || !item.isRegularItem()) {
      log.error('citekey registered for item of type', item.isFeedItem ? 'feedItem' : Zotero.ItemTypes.getName(item.itemTypeID))
      return
    }

    if (!key.pinned && this.autopin.enabled) {
      this.autopin.schedule(key.itemID, () => {
        this.pin([key.itemID]).catch(err => log.error('failed to pin', key.itemID, ':', err))
      })
    }

    if (key.pinned && Preference.keyConflictPolicy === 'change') {
      const where = {
        where: {
          pinned: { in: [ 0, false ]},
          citationKey: { eq: key.citationKey },
          lcCitationKey: { eq: key.citationKey.toLowerCase() },
          libraryID: key.libraryID,
        },
      } satisfies Query<CitekeyRecord, 'itemID'>
      if (Preference.keyScope === 'global') delete where.where.libraryID
      delete where.where[Preference.citekeyCaseInsensitive ? 'citationKey' : 'lcCitationKey']

      for (const conflict of blink.many(this.keys, where)) {
        item = await Zotero.Items.getAsync(conflict.itemID)
        this.update(item, conflict)
      }
    }
  }

  // serialize so background stores from onRemove at all happen in order
  private async remove(keys: CitekeyRecord | CitekeyRecord[]) {
    await this.queue.add(() => this.$remove(keys))
  }

  private async $remove(keys: CitekeyRecord | CitekeyRecord[]) {
    if (Array.isArray(keys)) {
      await Zotero.DB.executeTransaction(async () => {
        let pos = 0
        const chunk = 50
        while (pos < keys.length) {
          const slice = keys.slice(pos, chunk + pos)
          if (!slice.length) break
          pos += chunk
          await Zotero.DB.queryAsync(`DELETE FROM betterbibtex.citationkey WHERE itemID IN (${ Array(slice.length).fill('?').join(',') })`, slice.map(key => key.itemID))
        }
      })
    }
    else {
      await Zotero.DB.queryTx('DELETE FROM betterbibtex.citationkey WHERE itemID = ?', [keys.itemID])
    }
  }

  private clear(ids: number[]) {
    blink.removeMany(this.keys, ids.map(itemID => ({ itemID })))
  }

  private async start(): Promise<void> {
    if (Zotero.Libraries.userLibraryID > 1) {
      await Zotero.DB.queryAsync('UPDATE betterbibtex.citationkey SET libraryID = ? WHERE libraryID IN (0, 1)', [Zotero.Libraries.userLibraryID])
    }

    await this.load()

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

    Events.keymanagerUpdate = (action, ids) => {
      // clear even for add/modify so they can update without hitting "claimed keys" in the deleted set
      this.clear(ids)

      let warn_titlecase = 0
      switch (action) {
        case 'delete':
          break

        case 'add':
        case 'modify':
          // why do deleted items keep showing up here?
          for (const item of Zotero.Items.get(ids).filter(i => !i.deleted && i.isRegularItem() && !i.isFeedItem)) {
            this.update(item)
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
          break
      }
    }

    this.started = true
  }

  public async load(): Promise<void> {
    let missing: number[]

    await Zotero.DB.executeTransaction(async () => {
      const $items = `
        WITH _items AS (
          SELECT items.itemID, items.key as itemKey, items.libraryID, extra.value AS extra
          FROM items
          LEFT JOIN itemData extraField ON extraField.itemID = items.itemID AND extraField.fieldID IN (SELECT fieldID FROM fields WHERE fieldName = 'extra')
          LEFT JOIN itemDataValues extra ON extra.valueID = extraField.valueID
          WHERE items.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND items.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
          AND items.itemID NOT IN (SELECT itemID from feedItems)
        )
      `

      await ZoteroDB.queryAsync(`${ $items } DELETE FROM betterbibtex.citationkey WHERE itemID NOT IN (SELECT itemID FROM _items)`)

      const keys: Map<number, CitekeyRecord> = new Map
      let key: CitekeyRecord
      for (key of await Zotero.DB.queryAsync('SELECT * from betterbibtex.citationkey') as CitekeyRecord[]) {
        keys.set(key.itemID, lc({ itemID: key.itemID, itemKey: key.itemKey, libraryID: key.libraryID, citationKey: key.citationKey, pinned: key.pinned }))
      }

      // fetch pinned keys to be sure
      const keyLine = /(^|\n)Citation Key\s*:\s*(.+?)(\n|$)/i
      const getKey = (extra: string) => {
        if (!extra) return ''
        const m = keyLine.exec(extra)
        return m ? m[2].trim() : ''
      }

      let pinned: string
      for (const item of (await ZoteroDB.queryAsync(`${ $items } SELECT itemID, itemKey, libraryID, extra FROM _items`))) {
        pinned = getKey(item.extra)
        if (pinned) {
          keys.set(item.itemID, lc({ itemID: item.itemID, itemKey: item.itemKey, libraryID: item.libraryID, citationKey: pinned, pinned: true }))
        }
        else if (key = keys.get(item.itemID)) {
          key.pinned = false
        }
      }

      blink.insertMany(this.keys, [...keys.values()])

      missing = await ZoteroDB.columnQueryAsync(`${ $items } SELECT itemID FROM _items WHERE itemID NOT IN (SELECT itemID from betterbibtex.citationkey)`)
    })

    const notify = async (ids: number[]) => {
      if (!Cache.ready) {
        log.error('Cache touch failed for', ids, 'cache not ready')
        return
      }

      try {
        await Cache.touch(ids)
      }
      catch (err) {
        log.error('Cache touch failed for', ids, err)
      }
      finally {
        void Events.emit('items-changed', { items: Zotero.Items.get(ids), action: 'modify', reason: 'key-refresh' })
      }
      // messes with focus-on-tab
      // if (action === 'modify' || action === 'add') Zotero.Notifier.trigger('refresh', 'item', itemIDs)
    }

    this.unwatch = [
      this.keys[BlinkKey].events.onInsert.register(changes => {
        for (const change of changes) {
          void this.store(change.entity).catch(err => log.error('keymanager.insert', err))
        }
        void notify(changes.map(change => change.entity.itemID))
      }),
      this.keys[BlinkKey].events.onUpdate.register(changes => {
        for (const change of changes) {
          void this.store(change.newEntity).catch(err => log.error('keymanager.update', err))
        }
        void notify(changes.map(change => change.newEntity.itemID))
      }),
      this.keys[BlinkKey].events.onRemove.register(changes => {
        for (const change of changes) {
          void this.remove(change.entity).catch(err => log.error('keymanager.remove', err))
        }
        void notify(changes.map(change => change.entity.itemID))
      }),
      this.keys[BlinkKey].events.onClear.register(_changes => {
        log.error('error: do not clear the keys database!')
        throw new Error('do not clear the keys database!')
      }),
    ]

    if (missing.length) {
      // generate keys for entries that don't have them yet
      const progress = new Progress(missing.length, 'Assigning citation keys')
      for (const itemID of missing) {
        try {
          this.update(await getItemsAsync(itemID))
        }
        catch (err) {
          log.error('KeyManager.rescan: update failed:', err.message || `${ err }`, err.stack)
        }

        progress.next()
      }

      progress.done()
    }
  }

  public update(item: Zotero.Item, current?: CitekeyRecord): string {
    if (item.isFeedItem || !item.isRegularItem()) return null

    current = current || blink.first(this.keys, byItemID(item.id))

    const proposed = this.propose(item)

    if (current && (current.pinned || !this.autopin.enabled) && (current.pinned === proposed.pinned) && (current.citationKey === proposed.citationKey)) return current.citationKey

    if (current) {
      current.pinned = proposed.pinned
      current.citationKey = proposed.citationKey
      blink.update(this.keys, lc(current))
    }
    else {
      blink.insert(this.keys, lc({ itemID: item.id, libraryID: item.libraryID, itemKey: item.key, pinned: proposed.pinned, citationKey: proposed.citationKey }))
    }

    return proposed.citationKey
  }

  public get(itemID: number): Partial<CitekeyRecord> & { retry?: boolean } {
    // I cannot prevent being called before the init is done because Zotero unlocks the UI *way* before I'm getting the
    // go-ahead to *start* my init.
    if (!this.keys || !this.started) return { citationKey: '', pinned: false, retry: true }

    const key = blink.first(this.keys, byItemID(itemID))
    if (key) return key
    return { citationKey: '', pinned: false, retry: true }
  }

  public first(query: Query<CitekeyRecord, 'itemID'>): CitekeyRecord {
    return blink.first(this.keys, query)
  }

  public find(query: Query<CitekeyRecord, 'itemID'>): CitekeyRecord[] {
    return blink.many(this.keys, query)
  }

  public all(): CitekeyRecord[] {
    return blink.many(this.keys)
  }

  // mem is for https://github.com/retorquere/zotero-better-bibtex/issues/2926
  public propose(item: Zotero.Item, mem?: Set<string>): Partial<CitekeyRecord> {
    let citationKey: string = Extra.get(item.getField('extra'), 'zotero', { citationKey: true }).extraFields.citationKey

    if (citationKey) return { citationKey, pinned: true }

    citationKey = Formatter.format(item)

    const where: { citationKey?: string; lcCitationKey?: string; libraryID?: number } = {}
    if (Preference.keyScope !== 'global') where.libraryID = item.libraryID
    const ci = Preference.citekeyCaseInsensitive

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

      let proposal: string
      if (ci) {
        where.lcCitationKey = proposal = postfixed.toLowerCase()
      }
      else {
        where.citationKey = proposal = postfixed
      }

      if (blink.many(this.keys, { where }).filter(i => i.itemID !== item.id).length) continue
      if (mem) {
        if (mem.has(proposal)) continue
        mem.add(proposal)
      }
      return { citationKey: postfixed, pinned: false }
    }
  }

  public import(keymap: Record<string, string>): void {
    const citekeys = blink.many(this.keys, { where: { itemKey: { in: Object.keys(keymap) }}})

    for (const item of citekeys) {
      item.citationKey = keymap[item.itemKey]
    }
    blink.updateMany(this.keys, citekeys.map(lc))
    flash(`Imported ${ citekeys.length } citation keys`)
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
    for (const item of blink.many(this.keys, Preference.keyScope === 'global' ? undefined : { where: { libraryID }})) {
      if (!citekeys[item.citationKey]) citekeys[item.citationKey] = []
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
