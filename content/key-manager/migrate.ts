import { log } from '../logger'
import { getItemAsync } from '../get-items-async'
import { flash } from '../flash'
import { citationKey as extract } from '../extra'
import { Preference } from '../prefs'
import { AltDebug } from '../debug-log'
import { editable as editableLibs } from '../library'
const { Sqlite } = ChromeUtils.importESModule('resource://gre/modules/Sqlite.sys.mjs')

export type StoredKey = {
  citationKey: string
  itemID: number
  itemKey: string
  libraryID: number
  pinned: boolean
}

function unpack({ citationKey, itemID, itemKey, libraryID, pinned }: StoredKey): StoredKey {
  return { citationKey, itemID, itemKey, libraryID, pinned }
}

function show(obj: Record<string, any>): string {
  const s: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v !== 'undefined') s.push(`${k}=${JSON.stringify(v)}`)
  }
  return s.join('\n')
}

type Paths = { sqlite: string | null; migrated: string | null }
async function databases(): Promise<Paths> {
  const paths: Paths = { sqlite: null, migrated: null }
  for (const ext of Object.keys(paths)) {
    const file = PathUtils.join(Zotero.DataDirectory.dir, `better-bibtex.${ext}`)
    paths[ext] = (await IOUtils.exists(file)) ? file : null
  }
  return paths
}

class Speaker {
  constructor(private verbose = false) {
  }

  say(msg: string, verbose = false) {
    log.info('migrate:', msg)
    if (verbose || this.verbose) flash('citation key migration', msg)
  }
}

export async function migrate(verbose = false): Promise<void> {
  const speaker = new Speaker(verbose)
  const readonly: StoredKey[] = []

  const { sqlite } = await databases()
  if (!sqlite) return

  const editable = editableLibs()
  const choice = {
    migrate: 'postpone' as 'none' | 'all' | 'pinned' | 'postpone',
    overwrite: false,
    dynamic: false,
    total: 0,
    pinned: 0,
    zotero: 0,
    conflicts: 0,
  }
  try {
    const db = await Sqlite.openConnection({ path: sqlite })
    let bbt: StoredKey[] = (await db.execute('SELECT itemID, itemKey, libraryID, citationKey, pinned FROM citationkey'))
      .map(row => ({
        itemID: row.getResultByName('itemID'),
        itemKey: row.getResultByName('itemKey'),
        libraryID: row.getResultByName('libraryID'),
        citationKey: row.getResultByName('citationKey'),
        pinned: row.getResultByName('pinned'),
      }))
    await db.close()
    speaker.say(`BBT keys found: ${bbt.length}`)

    await Zotero.DB.executeTransaction(async () => {
      const itemIDs: Set<number> = new Set(await Zotero.DB.columnQueryAsync(`
        SELECT item.itemID
        FROM items item
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND item.itemID NOT IN (SELECT itemID FROM feedItems)
          AND item.itemTypeID NOT IN (
            SELECT itemTypeID
            FROM itemTypes
            WHERE typeName IN ('attachment', 'note', 'annotation')
          )
      `.replace(/\n/g, ' ').trim()))

      bbt = bbt.filter(key => itemIDs.has(key.itemID))
      speaker.say(`BBT keys valid: ${bbt.length}`)

      choice.total = bbt.length
      choice.pinned = bbt.filter(key => key.pinned).length
      speaker.say(`stored: ${show({...choice, migrate: undefined })}`)

      let zotero: StoredKey[] = (await Zotero.DB.queryAsync(`
        SELECT items.itemID, items.key as itemKey, items.libraryID, ck.value AS citationKey, 0 as pinned
        FROM items
        JOIN itemData ckField ON ckField.itemID = items.itemID AND ckField.fieldID IN (SELECT fieldID FROM fields WHERE fieldName = 'citationKey')
        JOIN itemDataValues ck ON ck.valueID = ckField.valueID
        WHERE items.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND items.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
          AND items.itemID NOT IN (SELECT itemID from feedItems)
          AND COALESCE(ck.value, '') <> ''
      `.replace(/\n/g, ' ').trim())).map(unpack)
      zotero = zotero.filter(key => key.citationKey)
      choice.zotero = zotero.length

      const filtered = {
        duplicates: 0,
        new: 0,
      }
      bbt = bbt.filter(bkey => {
        if (!editable.has(bkey.libraryID)) {
          readonly.push(bkey)
          return false
        }

        const zkey = zotero.find(key => key.itemID === bkey.itemID)
        if (!zkey) {
          filtered.new += 1
          return true
        }

        if (bkey.citationKey === zkey.citationKey) {
          filtered.duplicates += 1
          return false
        }

        choice.conflicts += 1
        return true
      })
      if (readonly.length) speaker.say(`${readonly.length} keys found from a read-only library`, true)
      speaker.say(`curated: ${show({ ...choice, ...filtered, readonly: readonly.length, migrate: undefined })}`)

      if (!bbt.length) {
        choice.migrate = 'all'
        speaker.say('nothing to do')
      }
      else if (!choice.conflicts) {
        choice.migrate = 'all'
        speaker.say(`silent migration of ${bbt.length} keys`)
      }
      else {
        Zotero.getMainWindow().openDialog('chrome://zotero-better-bibtex/content/keymanager-migrate.xhtml', '', 'chrome,dialog,centerscreen,modal', choice)
        choice.migrate = choice.migrate || 'postpone'
        speaker.say(`user chose ${choice.migrate}`)
      }

      switch (choice.migrate) {
        case 'none':
          bbt = []
          break
        case 'pinned':
          bbt = bbt.filter(k => k.pinned)
          break
        case 'postpone':
          return false
      }

      Zotero.Prefs.set('translators.better-bibtex.autoExport.autoPinOverwrite', !!choice.dynamic)

      speaker.say(`migrating ${bbt.length} citation keys`, true)

      for (const { itemID, citationKey, pinned } of bbt) {
        const item = await getItemAsync(itemID)
        if (choice.overwrite || !item.getField('citationKey')) {
          item.setField('citationKey', citationKey)
          if (choice.dynamic && pinned) {
            const { extra } = extract(item.getField('extra'))
            item.setField('extra', `${extra}\nCitation Key: ${citationKey}`.trim())
          }
          await item.save({ skipDateModifiedUpdate: true, skipNotifier: !!choice.zotero })
        }
      }

      const keys = Zotero.BetterBibTeX.KeyManager.keys
      keys.findAndRemove({ itemID: { $in: readonly.map(key => key.itemID) } })
      keys.insert(readonly.map(key => ({
        itemID: key.itemID,
        libraryID: key.libraryID,
        itemKey: key.itemKey,
        citationKey: key.citationKey,
        lcCitationKey: key.citationKey.toLowerCase(),
      })))

      try {
        const renamed = await Zotero.File.rename(sqlite, 'better-bibtex.migrated', { unique: true })
        if (renamed) {
          speaker.say(`migration finished and database renamed to ${renamed}`)
        }
        else {
          speaker.say('error: migration finished but database not renamed')
        }
      }
      catch (err) {
        speaker.say(`citation key migration error: migration rename error: ${err.message}`)
      }
    })
  }
  catch (err) {
    speaker.say(`migration error: ${err.message}`)
  }
}

export async function canMigrate(): Promise<boolean> {
  const { sqlite, migrated } = await databases()
  return !(!migrated && !sqlite)
}

export async function remigrate(): Promise<boolean> {
  const speaker = new Speaker(true)
  speaker.say('remigration started')
  if (!Zotero.Debug.storing) Zotero.Debug.setStore(true)

  const { sqlite, migrated } = await databases()
  if (!migrated && !sqlite) {
    speaker.say('no re-migrate: no Better BibTeX database present')
    return
  }

  if (!sqlite) {
    const renamed = await Zotero.File.rename(migrated, 'better-bibtex.sqlite')
    if (!renamed) {
      speaker.say(`re-migrate failed: could not rename ${JSON.stringify(migrated)} to ${JSON.stringify(sqlite)}`)
      return
    }
  }

  try {
    AltDebug.on()
    await migrate(true)
    Preference.remigrate = false
    Zotero.Promise.delay(60000000).then(() => {
      AltDebug.off()
    })
    speaker.say('remigration completed')
  }
  catch (err) {
    speaker.say(`remigration failed: ${err.message}`)
  }
}
