export async function getItemsAsync(ids: number[]): Promise<any[]> {
  const items = await Zotero.Items.getAsync(ids)
  await Promise.all(items.map(item => item.loadAllData()))
  return items
}

export async function getItemAsync(id: number): Promise<any> {
  const item = await Zotero.Items.getAsync(id)
  if (item) await item.loadAllData()
  return item || undefined
}
