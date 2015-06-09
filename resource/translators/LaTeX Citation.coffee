doExport = ->
  keys = []
  while item = Translator.nextItem()
    keys.push(item.__citekey__)

  cmd = "#{Zotero.getHiddenPref('better-bibtex.citeCommand')}".trim()
  if cmd == ''
    Zotero.write(keys.join(','))
  else
    Zotero.write("\\#{cmd}{#{keys.join(',')}}")
  return
