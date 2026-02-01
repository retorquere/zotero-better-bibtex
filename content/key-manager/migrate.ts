import { log } from '../logger'

export async function migrate() {
  const db = PathUtils.join(Zotero.DataDirectory.dir, 'better-bibtex.sqlite')
  if (!(await File.exists(path))) return

  try {
    await Zotero.DB.queryAsync('ATTACH DATABASE ? AS betterbibtex', [ db ])
    const q =  `
      SELECT bbt.itemID, bbt.itemKey, bbt.libraryID, bbt.citationKey, bbt.pinned
      FROM betterbibtex.citationkey bbt
      WHERE bbt.itemID NOT IN (SELECT itemID FROM deletedItems)
        AND item.itemID NOT IN (SELECT itemID FROM feedItems)
        AND item.itemTypeID NOT IN (
          SELECT itemTypeID
          FROM itemTypes
          WHERE typeName IN ('attachment', 'note', 'annotation')
    `.replace(/\n/g, ' ')

    await Zotero.DB.executeTransaction(async () => {
      let keys: { citationKey: string, itemID: number, pinned: boolean }[] = []
      for (const { citationKey, itemID, pinned } of (await Zotero.DB.queryAsync(q))) {
        keys.push({ citationKey, itemID, pinned: !!pinned })
      }

      if (keys.length) {
        const migrate = {
          keys: 'postpone' as 'none' | 'all' | 'pinned' | 'postpone',
          overwrite: false
          total: keys.length,
          pinned: keys.filter(k => k.pinned).length,
        }
        Zotero.getMainWindow().openDialog('chrome://zotero-better-bibtex/content/migrate.xhtml', '', 'chrome,dialog,centerscreen,modal', migrate)
        switch (migrate.keys) {
          case 'forget':
            keys = []
            break
          case 'pinned':
            keys = keys.filter(k => k.pinned)
            break
        }

        if (migrate.keys !== 'postpone') {
          for (const { itemID, citationKey } of keys) {
            const item = await Zotero.Items.getAsync(itemID)
            if (choice.overwrite || !item.getField('citationKey')) {
              item.setField('citationKey', citationKey)
              await item.save()
            }
          }
        }
      }
    })
  }
  catch (err) {
    log.error('migration error:', err)
  }
  finally {
    try {
      await Zotero.DB.queryAsync("DETACH DATABASE 'betterbibtex'")
      if (migrate.action !== 'postpone') await Zotero.File.rename(db, 'better-bibtex.migrated')
    }
    catch {}
  }
}
