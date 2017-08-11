Loki = require('./loki.coffee')
co = Zotero.Promise.coroutine

# TODO: re-enable when I figure out where I want to save to
DB = Loki('better-bibtex', { autosave: true })

DB.init = co(->
  yield new Zotero.Promise((resolve, reject) ->
    return DB.loadDatabase({}, (err) ->
      if err
        return reject(err)
      else
        return resolve(true)
    )
  )

  DB.schemaCollection('citekey', {
    indices: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        libraryID: { type: 'integer' }
        citekey: { type: 'string' }
        pinned: { coerce: 'boolean', default: false }
        extra: { coerce: 'string', default: '' }
      }
      required: [ 'itemID', 'libraryID', 'citekey', 'extra' ]
    }
  })

  DB.schemaCollection('itemToExportFormat', {
    indices: [ 'itemID', 'legacy', 'skipChildItems' ],
    schema: {
      type: 'object'
      properties: {
        itemID: { type: 'integer' }
        legacy: { coerce: 'boolean', default: false }
        skipChildItems: { coerce: 'boolean', default: false }
      }
      required: [ 'itemID', 'legacy', 'skipChildItems' ]
    }
  })

  ###
  DB.schemaCollection('autoexport', {
    indices: [ 'type', 'id', 'status', 'path', 'exportNotes', 'translatorID', 'useJournalAbbreviation'],
    unique: [ 'path' ],
    schema: {
      type: 'object'
      properties: {
        status: { enum: ['running', 'done', 'error' ] }
        scheduled: { coerce: 'date' }
        updated: { coerce: 'date' }
        type: { enum: ['search', 'collection', 'library' ] }
        id: { type: 'integer' }
        exportNotes: { coerce: 'boolean' }
        useJournalAbbreviation: { coerce: 'boolean' }
        translatorID: { type: 'string' }
        path: { type: 'string' }
      }
      required: [ 'type', 'id', 'status', 'path', 'translatorID'],
    }
  })
  ###

  return
)

### old junk, only for json-backed storage
DB.removeCollection('metadata') if DB.getCollection('metadata')
DB.removeCollection('keys') if DB.getCollection('keys')
###

###
TODO: schedule save on close
DB.close()
TODO: save on idle
###

### only for json-backed storage
for ae in autoexports.data()
  # upgrade old autoexports
  if ae.collection
    [ ae.type, ae.id ] = ae.collection.split(':')
    ae.id ?= Zotero.Libraries.userLibraryID
    delete ae.collection
    autoexports.update(ae)

  # interrupted at start
  if ae.status == 'running'
    ae.scheduled = new Date()
    ae.status = 'done'
  else
    delete ae.scheduled
  autoexports.update(ae)
###

module.exports = DB
