declare const Zotero: any

import { upgradeExtra } from './upgrade'

export function queryAsync(query, args?) { return Zotero.DB.queryAsync(query.replace(/[\s\n]+/g, ' ').trim(), args) }

export async function upgrade(progress) {
  const query = `
    SELECT items.itemID, itemDataValues.value
    FROM items
    JOIN itemData on itemData.itemID = items.itemID
    JOIN fields on fields.fieldID = itemData.fieldID
    JOIN itemDataValues on itemData.valueID = itemDataValues.valueID
    WHERE
      items.itemID NOT IN (select itemID from deletedItems)
      AND fields.fieldName = 'extra'
      AND (itemDataValues.value like ? OR itemDataValues.value like ?)
  `

  await Zotero.DB.executeTransaction(async () => {
    const legacy = await queryAsync(query, ['%biblatex%', '%bibtex%'])
    const total = legacy.length
    let n = 0
    for (const _item of legacy) {
      n += 1
      const item = Zotero.Items.get(_item.itemID)
      const extra = {
        before: item.getField('extra') || '',
        after: upgradeExtra(item.getField('extra') || ''),
      }
      if ((n % 50) === 0) progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade', { n, total })) // tslint:disable-line:no-magic-numbers

      if (extra.before !== extra.after) {
        item.setField('extra', extra.after)
        await item.save()
      }
    }
  })
}
