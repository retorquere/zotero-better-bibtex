Queue = require('better-queue')
Events = require('./events.coffee')
DB = require('./db/main.coffee')
Translators = require('./translators.coffee')
Prefs = require('./preferences.coffee')

AutoExports = nil

scheduled = new Queue((task, cb) ->
  do Zotero.Promise.coroutine(->
    ae = AutoExports.get(task.id)
    if ae
      ae.status = 'running'
      AutoExports.update(ae)

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
      AutoExports.update(ae)
    cb(null)
    return
  )
  return
)
scheduled.pause()

scheduler = new Queue(((task, cb) ->
  task = Object.assign({}, task)

  do Zotero.Promise.coroutine(->
    ae = AutoExports.get(task.id)
    if ae
      ae.status = 'scheduled'
      AutoExports.update(ae)

      yield Zotero.Promise.delay(1000)

      if (task.cancelled)
        debug('canceled export', task.id)
      else
        scheduled.push(task)

    cb(null)
    return
  )

  return { cancel: -> task.cancelled = true; return }
), { cancelIfRunning: true })
scheduler.pause()

Events.on('collections-changed', (ids) ->
  for ae in AutoExports.find({ type: 'collection', id: { $in: ids } })
    scheduler.push({ id: ae.$loki })
  return
)

Events.on('collections-removed', (ids) ->
  for ae in AutoExports.find({ type: 'collection', id: { $in: ids } })
    scheduled.cancel(ae.$loki)
    scheduler.cancel(ae.$loki)
    AutoExports.remove(ae)
  return
)

idleObserver = observe: (subject, topic, data) ->
  debug("idle: #{topic}")
  return unless Prefs.get('autoExport') == 'idle'
  switch topic
    when 'back', 'active'
      scheduler.pause()
      scheduled.pause()

    when 'idle'
      scheduler.resume()
      scheduled.resume()
  return
idleService = Components.classes['@mozilla.org/widget/idleservice;1'].getService(Components.interfaces.nsIIdleService)
idleService.addIdleObserver(idleObserver, Prefs.get('autoExportIdleWait'))

Events.on('preference-changed', (pref) ->
  return unless pref == 'autoExport'

  switch Prefs.get('autoExport')
    when 'immediate'
      scheduler.resume()
      scheduled.resume()
    else # / off / idle
      scheduler.pause()
      scheduled.pause()
  return
)

class AutoExport
  init: ->
    AutoExports = DB.getCollection('autoexport')
    for ae in AutoExports.find({ status: { $ne: 'done' } })
      scheduler.push({ id: ae.$loki })

    if Prefs.get('autoExport') == 'immediate'
      scheduled.resume()
      scheduler.resume()
    return

module.exports = new AutoExport()
