scrub = (item) ->
  delete item.__citekey__
  delete item.libraryID
  delete item.key
  delete item.uniqueFields
  delete item.dateAdded
  delete item.dateModified
  delete item.uri
  delete item.attachmentIDs

  delete item.collections

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

  citekeys = Zotero.BetterBibTeX.keymanager.alternates(item)
  switch
    when !citekeys or citekeys.length == 0 then
    when citekeys.length == 1
      item.__citekey__ = citekeys[0]
    else
      item.__citekeys__ = citekeys

  return item

detectImport = ->
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str

  try
    data = JSON.parse(json)
  catch e
    Translator.log('BetterBibTeX JSON.detect failed:', e)
    return false

  match = data?.config?.id == Translator.header.translatorID && data.items
  Translator.log('BetterBibTeX JSON.detect:', match)
  return match

doImport = ->
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str

  data = JSON.parse(json)

  for i in data.items
    ### works around https://github.com/Juris-M/zotero/issues/20 ###
    delete i.multi.main if i.multi

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
      preferences: Translator.preferences
      options: Translator.options
    }
    collections: Translator.collections
    items: []
    cache: {
      # no idea why this doesn't work anymore. The security manager won't let me call toJSON on this anymore
      # activity: Zotero.BetterBibTeX.cache.stats()
    }
  }

  while item = Zotero.nextItem()
    data.items.push(scrub(item))

  if Zotero.getHiddenPref('better-bibtex.debug')
    data.keymanager = Zotero.BetterBibTeX.keymanager.cache()
    data.cache.items = Zotero.BetterBibTeX.cache.dump((item.itemID for item in data.items))

  Zotero.write(JSON.stringify(data, null, '  '))
  return
