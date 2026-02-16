import { log } from '../logger'

export async function migrate(): Promise<void> {
  const db = PathUtils.join(Zotero.DataDirectory.dir, 'better-bibtex.sqlite')
  if (!(await IOUtils.exists(db))) return

  const choice = {
    migrate: 'postpone' as 'none' | 'all' | 'pinned' | 'postpone',
    overwrite: false,
    total: 0,
    pinned: 0,
    zotero: 0,
  }
  try {
    await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtex', [ db ])
    await Zotero.DB.executeTransaction(async () => {
      let rows = await Zotero.DB.queryAsync(`
        SELECT bbt.itemID, bbt.itemKey, bbt.libraryID, bbt.citationKey, bbt.pinned
        FROM betterbibtex.citationkey bbt
        JOIN items item ON item.itemID = bbt.itemID
        WHERE item.itemID NOT IN (SELECT itemID FROM deletedItems)
          AND item.itemID NOT IN (SELECT itemID FROM feedItems)
          AND item.itemTypeID NOT IN (
            SELECT itemTypeID
            FROM itemTypes
            WHERE typeName IN ('attachment', 'note', 'annotation')
          )
      `.replace(/\n/g, ' ').trim())
      let keys: { citationKey: string; itemID: number; pinned: boolean }[] = rows.map(({ citationKey, itemID, pinned }) => ({
        itemID,
        citationKey,
        pinned: !!pinned,
      }))

      rows = await Zotero.DB.queryAsync(`
        SELECT items.itemID, ck.value AS citationKey
        FROM items
        JOIN itemData ckField ON ckField.itemID = items.itemID AND ckField.fieldID IN (SELECT fieldID FROM fields WHERE fieldName = 'citationKey')
        JOIN itemDataValues ck ON ck.valueID = ckField.valueID
        WHERE items.itemID NOT IN (SELECT itemID FROM deletedItems)
        AND items.itemTypeID NOT IN (SELECT itemTypeID FROM itemTypes WHERE typeName IN ('attachment', 'note', 'annotation'))
        AND items.itemID NOT IN (SELECT itemID from feedItems)
      `.replace(/\n/g, ' ').trim())
      for (const { itemID, citationKey } of rows) {
        if (citationKey && !keys.find(key => key.itemID === itemID && key.citationKey === citationKey)) choice.zotero += 1
      }

      if (!choice.zotero) {
        choice.migrate = 'all'
      }
      else if (keys.length) {
        choice.total = keys.length
        choice.pinned = keys.filter(key => key.pinned).length
        Zotero.getMainWindow().openDialog('chrome://zotero-better-bibtex/content/keymanager-migrate.xhtml', '', 'chrome,dialog,centerscreen,modal', choice)
        choice.migrate = choice.migrate || 'postpone'
        switch (choice.migrate) {
          case 'none':
            keys = []
            break
          case 'pinned':
            keys = keys.filter(k => k.pinned)
            break
        }
      }

      if (choice.migrate !== 'postpone') {
        for (const { itemID, citationKey } of keys) {
          const item = await Zotero.Items.getAsync(itemID)
          if (choice.overwrite || !item.getField('citationKey')) {
            item.setField('citationKey', citationKey)
            await item.save()
          }
        }
      }
    })
  }
  catch (err) {
    log.error('z8 migration error:', err, err.message)
  }

  try {
    await Zotero.DB.queryAsync("DETACH DATABASE 'betterbibtex'")
  }
  catch {}

  if (choice.migrate !== 'postpone') {
    try {
      await Zotero.File.rename(db, 'better-bibtex.migrated')
    }
    catch (err) {
      log.error('z8 migration rename error:', err, err.message)
    }
  }
}
