Queue = require('better-queue')
MemoryStore = require('better-queue-memory')
Events = require('./events.coffee')
DB = require('./db/main.coffee')
Translators = require('./translators.coffee')
Prefs = require('./preferences.coffee')

scheduled = new Queue(((task, cb) ->
  do Zotero.Promise.coroutine(->
    ae = AutoExport.db.get(task.id)
    if ae
      ae.status = 'running'
      AutoExports.db.update(ae)

      try
        switch ae.type
          when 'collection'
            items = { collection: ae.  id }
          when 'library'
            items = { library: ae.  id }
          else
            items = null

        yield Translators.translate(ae.translatorID, { exportNotes: ae.exportNotes, useJournalAbbreviation: ae.useJournalAbbreviation}, items, ae.path)
        ae.error = ''
      catch err
        debug('AutoExport.scheduled failed for', ae, err)
        ae.error = '' + error

      ae.status = 'done'
      ae.updated = new Date()
      AutoExports.db.update(ae)
    cb(null)
    return
  )
  return
), { store: new MemoryStore() })
scheduled.resume()

scheduler = new Queue(((task, cb) ->
  task = Object.assign({}, task)

  do Zotero.Promise.coroutine(->
    ae = AutoExports.db.get(task.id)
    if ae
      ae.status = 'scheduled'
      AutoExports.db.update(ae)

      yield Zotero.Promise.delay(1000)

      if (task.cancelled)
        debug('canceled export', task.id)
      else
        scheduled.push(task)

    cb(null)
    return
  )

  return { cancel: -> task.cancelled = true; return }
), { store: new MemoryStore(), cancelIfRunning: true })
scheduler.pause()

Events.on('collections-changed', (ids) ->
  for ae in AutoExports.db.find({ type: 'collection', id: { $in: ids } })
    scheduler.push({ id: ae.$loki })
  return
)

Events.on('collections-removed', (ids) ->
  for ae in AutoExports.db.find({ type: 'collection', id: { $in: ids } })
    scheduled.cancel(ae.$loki)
    scheduler.cancel(ae.$loki)
    AutoExports.db.remove(ae)
  return
)

idleObserver = observe: (subject, topic, data) ->
  debug("idle: #{topic}")
  return unless Prefs.get('autoExport') == 'idle'
  switch topic
    when 'back', 'active'
      scheduler.pause()

    when 'idle'
      scheduler.resume()
  return
idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver(idleObserver, Prefs.get('autoExportIdleWait'))

Events.on('preference-changed', (pref) ->
  return unless pref == 'autoExport'

  switch Prefs.get('autoExport')
    when 'immediate'
      scheduler.resume()
    else # / off / idle
      scheduler.pause()
  return
)

AutoExport = new class _AutoExport
  init: ->
    @db = DB.getCollection('autoexport')
    for ae in @db.find({ status: { $ne: 'done' } })
      scheduler.push({ id: ae.$loki })

    if Prefs.get('autoExport') == 'immediate'
      scheduler.resume()
    return

  run: (ae) ->
    ae.status = 'scheduled'
    @db.update(ae)
    scheduled.push({ id: ae.$loki })
    return

module.exports = AutoExport
