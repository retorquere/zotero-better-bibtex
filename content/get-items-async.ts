export async function getItemsAsync(ids: number | number[], selectedLibraryID?: number): Promise<any> {
  selectedLibraryID = selectedLibraryID ?? Zotero.getActiveZoteroPane().getSelectedLibraryID()

  let returnSingle: boolean
  if (Array.isArray(ids)) {
    returnSingle = false
  }
  else {
    returnSingle = true
    ids = [ids]
  }

  let items = []
  for (const item of Zotero.Items.get(ids)) {
    if (item.libraryID === selectedLibraryID) {
      items.push(item)
    }
    else {
      items.push(await Zotero.Items.getAsync(item.id))
      await items[items.length - 1].loadAllData()
    }
  }

  if (returnSingle) items = items[0]
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return items
}
