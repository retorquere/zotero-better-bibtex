require('translator.coffee')

detectImport = ->
  aux = ''
  while (str = Zotero.read(0x100000)) != false
    aux += str

  return aux.match(/\\citation{/)

doImport = ->
  aux = ''
  while (str = Zotero.read(0x100000)) != false
    aux += str

  data = {translator: Translator.label, citations: Object.create(null)}

  re = /\\citation{([^}]+)}/g
  while m = re.exec(aux)
    data.citations[m[1]] = m[1]
  data.citations = Object.keys(data.citations)
  data.citations.sort((a, b) -> a.localeCompare(b, undefined, {sensitivity: 'base'}))
  item = new Zotero.Item('journalArticle')
  item.title = Translator.label
  item.extra = JSON.stringify(data)
  item.complete()
  Translator.log('::: imported', item)
  return

