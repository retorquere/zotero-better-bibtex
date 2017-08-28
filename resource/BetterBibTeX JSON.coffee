debug = require('./lib/debug.coffee')
Collections = require('./lib/collections.coffee')

###
scrub = (item) ->
  delete item.libraryID
  delete item.key
  delete item.uniqueFields
  delete item.dateAdded
  delete item.dateModified
  delete item.uri
  delete item.attachmentIDs
  delete item.relations

  delete item.collections

  item.attachments = ({
    path: attachment.localPath || undefined,
    title: attachment.title || undefined,
    url: attachment.url || undefined,
    linkMode: if typeof attachment.linkMode == 'number' then attachment.linkMode else undefined,
    contentType: attachment.contentType || undefined,
    mimeType: attachment.mimeType || undefined,
  } for attachment in item.attachments || [])

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
###

Translator.detectImport = ->
  debug('BetterBibTeX JSON.detect: start')
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str
    return false if json[0] != '{'

  # a failure to parse will throw an error which a) is actually logged, and b) will count as "false"
  data = JSON.parse(json)

  throw "ID mismatch: got #{data.config?.id}, expected #{Translator.header.translatorID}" unless data.config?.id == Translator.header.translatorID
  throw 'No items' unless data.items?.length
  return true

Translator.doImport = ->
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str

  data = JSON.parse(json)

  for source in data.items
    ### works around https://github.com/Juris-M/zotero/issues/20 ###
    #delete source.multi.main if source.multi
    Zotero.BetterBibTeX.scrubFields(source)

    item = new Zotero.Item()
    Object.assign(item, source, { itemID: source.key })
    for att in item.attachments || []
      delete att.path if att.url
    item.complete()

  for key, collection of data.collections || {}
    collection.imported = new Zotero.Collection()
    collection.imported.type = 'collection'
    collection.imported.name = collection.name
    collection.imported.children = ({type: 'item', id} for id in collection.items)
  for key, collection of data.collections
    collection.imported.children = collection.imported.children.concat((data.collections[coll.key].imported for coll in collection.collections))
  for key, collection of data.collections
    continue if collection.parent
    collection.imported.complete()

  return

Translator.doExport = ->
  data = {
    config: {
      id: Translator.header.translatorID
      label: Translator.header.label
      release: Zotero.BetterBibTeX.version()
      preferences: Translator.preferences
      options: Translator.options
    }
    collections: Collections()
    items: []
  }

  while item = Zotero.nextItem()
    data.items.push(item)

  Zotero.write(JSON.stringify(data, null, '  '))
  return
