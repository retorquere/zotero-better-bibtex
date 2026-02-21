import { log } from '../logger'
import { getItemAsync } from '../get-items-async'
import { flash } from '../flash'
import { citationKey as extract } from '../extra'

type StoredKey = {
  citationKey: string
  itemID: number
  pinned: boolean
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

export async function migrate(): Promise<void> {
  const { sqlite } = await databases()
  if (!sqlite) return

  const choice = {
    migrate: 'postpone' as 'none' | 'all' | 'pinned' | 'postpone',
    overwrite: false,
    dynamic: false,
    total: 0,
    pinned: 0,
    zotero: 0,
  }
  try {
    const conn = new Zotero.DBConnection('better-bibtex')
    let bbt: StoredKey[] = (await conn.queryAsync('SELECT itemID, citationKey, pinned FROM citationkey')) as StoredKey[]
    await conn.closeDatabase(true)

    await Zotero.DB.executeTransaction(async () => {
      const itemIDs: number[] = await Zotero.DB.columnQueryAsync(`
        SELECT item.itemID
        FROM items item
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND item.itemID NOT IN (SELECT itemID FROM feedItems)
          AND item.itemTypeID NOT IN (
            SELECT itemTypeID
            FROM itemTypes
            WHERE typeName IN ('attachment', 'note', 'annotation')
          )
      `.replace(/\n/g, ' ').trim())

      bbt = bbt.filter(key => itemIDs.includes(key.itemID))

      choice.total = bbt.length
      choice.pinned = bbt.filter(key => key.pinned).length

      const zotero: StoredKey[] = (await Zotero.DB.queryAsync(`
        SELECT items.itemID, ck.value AS citationKey
        FROM items
        JOIN itemData ckField ON ckField.itemID = items.itemID AND ckField.fieldID IN (SELECT fieldID FROM fields WHERE fieldName = 'citationKey')
        JOIN itemDataValues ck ON ck.valueID = ckField.valueID
        WHERE items.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND items.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
          AND items.itemID NOT IN (SELECT itemID from feedItems)
          AND COALESCE(ck.value, '') <> ''
      `.replace(/\n/g, ' ').trim())) as StoredKey[]

      for (const { itemID, citationKey } of zotero) {
        if (citationKey && !bbt.find(key => key.itemID === itemID && key.citationKey === citationKey)) choice.zotero += 1
      }

      if (!choice.zotero) {
        choice.migrate = 'all'
      }
      else if (bbt.length) {
        Zotero.getMainWindow().openDialog('chrome://zotero-better-bibtex/content/keymanager-migrate.xhtml', '', 'chrome,dialog,centerscreen,modal', choice)
        choice.migrate = choice.migrate || 'postpone'
        switch (choice.migrate) {
          case 'none':
            bbt = []
            break
          case 'pinned':
            bbt = bbt.filter(k => k.pinned)
            break
        }
      }

      log.info('key manager migrate:', choice)
      const skipped: Set<string> = new Set
      if (choice.migrate !== 'postpone') {
        flash(`Migrating ${bbt.length} citation keys`)
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
          else {
            skipped.add(item.getField('citationKey'))
          }
        }
        if (skipped.size) log.info(`migrate skipped ${JSON.stringify([...skipped].sort())}`)

        Zotero.Prefs.set('translators.better-bibtex.autoExport.autoPinOverwrite', !!choice.dynamic)
      }
    })
  }
  catch (err) {
    log.error('citation key migration error:', err, err.message)
  }

  try {
    await Zotero.DB.queryAsync("DETACH DATABASE 'betterbibtex'")
  }
  catch (err) {
    log.error('citation key migration error: could not detach:', err, err.message)
  }

  if (choice.migrate !== 'postpone') {
    try {
      const renamed = await Zotero.File.rename(sqlite, 'better-bibtex.migrated', { unique: true })
      if (renamed) {
        log.info('citation key migration error: migration finished and database renamed to', renamed)
      }
      else {
        log.error('citation key migration error: migration finished but database not renamed')
      }
    }
    catch (err) {
      log.error('citation key migration error: migration rename error:', err, err.message)
    }
  }
}

export async function canMigrate(): Promise<boolean> {
  const { sqlite, migrated } = await databases()
  return !(!migrated && !sqlite)
}

export async function remigrate(): Promise<boolean> {
  if (!Zotero.Debug.storing) Zotero.Debug.setStore(true)

  const { sqlite, migrated } = await databases()
  if (!migrated && !sqlite) {
    flash('Re-migrate failed: no Better BibTeX database present')
    return
  }

  if (!sqlite) {
    const renamed = await Zotero.File.rename(migrated, 'better-bibtex.sqlite')
    if (!renamed) {
      flash(`Re-migrate failed: could not rename ${JSON.stringify(migrated)} to ${JSON.stringify(sqlite)}`)
      return
    }
  }

  await migrate()
}
