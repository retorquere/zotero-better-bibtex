require('translator.coffee')

doExport = ->
  keys = []
  while item = Translator.nextItem()
    keys.push(item.__citekey__)

  cmd = "#{Zotero.getHiddenPref('better-bibtex.citeCommand')}".strip()
  if cmd == ''
    Zotero.write(keys.join(','))
  else
    Zotero.write("\\#{Zotero.getHiddenPref('better-bibtex.citeCommand')}{#{keys.join(',')}}")
  return
