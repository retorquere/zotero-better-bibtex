if !ZoteroPane_Local.BetterBibTeX
  ZoteroPane_Local.BetterBibTeX = true

  # monkey-patch buildCollectionContextMenu to add group library export
  ZoteroPane_Local.buildCollectionContextMenu = ((original) ->
    return ->
      itemGroup = @collectionsView._getItemAtRow(@collectionsView.selection.currentIndex)

      menuItem = @document.getElementById('zotero-better-bibtex-export-group')
      menuItem.setAttribute('disabled', false)
      menuItem.setAttribute('hidden', !itemGroup.isGroup())

      for id in ['zotero-better-bibtex-show-export-url', 'zotero-better-bibtex-report-errors']
        menuItem = @document.getElementById(id)
        menuItem.setAttribute('disabled', false)
        menuItem.setAttribute('hidden', !(itemGroup.isLibrary(true) || itemGroup.isCollection()))

      menuItem = @document.getElementById('zotero-better-bibtex-collectionmenu-separator')
      menuItem.setAttribute('hidden', !(itemGroup.isLibrary(true) || itemGroup.isCollection()))

      return original.apply(@, arguments)
    )(ZoteroPane_Local.buildCollectionContextMenu)

if !Zotero_File_Interface.BetterBibTeX
  Zotero_File_Interface.BetterBibTeX = true

  Zotero_File_Interface.exportCollection = ((original) ->
    return ->
      return original.apply(@, arguments) if ZoteroPane_Local.getSelectedCollection() || !(search = ZoteroPane_Local.getSelectedSavedSearch())

      exporter = new Zotero_File_Exporter()
      exporter.collection = {objectType: 'saved-search', search, items: ZoteroPane_Local.getSortedItems()}
      throw new Error('No items to save') unless exporter.collection.items
      exporter.name = search.name
      exporter.save()
    )(Zotero_File_Interface.exportCollection)
