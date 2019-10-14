declare const Zotero: any

import { upgradeExtra } from './upgrade'
import * as log from '../debug'

export function queryAsync(query, args?) { return Zotero.DB.queryAsync(query.replace(/[\s\n]+/g, ' ').trim(), args) }

export async function upgrade() {
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

  try {
    for (const _item of await queryAsync(query, ['%biblatex%', '%bibtex%'])) {
      const item = Zotero.Items.get(_item.itemID)
      const extra = {
        before: item.getField('extra') || '',
        after: upgradeExtra(item.getField('extra') || ''),
      }
      log.debug('upgrade', _item.itemID, extra)

      if (extra.before !== extra.after) {
        item.setField('extra', extra.after)
        await item.saveTx()
      }
    }
  } catch (err) {
    log.error('db upgrade:', err)
  }
}
