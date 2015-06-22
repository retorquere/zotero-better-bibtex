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
      return original.apply(@, arguments)
    )(Zotero_File_Interface.exportCollection)

  Zotero_File_Exporter::
