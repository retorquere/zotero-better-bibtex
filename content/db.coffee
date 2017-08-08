Loki = require('./loki.coffee')

# TODO: re-enable when I figure out where I want to save to
DB = Loki('db.json', { autosave: false })

DB.loadDatabase()

# old junk
DB.removeCollection('metadata') if DB.getCollection('metadata')
DB.removeCollection('keys') if DB.getCollection('keys')

###
  TODO: schedule save on close
DB.close()
###

### move to autoexports when I get to it
autoexports = DB.schemaCollection('autoexport', {
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
