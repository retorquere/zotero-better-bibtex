importFile = (file, createNewCollection) ->
  if createNewCollection is `undefined`
    createNewCollection = true
  else unless createNewCollection
    try
      ZoteroPane.collectionsView.selectLibrary null  unless ZoteroPane.collectionsView.editable
  translation = new Zotero.Translate.Import()
  unless file
    translators = translation.getTranslators()
    nsIFilePicker = Components.interfaces.nsIFilePicker
    fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker)
    fp.init window, Zotero.getString("fileInterface.import"), nsIFilePicker.modeOpen
    fp.appendFilters nsIFilePicker.filterAll
    for i of translators
      fp.appendFilter translators[i].label, "*." + translators[i].target
    rv = fp.show()
    return false  if rv isnt nsIFilePicker.returnOK and rv isnt nsIFilePicker.returnReplace
    file = fp.file
  translation.setLocation file
  
  # get translators again, bc now we can check against the file
  translation.setHandler "translators", (obj, item) ->
    _importTranslatorsAvailable obj, item, createNewCollection
    return

  translators = translation.getTranslators()
  return
