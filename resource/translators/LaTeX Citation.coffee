require('translator.coffee')

doExport = ->
  keys = []
  while item = Translator.nextItem()
    keys.push(item.__citekey__)

  #while collection = Zotero.nextCollection()
  #  Translator.log('collection: ' + collection.name)

  Zotero.write("\\#{Zotero.getHiddenPref('better-bibtex.citeCommand')}{#{keys.join(',')}}")
  return
