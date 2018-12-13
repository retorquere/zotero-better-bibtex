declare const Zotero: any
declare const Zotero_File_Interface: any
declare const Components: any

import { AutoExport } from './auto-export'
import { timeout } from './timeout'
import * as ZoteroDB from './db/zotero'
import * as log from './debug'
import { KeyManager } from './key-manager'
import { Preferences as Prefs } from './prefs'
import { Translators } from './translators'
import { Formatter as CAYWFormatter } from './cayw/formatter'
import { getItemsAsync } from './get-items-async'
import { AUXScanner } from './aux-scanner'

const pref_defaults = require('../gen/preferences/defaults.json')

export = Prefs.get('testing') && {
  async reset() {
    let collections
    log.debug('TestSupport.reset: start')
    const prefix = 'translators.better-bibtex.'
    for (const [pref, value] of Object.entries(pref_defaults)) {
      if (['debug', 'testing'].includes(pref)) continue
      Zotero.Prefs.set(prefix + pref, value)
    }

    Zotero.Prefs.set(prefix + 'debug', true)
    Zotero.Prefs.set(prefix + 'testing', true)
    log.debug('TestSupport.reset: preferences reset')

    log.debug('TestSupport.reset: removing collections')
    // remove collections before items to work around https://github.com/zotero/zotero/issues/1317 and https://github.com/zotero/zotero/issues/1314
    // ^%&^%@#&^% you can't just loop and erase because subcollections are also deleted
    while ((collections = Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID, true) || []).length) {
      await collections[0].eraseTx()
    }

    // Zotero DB access is *really* slow and times out even with chunked transactions. 3.5k references take ~ 50 seconds
    // to delete.
    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    while (items.length) {
      // tslint:disable-next-line:no-magic-numbers
      const chunk = items.splice(0, 100)
      log.debug('TestSupport.reset: deleting', chunk.length, 'items')
      await Zotero.Items.erase(chunk)
    }

    log.debug('TestSupport.reset: empty trash')
    await Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)

    AutoExport.db.findAndRemove({ type: { $ne: '' } })

    log.debug('TestSupport.reset: done')

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    if (items.length !== 0) throw new Error('library not empty after reset')
  },

  async importFile(source, createNewCollection, preferences) {
    preferences = preferences || {}

    if (Object.keys(preferences).length) {
      log.debug(`importing references and preferences from ${source}`)
      for (let [pref, value] of Object.entries(preferences)) {
        log.debug(`${typeof pref_defaults[pref] === 'undefined' ? 'not ' : ''}setting preference ${pref} to ${value}`)
        if (typeof pref_defaults[pref] === 'undefined') throw new Error(`Unsupported preference ${pref} in test case`)
        if (Array.isArray(value)) value = value.join(',')
        Zotero.Prefs.set(`translators.better-bibtex.${pref}`, value)
      }
    } else {
      log.debug(`importing references from ${source}`)
    }

    const file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile)
    file.initWithPath(source)

    let items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const before = items.length

    log.debug(`starting import at ${new Date()}`)

    if (source.endsWith('.aux')) {
      await AUXScanner.scan(file)
      // for some reason, the imported collection shows up as empty right after the import >:
      await timeout(1500) // tslint:disable-line:no-magic-numbers
    } else {
      await Zotero_File_Interface.importFile(file, !!createNewCollection)
    }
    log.debug(`import finished at ${new Date()}`)

    items = await Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true)
    const after = items.length

    log.debug(`import found ${after - before} items`)
    return (after - before)
  },

  async exportLibrary(translatorID, displayOptions, path, collection) {
    let items
    log.debug('TestSupport.exportLibrary', { translatorID, displayOptions, path, collection })
    if (collection) {
      let name = collection
      if (name[0] === '/') name = name.substring(1) // don't do full path parsing right now
      for (collection of Zotero.Collections.getByLibrary(Zotero.Libraries.userLibraryID)) {
        if (collection.name === name) items = { collection: collection.id }
      }
      log.debug('TestSupport.exportLibrary', { name, items })
      if (!items) throw new Error(`Collection '${name}' not found`)
    } else {
      items = null
    }
    return await Translators.translate(translatorID, displayOptions, items, path)
  },

  async select(field, value) {
    const s = new Zotero.Search()
    s.addCondition('field', 'is', value) // field not used?
    const ids = await s.search()
    if (!ids || !ids.length) throw new Error(`No item found with ${field}  = '${value}'`)

    const id = ids[0]

    // tslint:disable-next-line:no-magic-numbers
    for (let attempt = 1; attempt <= 10; attempt++) {
      log.debug(`select ${field} = '${value}' = ${id}, attempt ${attempt}`)
      const zoteroPane = Zotero.getActiveZoteroPane()
      zoteroPane.show()
      if (await zoteroPane.selectItem(id, true)) continue

      let selected
      try {
        selected = zoteroPane.getSelectedItems(true)
      } catch (err) { // zoteroPane.getSelectedItems() doesn't test whether there's a selection and errors out if not
        log.error('Could not get selected items:', err)
        selected = []
      }

      log.debug('selected items = ', selected)
      if ((selected.length === 1) && (id === selected[0])) return id
      log.debug(`select: expected ${id}, got ${selected}`)
    }
    throw new Error(`failed to select ${id}`)
  },

  async find(title) {
    const s = new Zotero.Search()
    s.addCondition('field', 'is', title) // field not used?
    const ids = await s.search()
    if (!ids || ids.length !== 1) throw new Error(`No item found with title '${title}'`)

    return ids[0]
  },

  async pick(format, citations) {
    for (const citation of citations) {
      citation.citekey = KeyManager.get(citation.id).citekey
      citation.uri = Zotero.URI.getItemURI(await getItemsAsync(citation.id))
    }
    return await CAYWFormatter[format](citations, {})
  },

  async pinCiteKey(itemID, action) {
    let ids
    if (typeof itemID === 'number') {
      ids = [itemID]
    } else {
      ids = []
      const items = await ZoteroDB.queryAsync(`
        SELECT item.itemID
        FROM items item
        JOIN itemTypes it ON item.itemTypeID = it.itemTypeID AND it.typeName NOT IN ('note', 'attachment')
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
      `)

      for (const item of items) {
        ids.push(item.itemID)
      }
    }

    if (!ids.length) throw new Error('Nothing to do')

    for (itemID of ids) {
      switch (action) {
        case 'pin':
          await KeyManager.pin(itemID)
          break
        case 'unpin':
          await KeyManager.unpin(itemID)
          break
        case 'refresh':
          await KeyManager.refresh(itemID)
          break
        default:
          throw new Error(`TestSupport.pinCiteKey: unsupported action ${action}`)
      }
    }
  },
}
