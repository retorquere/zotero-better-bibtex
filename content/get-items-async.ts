export async function getItemsAsync(ids: number | number[]): Promise<any> {
  if (Array.isArray(ids)) {
    const items = await Zotero.Items.getAsync(ids)
    await Promise.all(items.map(item => item.loadAllData()))
    return items
  }
  else {
    const item = await Zotero.Items.getAsync(ids)
    await item.loadAllData()
    return item
  }
}
