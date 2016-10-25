Components.utils.import("resource://zotero/config.js")

if !ZoteroPane_Local.BetterBibTeX
  ZoteroPane_Local.BetterBibTeX = {
    serverURL: (extension) ->
      collectionsView = Zotero.getActiveZoteroPane()?.collectionsView
      itemGroup = collectionsView?._getItemAtRow(collectionsView.selection?.currentIndex)
      return unless itemGroup

      try
        serverPort = Zotero.Prefs.get('httpServer.port')
      catch err
        return

      if itemGroup.isCollection()
        collection = collectionsView.getSelectedCollection()
        url = "collection?/#{collection.libraryID || 0}/#{collection.key + extension}"

        path = [encodeURIComponent(collection.name)]
        while collection.parent
          collection = Zotero.Collections.get(collection.parent)
          path.unshift(encodeURIComponent(collection.name))
        path = "collection?/#{collection.libraryID || 0}/" + path.join('/') + extension

      if itemGroup.isLibrary(true)
        libid = collectionsView.getSelectedLibraryID()
        url = if libid then "library?/#{libid}/library#{extension}" else "library?library#{extension}"
        path = null
      if not url then return

      root = "http://localhost:#{serverPort}/better-bibtex/"
      url = root + url
      url += "\nor\n#{root}#{path}" if path
      return url
  }

  ### monkey-patch buildCollectionContextMenu to add group library export ###
  ZoteroPane_Local.buildCollectionContextMenu = ((original) ->
    return ->
      itemGroup = @collectionsView._getItemAtRow(@collectionsView.selection.currentIndex)

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
      exporter.items = {objectType: 'saved-search', search, items: ZoteroPane_Local.getSortedItems()}
      throw new Error('No items to save') unless exporter.items.items
      exporter.name = search.name
      exporter.save()
    )(Zotero_File_Interface.exportCollection)
