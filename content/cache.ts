import { serializer } from './item-export-format'
import { getItemsAsync } from './get-items-async'
import { Preference } from './prefs'
import { Cache } from './translators/worker'
import { CacheTouch, Events } from './events'

const serializeWhenIdle = new Set<number>

function serializable(ids: number[]): Zotero.Item[] {
  return Zotero.Items.get(ids).filter(item => !item.deleted && !item.isAnnotation() && !item.isFeedItem && (item.isRegularItem() || item.isNote() || item.isAttachment()))
}

async function fill(items: Zotero.Item[]): Promise<void> {
  for (let offset = 0; offset < items.length; offset += 10) {
    await Cache.Serialized.fill(await serializer.serialize(items.slice(offset, offset + 10)))
  }
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
        if (items.length) await fill(items)
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
    if (action !== 'delete') {
      for (const itemID of touched) serializeWhenIdle.add(itemID)
    }
  }

  await Cache.updated()
}

export async function fillTouched(): Promise<void> {
  while (Events.idle['cache-purge'] === 'idle' && serializeWhenIdle.size) {
    const itemIDs = [...serializeWhenIdle].slice(0, 10)
    for (const itemID of itemIDs) serializeWhenIdle.delete(itemID)

    const items = serializable(itemIDs)
    const serialized = items.length ? await serializer.serialize(items) : []
    if (Events.idle['cache-purge'] !== 'idle') {
      for (const itemID of itemIDs) serializeWhenIdle.add(itemID)
      break
    }
    if (serialized.length) await Cache.Serialized.fill(serialized)
  }
}

export function startup(): void {
  Events.cacheTouch = touch
}
