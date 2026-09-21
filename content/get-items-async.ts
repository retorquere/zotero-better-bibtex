export async function getItemsAsync(ids: number[]): Promise<any[]> {
  const items = await Zotero.Items.getAsync(ids)
  await Zotero.Items.loadDataTypes(items)
  return items
}

export async function getItemAsync(id: number): Promise<any> {
  const item = await Zotero.Items.getAsync(id)
  await Zotero.Items.loadDataTypes([item])
  return item || undefined
}
