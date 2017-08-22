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

BetterBibTeX.detectImport = ->
  debug('BetterBibTeX JSON.detect: start')
  json = ''
  while (str = Zotero.read(0x100000)) != false
    json += str
    return false if json[0] != '{'

  # a failure to parse will throw an error which a) is actually logged, and b) will count as "false"
  data = JSON.parse(json)

  throw "ID mismatch: got #{data.config?.id}, expected #{BetterBibTeX.header.translatorID}" unless data.config?.id == BetterBibTeX.header.translatorID
  throw 'No items' unless data.items?.length
  return true

BetterBibTeX.doImport = ->
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

  collections = Collections(data.collections || [])
  for key, collection of collections
    collection.imported = new Zotero.Collection()
    collection.imported.type = 'collection'
    collection.imported.name = collection.name
    collection.imported.children = ({type: 'item', id: key} for key in collection.items)
  for key, collection of collections
    collection.imported.children = collection.imported.children.concat((collections[coll.key].imported for coll in collection.collections))
  for key, collection of collections
    continue unless collection.root
    collection.imported.complete()

  return

BetterBibTeX.doExport = ->
  data = {
    config: {
      id: BetterBibTeX.header.translatorID
      label: BetterBibTeX.header.label
      release: Zotero.BetterBibTeX.version()
      preferences: BetterBibTeX.preferences
      options: BetterBibTeX.options
    }
    collections: []
    items: []
  }

  ### just export whatever Zotero gives us and worry about cleanup on import ###
  while item = Zotero.nextItem()
    data.items.push(item)

  if BetterBibTeX.header.configOptions?.getCollections && Zotero.nextCollection
    while collection = Zotero.nextCollection()
      data.collections.push(collection)

  Zotero.write(JSON.stringify(data, null, '  '))
  return
