export async function getItemsAsync(ids: number | number[]): Promise<any> {
  if (Array.isArray(ids)) {
    const items = await Zotero.Items.getAsync(ids)
    // eslint-disable-next-line  @typescript-eslint/no-unsafe-return
    await Promise.all(items.map(item => item.loadAllData()))
    return items
  }
  else {
    const item = await Zotero.Items.getAsync(ids)
    await item.loadAllData()
    return item
  }
}
