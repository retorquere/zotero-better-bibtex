import { orchestrator } from './orchestrator'

import ETA from 'node-eta'

import { japanese } from './key-manager/japanese'
import { chinese } from './key-manager/chinese'

import { Scheduler } from './scheduler'
import { log } from './logger'
import { flash } from './flash'
import { Events, REASON_KEY_SAVE } from './events'
import { fetchAsync as fetchInspireHEP } from './inspire-hep'
import { excelColumn, sentenceCase } from './text'
import * as Extra from './extra'

import * as ZoteroDB from './db/zotero'

import { getItemsAsync } from './get-items-async'

import { Preference } from './prefs'
import { Formatter } from './key-manager/formatter'

import { Cache } from './translators/worker'

import { sprintf } from 'sprintf-js'

import * as l10n from './l10n'

import { migrate } from './key-manager/migrate'
import { readonly } from './library'
import { strcmp } from './string-compare'

export type CitekeyRecord = {
  itemID: number
  libraryID: number
  itemKey: string
  citationKey: string
}

function copy(k: CitekeyRecord): CitekeyRecord {
  return {
    itemID: k.itemID,
    libraryID: k.libraryID,
    itemKey: k.itemKey,
    citationKey: k.citationKey,
  }
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

import { Predicate, TrackedMap } from './object'

class Keys extends TrackedMap<number, CitekeyRecord> {
  #timer: ReturnType<typeof setInterval>

  public get path() {
    return PathUtils.join(Zotero.BetterBibTeX.dir, 'read-only.json')
  }

  public async load(): Promise<void> {
    try {
      if (await IOUtils.exists(this.path)) {
        for (const v of await IOUtils.readJSON(this.path)) {
          if (v.citationKey) this.set(v.itemID, copy(v))
        }
      }
    }
    catch (err) {
      log.error('failed to load read-only keys', err)
    }

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

    for (const { itemID, itemKey, libraryID, citationKey } of await Zotero.DB.queryAsync(load)) {
      this.set(itemID, copy({ itemID, itemKey, libraryID, citationKey }))
    }
    this.resetDirty()

    this.#timer = setInterval(() => { void this.save() }, 10000)
  }

  public async save(): Promise<void> {
    if (this.isDirty) {
      const mem: Map<number, boolean> = new Map
      await IOUtils.writeJSON(this.path, this.values(_ => readonly(_.libraryID, mem)))
      this.resetDirty()
    }
  }

  public async flush(): Promise<void> { // eslint-disable-line @typescript-eslint/require-await
    // await this.save()
    if (typeof this.#timer !== 'undefined') {
      clearInterval(this.#timer)
      this.#timer = undefined
    }
  }
}

export const KeyManager = new class _KeyManager {
  #keys = new Keys
  public started = false

  public autofill: Scheduler<number> = new Scheduler<number>('fillKeyAfter', 1000)

  public async pin(ids: 'selected' | number | number[]): Promise<void> {
    await this.fill(ids, { warn: true })
    ids = this.expandSelection(ids)
    await Cache.touch(ids)
    const items = (await getItemsAsync(ids)).filter(item => !item.isFeedItem && item.isRegularItem())
    for (const item of items) {
      const citationKey = item.getField('citationKey')
      if (citationKey) {
        const { extra } = Extra.citationKey(item.getField('extra'))
        item.setField('extra', `Citation Key: ${citationKey}\n${extra}`.trim())
        await item.saveTx({ skipDateModifiedUpdate: true })
        await Zotero.Promise.delay(10)
      }
    }
  }

  public async fill(ids: 'selected' | number | number[], { warn = false, replace = false, inspireHEP = false }: { warn?: boolean; replace?: boolean; inspireHEP?: boolean } = {}): Promise<void> {
    ids = this.expandSelection(ids)
    const selected: Set<number> = new Set(ids)
    await Cache.touch(ids)

    if (replace && warn && Preference.warnBulkModify && this.all(key => selected.has(key.itemID)).length > Preference.warnBulkModify) {
      const ignore = { value: false }
      const index = Services.prompt.confirmEx(
        null, // no parent
        'Better BibTeX for Zotero', // dialog title
        l10n.localize('better-bibtex_bulk-keys-confirm_warning', { treshold: Preference.warnBulkModify }),
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
      if (!this.update(item, { replace, inspireHEP: inspireHEP ? (await fetchInspireHEP(item)) || '' : undefined })) {
        this.store(item)
        continue
      }

      const citationKey = item.getField('citationKey')
      if (!citationKey) continue

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
      await item.saveTx({ skipDateModifiedUpdate: true })
      await Zotero.Promise.delay(10)
    }
  }

  constructor() {
    orchestrator.add({
      id: 'keymanager',
      description: 'keymanager',
      needs: [ 'worker' ],
      startup: async () => {
        await japanese.init()
        chinese.init()

        Formatter.update([Preference.citekeyFormat])

        await this.start()
      },
      shutdown: async () => {
        await this.#keys.flush()
      },
    })
  }

  private clear(ids: number[]) {
    for (const id of ids) {
      this.#keys.delete(id)
    }
  }

  private store(item, citationKey?: string) {
    try {
      citationKey ??= item.getField('citationKey')
    }
    catch (err) {
      log.error('could not get citation key from item:', err)
      citationKey = ''
    }

    if (citationKey) {
      this.#keys.set(item.id, copy({
        itemID: item.id,
        itemKey: item.key,
        libraryID: item.libraryID,
        citationKey,
      }))
    }
    else {
      this.#keys.delete(item.id)
    }
  }

  private async start(): Promise<void> {
    await migrate()
    await this.#keys.load()

    Events.on('preference-changed', ({ data: pref }) => {
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

    Events.on('items-removed', ({ data: { itemIDs } }) => {
      this.clear(itemIDs)
    })

    Events.on('items-changed', ({ data: { items, action, reason } }) => {
      log.info('items-changed', { reason })
      if (reason?.startsWith('parent-') || reason === 'tagged' || reason === REASON_KEY_SAVE) return

      let warn_titlecase = 0 // should not be here

      // why do deleted items keep showing up here?
      items = items.filter(item => {
        if (item.deleted || !item.isRegularItem() || item.isFeedItem) {
          this.#keys.delete(item.id)
          return false
        }
        return true
      })

      const update = (item: Zotero.Item) => {
        if (this.update(item, { replace: Preference.resetKeyOnChange })) {
          item
            .saveTx({ skipDateModifiedUpdate: true, notifierData: { [REASON_KEY_SAVE]: true } })
            .catch(err => log.error('failed to update', item.id, ':', err))
        }
        else {
          this.store(item)
        }
      }
      for (const item of items) {
        if (Preference.testing) { // race condition for key assignment otherwise
          update(item)
        }
        else {
          this.autofill.schedule(item.id, () => {
            update(item)
          })
        }
        if (!item.getField('citationKey')) this.#keys.delete(item.id)

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

  public update(item: Zotero.Item, { replace = false, inspireHEP = undefined }: { replace?: boolean; inspireHEP?: string } = {}): Zotero.Item {
    if (item.isFeedItem || !item.isRegularItem()) return null

    if (typeof inspireHEP === 'string' && !inspireHEP) return null

    const current = item.getField('citationKey')
    if (current && !replace) return null

    const proposed = inspireHEP || this.propose(item)
    if (!proposed || proposed === current) return null

    this.store(item, proposed)

    if (readonly(item.libraryID)) return null

    item.setField('citationKey', proposed)
    return item
  }

  public get(itemID: number): CitekeyRecord {
    // I cannot prevent being called before the init is done because Zotero unlocks the UI *way* before I'm getting the
    // go-ahead to *start* my init.
    return this.#keys.get(itemID)
  }

  public any(query: Predicate<CitekeyRecord>): CitekeyRecord | undefined { // eslint-disable-line id-blacklist
    for (const key of this.#keys.values()) {
      if (query(key)) return key
    }
  }

  public all(query?: Predicate<CitekeyRecord>): CitekeyRecord[] {
    if (!query) return this.#keys.values()

    return this.#keys.values().filter(query)
  }

  // mem is for https://github.com/retorquere/zotero-better-bibtex/issues/2926
  public propose(item: Zotero.Item, mem?: Set<string>): string {
    const citationKey = Formatter.format(item)

    const caseInsensitive = Preference.citekeyCaseInsensitive
    const keyscopeGlobal = Preference.keyScope === 'global'
    const libraryID = item.libraryID
    const itemID = item.id

    const different = strcmp[caseInsensitive ? 'base' : 'variant']

    const seen: Set<string> = new Set
    let candidate: string

    function conflict(key: CitekeyRecord): boolean {
      return (keyscopeGlobal || (key.libraryID === libraryID))
        && key.itemID !== itemID
        && !different(key.citationKey, candidate)
    }

    // eslint-disable-next-line no-constant-condition
    for (let n = Formatter.postfix.offset; true; n += 1) {
      candidate = citationKey.replace(Formatter.postfix.marker, () => {
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

      if (this.any(conflict)) continue
      if (mem) {
        if (mem.has(candidate)) continue
        mem.add(candidate)
      }
      return candidate
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
    for (const item of this.all(key => Preference.keyScope === 'global' || key.libraryID === libraryID)) {
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

      await item.saveTx({ skipDateModifiedUpdate: true })
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
