export async function getItemsAsync(ids: number | number[]): Promise<any> {
  if (Array.isArray(ids)) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await Promise.all(await Zotero.Items.getAsync(ids).map(item => item.loadAllData()))
  }
  else {
    const item = await Zotero.Items.getAsync(ids)
    await item.loadAllData()
    return item
  }
}
