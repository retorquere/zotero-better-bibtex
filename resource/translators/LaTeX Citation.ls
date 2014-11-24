require 'translator.ls'

doExport = ->
  keys = []
  while item = Translator.nextItem!
    keys.push item.__citekey__

  #while collection = Zotero.nextCollection!
  #  Zotero.debug('collection: ' + collection.name)

  Zotero.write "\\#{Zotero.getHiddenPref('better-bibtex.citeCommand')}{#{keys.join(',')}}"
