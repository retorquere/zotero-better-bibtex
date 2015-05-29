require('translator.coffee')

scrub = (item) ->
  delete item.__citekey__
  delete item.libraryID
  delete item.key
  delete item.uniqueFields
  delete item.dateAdded
  delete item.dateModified
  delete item.uri
  delete item.multi
  delete item.attachmentIDs

  for creator in item.creators or []
    delete creator.creatorID
    delete creator.multi

  item.attachments = ({ path: attachment.localPath, title: attachment.title, mimeType: attachment.mimeType, url: attachment.url } for attachment in item.attachments || [])
  item.notes = (note.note.trim() for note in item.notes || [])

  item.tags = (tag.tag for tag in item.tags || [])
  item.tags.sort()

  for own attr, val of item
    continue if typeof val is 'number'
    continue if Array.isArray(val) and val.length != 0

    switch typeof val
      when 'string'
        delete item[attr] if val.trim() == ''
      when 'undefined'
        delete item[attr]

  return item

detectImport = ->
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str

  try
    data = JSON.parse(json)
  catch e
    Translator.log(e)
    return false

  return data?.config?.id == Translator.header.translatorID && data.items

doImport = ->
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str

  data = JSON.parse(json)

  for i in data.items
    item = new Zotero.Item()
    for own prop, value of i
      item[prop] = value
    for att in item.attachments || []
      delete att.path if att.url
    item.complete()

doExport = ->
  Translator.initialize()
  data = {
    config: {
      id: Translator.header.translatorID
      label: Translator.header.label
      release: Translator.release
      preferences: {}
      options: {}
    }
    keymanager: Zotero.BetterBibTeX.keymanager.cache()
    collections: Translator.collections()
    items: []
  }

  for pref in ['citekeyFormat', 'skipFields', 'usePrefix', 'preserveCaps', 'fancyURLs', 'langID', 'attachmentRelativePath', 'autoAbbrev',
               'autoAbbrevStyle', 'unicode', 'pinCitekeys', 'rawImports', 'DOIandURL', 'attachmentsNoMetadata']
    data.config.preferences[pref] = Zotero.getHiddenPref("better-bibtex.#{pref}")
  for option in ['useJournalAbbreviation', 'exportCharset', 'exportFileData', 'exportNotes', 'preserveBibTeXVariables']
    data.config.options[option] = Zotero.getOption(option)

  while item = Zotero.nextItem()
    data.items.push(scrub(item))
  data.cache = Zotero.BetterBibTeX.cache.dump((item.itemID for item in data.items))
  Zotero.write(JSON.stringify(data, null, '  '))
  return
