require('translator.coffee')

doExport = ->
  keys = []
  while item = Translator.nextItem()
    keys.push("@#{item.__citekey__}")
  Zotero.write("[#{keys.join('; ')}]")
  return
