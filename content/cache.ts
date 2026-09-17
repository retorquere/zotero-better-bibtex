import { serializer } from './item-export-format'
import { getItemsAsync } from './get-items-async'
import { Preference } from './prefs'
import { Cache } from './translators/worker'
import { CacheTouch, Events } from './events'

function serializable(ids: number[]): Zotero.Item[] {
  return Zotero.Items.get(ids).filter(item => !item.deleted && !item.isAnnotation() && !item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment()))
}

export async function touch({ itemIDs, action }: CacheTouch): Promise<void> {
  const withParents: Set<number> = new Set(itemIDs)
  for (const item of await getItemsAsync(itemIDs)) {
    if (typeof item?.parentID === 'number') withParents.add(item.parentID)
  }
  const touched = [...withParents]

  await Cache.Exports.touch(touched)

  if (Preference.cacheTouch === 'fill') {
    switch (action) {
      case 'add':
      case 'modify': {
        const items = serializable(touched)
        if (items.length) await Cache.Serialized.fill(await serializer.serialize(items))
        break
      }
      case 'delete': {
        await Cache.Serialized.remove(itemIDs)
        break
      }
    }
  }
  else {
    await Cache.Serialized.touch(touched)
  }

  await Cache.updated()
}

export function startup(): void {
  Events.cacheTouch = touch
}
