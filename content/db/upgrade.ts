declare const Zotero: any

import * as ZoteroDB from './zotero'
import { upgradeExtra } from './upgrade-extra'
// import { getItemsAsync } from '../get-items-async'
import { DB as Cache } from './cache'
import * as log from '../debug'
import { flash } from '../flash'

export async function upgrade(progress) {
  progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade', { n: '?', total: '?' }))

  const patterns = []
  for (const prefix of ['bibtex', 'biblatexcitekey', 'biblatex', 'biblatexdata']) {
    for (const postfix of [':', '[', '*[', '{', '*{']) {
      patterns.push(`%${prefix}${postfix}%`)
    }
  }

  const query = `
    SELECT items.itemID, itemDataValues.value as extra
    FROM items
    JOIN itemData on itemData.itemID = items.itemID
    JOIN fields on fields.fieldID = itemData.fieldID
    JOIN itemDataValues on itemData.valueID = itemDataValues.valueID
    WHERE
      items.itemID NOT IN (select itemID from deletedItems)
      AND fields.fieldName = 'extra'
      AND (${patterns.map(pattern => 'itemDataValues.value like ?').join(' OR ')})
  `

  let notEditable = 0
  await Zotero.DB.executeTransaction(async () => {
    const legacy = await ZoteroDB.queryAsync(query, patterns)
    if (!legacy.length) return
    const affected = []

    const total = legacy.length
    let n = 0
    progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade', { n, total }))

    for (const item of legacy) {
      n += 1
      if ((n % 50) === 0) progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade', { n, total })) // tslint:disable-line:no-magic-numbers

      const extra = upgradeExtra(item.extra)
      if (extra !== item.extra) {
        log.debug('dbUpgrade: old=\n', item.extra)
        log.debug('dbUpgrade: new=\n', extra)

        const upgraded = await Zotero.Items.getAsync(item.itemID)

        if (!upgraded.isEditable()) {
          log.error('dbUpgrade:', item.extra, 'required upgrade, but', item.itemID, 'is not editable')
          notEditable++

        } else {
          try {
            upgraded.setField('extra', extra)
          } catch (err) {
            await upgraded.loadAllData()
            upgraded.setField('extra', extra)
          }
          await upgraded.save()
          affected.push(upgraded.id)
        }
      }
    }
    progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade', { n: total, total }))
    if (affected.length) Cache.remove(affected, 'dbUpgrade')
  })
  progress(Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade.saving'))

  if (notEditable) {
    flash(
      Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade.saving'),
      Zotero.BetterBibTeX.getString('BetterBibTeX.startup.dbUpgrade.notEditable', { n: notEditable })
    )
  }
}
