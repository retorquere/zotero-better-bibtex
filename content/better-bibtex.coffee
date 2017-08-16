debug = require('./debug.coffee')
flash = require('./flash.coffee')
edtf = require('edtf')
events = require('./events.coffee')

Zotero.BetterBibTeX.PrefPane = require('./preferences/preferences.coffee')
Zotero.BetterBibTeX.ErrorReport = require('./error-report/error-report.coffee')

Prefs = require('./preferences.coffee') # needs to be here early, initializes the prefs observer

# TODO: remove after beta
Zotero.Prefs.get('debug.store', true)
Zotero.Debug.setStore(true)

Translators = require('./translators.coffee')
KeyManager = require('./keymanager.coffee')
DB = require('./db/main.coffee')
CACHE = require('./db/cache.coffee')
Serializer = require('./serializer.coffee')
Citekey = require('./keymanager/get-set.coffee')

###
  MONKEY PATCHES
###
### bugger this, I don't want megabytes of shared code in the translators ###
parseDate = require('./dateparser.coffee')
CiteProc = require('./citeproc.coffee')
titleCase = require('./title-case.coffee')
Zotero.Translate.Export::Sandbox.BetterBibTeX = {
  parseDate: (sandbox, date) -> parseDate(date)
  isEDTF: (sandbox, date) ->
    try
      edtf.parse(date)
      return true
    catch
      return false
  parseParticles: (sandbox, name) -> CiteProc.parseParticles(name) # && CiteProc.parseParticles(name)
  titleCase: (sandbox, text) -> titleCase(text)
  simplifyFields: (sandbox, item) -> Serializer.simplify(item)
  scrubFields: (sandbox, item) -> Serializer.scrub(item)
  debugEnabled: (sandbox) -> Zotero.Debug.enabled
}
Zotero.Translate.Import::Sandbox.BetterBibTeX = {
  simplifyFields: (sandbox, item) -> Serializer.simplify(item)
  debugEnabled: (sandbox) -> Zotero.Debug.enabled
  scrubFields: (sandbox, item) -> Serializer.scrub(item)
}

Zotero.Item::save = ((original) ->
  return Zotero.Promise.coroutine((options)->
    Zotero.debug("Zotero.Item::save: pre-#{if @deleted then 'delete' else 'save'}")

    try
      citekey = KeyManager.generate(@) unless @deleted || @isNote() || @isAttachment()
    catch err
      throw new Error("Zotero.Item::save: could not generate citekey: " + err + "\n\n" + err.stack)

    if citekey?.changed
      try
        @setField('extra', Citekey.set(@getField('extra'), citekey.citekey))
        debug('Zotero.Item::save: citekey embedded', citekey)
      catch err
        debug('Zotero.Item::save: failed to embed citekey' + err + "\n\n" + err.stack)
        citekey = false
    else
      debug('Zotero.Item::save: leave citekey as-is')

    try
      Zotero.debug("Zotero.Item::save: native...")
      result = yield original.call(@, options)
    catch err
      Zotero.debug("Zotero.Item::save: native save failed! " + err + "\n\n" + err.stack)
      throw err

    Zotero.debug("Zotero.Item::save: native succeeded")

    try
      if citekey
        keys = DB.getCollection('citekey')
        pinned = !!citekey.pinned
        if !keys.findOne({ itemID: @id, pinned, citekey: citekey.citekey }) || @deleted
          keys.findAndRemove({itemID: @id})
          keys.insert({itemID: @id, libraryID: @libraryID, pinned, citekey: citekey.citekey }) unless @deleted
      CACHE.remove(@id)
    catch err
      Zotero.debug("Zotero.Item::save: post-native save failed: " + err + "\n\n" + err.stack)

    return result
  )
)(Zotero.Item::save)

Zotero.Notifier.registerObserver({
  notify: (action, type, ids, extraData) ->
    debug('item.notify', {action, type, ids, extraData})

    # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
    # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
    # items = Zotero.Items.get(ids)

    # not needed as the parents will be signaled themselves
    # parents = (item.parentID for item in items when item.parentID)
    # CACHE.remove(parents)

    CACHE.remove(ids)

    switch action
      when 'delete', 'trash'
        KeyManager.remove(ids)
        events.emit('items-removed', ids) # maybe pass items?

      when 'add', 'modify'
        # safe to use Zotero.Items.get(...) rather than Zotero.Items.getAsync here
        # https://groups.google.com/forum/#!topic/zotero-dev/99wkhAk-jm0
        items = Zotero.Items.get(ids)
        for item in items
          continue if item.isNote() || item.isAttachment()
          KeyManager.update(item)
        events.emit('items-changed', ids) # maybe pass items?

      else
        debug('item.notify: unhandled', {action, type, ids, extraData})

    return
}, ['item'], 'BetterBibTeX', 1)

Zotero.Utilities.Internal.itemToExportFormat = ((original) ->
  return (zoteroItem, legacy, skipChildItems) ->
    try
      return Serializer.fetch(zoteroItem.id, legacy, skipChildItems) || Serializer.store(zoteroItem.id, original.apply(@, arguments), legacy, skipChildItems)
    catch err # fallback for safety for non-BBT
      debug('Zotero.Utilities.Internal.itemToExportFormat', err)

    return original.apply(@, arguments)
)(Zotero.Utilities.Internal.itemToExportFormat)

###
  INIT
###

bench = (msg) ->
  now = new Date()
  debug("startup: #{msg} took #{(now - bench.start) / 1000.0}s")
  bench.start = now
  return
do Zotero.Promise.coroutine(->
  ready = Zotero.Promise.defer()
  Zotero.BetterBibTeX.ready = ready.promise
  bench.start = new Date()

  yield Zotero.initializationPromise
  bench('Zotero.initializationPromise')

  yield DB.init()
  bench('DB.init()')

  yield KeyManager.init() # inits the key cache by scanning the DB
  bench('KeyManager.init()')

  yield Serializer.init() # creates simplify et al
  bench('Serializer.init()')

  if Prefs.get('testing')
    Zotero.BetterBibTeX.TestSupport = require('./test/support.coffee')
    bench('Zotero.BetterBibTeX.TestSupport')
  else
    debug('starting, skipping test support')

  flash('waiting for Zotero translators...', 'Better BibTeX needs the translators to be loaded')
  yield Zotero.Schema.schemaUpdatePromise
  bench('Zotero.Schema.schemaUpdatePromise')

  flash('Zotero translators loaded', 'Better BibTeX ready for business')

  yield Translators.init()
  bench('Translators.init()')

  # should be safe to start tests at this point. I hate async.

  ready.resolve(true)

  return
)
