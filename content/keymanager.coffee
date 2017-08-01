debug = require('./debug.coffee')
Prefs = require('./preferences.coffee')
co = Zotero.Promise.coroutine
Formatter = require('./keymanager/formatter.coffee')
getCiteKey = require('./getCiteKey.coffee')
events = require('./events.coffee')

class KeyManager
  pin: co((id, pin) ->
    item = yield Zotero.Items.getAsync(id)
    citekey = getCiteKey(item.getField('extra'))

    if !citekey.citekey
      item.setField('extra', citekey.extra)
      debug('KeyManager.pin, no citekey found, refreshing', id)
      yield item.saveTx()
      return

    return if pin && !citekey.dynamic
    return if !pin && citekey.dynamic
    item.setField('extra', "#{citekey.extra}\nbibtex#{if pin then '' else '*'}:#{citekey.citekey}".trim())
    debug('KeyManager.pin', pin, id)
    yield item.saveTx({ notifierData: { BetterBibTeX: true } })
    return
  )

  refresh: co((id) ->
    item = yield Zotero.Items.getAsync(id)
    citekey = getCiteKey(item.getField('extra'))
    return unless citekey.dynamic
    item.setField('extra', citekey.extra)
    debug('KeyManager.refresh', id)
    yield item.saveTx() # the save will be picked up by the notifier, no key will be found, and a new one will be assigned
    return
  )

  init: co(->
    debug('KeyManager.init...')
    @query = {
      field: {}
      type: {}
    }

    for field in yield Zotero.DB.queryAsync("select fieldID, fieldName from fields where fieldName in ('extra')")
      @query.field[field.fieldName] = field.fieldID
    for type in yield Zotero.DB.queryAsync("select itemTypeID, typeName from itemTypes where typeName in ('note', 'attachment')") # 1, 14
      @query.type[type.typeName] = type.itemTypeID

    @formatter = new Formatter(@)

    @observerID = Zotero.Notifier.registerObserver(@, ['item'], 'BetterBibTeX.KeyManager', 100)

    if Prefs.get('scanCitekeys')
      yield @update(yield @unset())
      Prefs.set('scanCitekeys', false)
      debug('KeyManager.init: scanning for unset keys finished')

    debug('KeyManager.init: done')

    events.on('preference-changed', (pref) =>
      if pref in ['autoAbbrev', 'autoAbbrevStyle', 'citekeyFormat', 'citekeyFold', 'skipWords']
        @formatter.update()
        co(=> yield @patternChanged())()
      return
    )
    return
  )

  notify: co((action, type, ids, extraData) ->
    debug('KeyManager.notify', {action, type, ids, extraData})

    return unless action in ['add', 'modify']

    ## TODO: test for field updates https://groups.google.com/d/msg/zotero-dev/naAxXIbpDhU/7rM-5IKGBQAJ

    ## skip saves we caused ourselves
    ids = (id for id in ids when !extraData[id].BetterBibTeX)
    debug('KeyManager.notify', {ids})

    yield @update(ids)

    return
  )

  citekeyRE: /(?:^|\n)bibtex(\*?):\s*([^\n]+)(?:\n|$)/

  unset: co(->
    unset = []
    items = yield Zotero.DB.queryAsync("""
      select item.itemID, extra.value as extra
      from items item
      left join itemData field on field.fieldID = #{@query.field.extra} and field.itemID = item.itemID
      left join itemDataValues extra on extra.valueID = field.valueID
      where item.itemTypeId not in (#{@query.type.attachment}, #{@query.type.note}) and item.itemID not in (select itemID from deletedItems)
    """)
    for item in items
      citekey = getCiteKey(item.extra)
      unset.push(item.itemID) unless citekey.citekey
    return unset
  )

  patternChanged: co(->
    dyn = []
    items = yield Zotero.DB.queryAsync("""
      select item.itemID, extra.value as extra
      from items item
      join itemData field on field.fieldID = #{@query.field.extra} and field.itemID = item.itemID
      join itemDataValues extra on extra.valueID = field.valueID
      where item.itemTypeId not in (#{@query.type.attachment}, #{@query.type.note}) and item.itemID not in (select itemID from deletedItems)
    """)
    for item in items
      citekey = getCiteKey(item.extra)
      dyn.push(item.itemID) if citekey.dynamic || !citekey.citekey
    debug('KeyManager.patternChanged', dyn)
    yield @update(dyn)
    return
  )

  # update finds all references without citation keys, and all dynamic references that are marked to be overridden -- either
  # an array of ids, or the string '*' for all dynamic references (only to be used when the pattern changes)
  update: co((ids = []) ->
    debug('KeyManager.update', {ids})
    return unless ids.length

    citekeys = {}
    dynamic = {}
    update = []

    # scan for existing citekeys to avoid duplicates
    start = new Date()
    debug('Keymanager.update: citekey scan start')
    items = yield Zotero.DB.queryAsync("""
      select item.itemID, item.libraryID, extra.value as extra
      from items item
      join itemData field on field.itemID = item.itemID
      join itemDataValues extra on extra.valueID = field.valueID
      where field.fieldID = #{@query.field.extra} and field.itemID not in (select itemID from deletedItems)
    """)
    for item in items
      citekeys[item.libraryID] ||= {}
      dynamic[item.libraryID] ||= {}

      citekey = getCiteKey(item.extra)

      # ignore citation keys that may be changed below
      citekeys[item.libraryID][citekey.citekey] = true unless citekey.dynamic && item.itemID in ids

      # make note of existing not included in this update dynamic keys -- if key conflicy resolution = 'change', we'll need them later
      if citekey.dynamic && item.itemID not in ids
        dynamic[item.libraryID][citekey.citekey] ||= []
        dynamic[item.libraryID][citekey.citekey].push(item.itemID)
    debug('Keymanager.update: citekey scan complete:', new Date() - start)

    debug('KeyManager.update', {citekeys})

    basechar = 'a'.charCodeAt(0) - 1

    pinned = {}
    items = yield Zotero.Items.getAsync(ids)
    debug('KeyManager.update:', {update: update.length, items: items.length})
    for item in items
      continue if item.isNote() || item.isAttachment()

      citekeys[item.libraryID] ||= {}

      citekey = getCiteKey(item.getField('extra'))

      if !citekey.dynamic # remember pinned keys for conflict resolution but nothing further needs to be done
        pinned[item.libraryID] ||= []
        pinned[item.libraryID].push(citekey.citekey)
        continue

      proposed = @formatter.format(item)

      debug('KeyManager.update:', {id: item.id, library: item.libraryID, found: citekey, proposed, keys: citekeys[item.libraryID]})

      # let's see if we can keep this citekey
      if citekey.citekey && !citekeys[item.libraryID][citekey.citekey]
        # citekey is unchanged and also not taken -- rare
        if citekey.citekey == proposed.citekey
          citekeys[item.libraryID][citekey.citekey] = true
          debug('KeyManager.update: keeping', citekey.citekey)
          continue

        # citekey with postfix is free, keep it
        if citekey.citekey.startsWith(proposed.citekey)
          if proposed.postfix == '0'
            if citekey.citekey.substr(proposed.citekey.length).match(/-[0-9]+$/)
              citekeys[item.libraryID][citekey.citekey] = true
              debug('KeyManager.update: keeping', citekey.citekey)
              continue
          else
            if citekey.citekey.substr(proposed.citekey.length).match(/[a-z]$/)
              citekeys[item.libraryID][citekey.citekey] = true
              debug('KeyManager.update: keeping', citekey.citekey)
              continue

      debug('KeyManager.update: discarding', citekey.citekey) if citekey.citekey

      # perhaps no postfixing is required
      if !citekeys[item.libraryID][proposed.citekey]
        citekey.citekey = proposed.citekey

      # seek free postfix
      else
        postfix = 1
        while true
          citekey.citekey = proposed.citekey + (if proposed.postfix == '0' then '-' + postfix else String.fromCharCode(basechar + postfix))
          break unless citekeys[item.libraryID][citekey.citekey]
          postfix += 1

      debug('KeyManager.update: new', citekey.citekey)
      citekeys[item.libraryID][citekey.citekey] = true

      item.setField('extra', (citekey.extra + "\nbibtex*:" + citekey.citekey).trim())
      debug('itemToExport Keymanager.update: setting citekey:', item.id, citekey, item.clientDateModified)
      yield item.saveTx({ notifierData: { BetterBibTeX: true } })

    if Prefs.get('keyConflictPolicy') != 'keep'
      reset = []
      for libraryID, citekeys of dynamic                                  # dynamic citekeys by library ID
        for citekey, itemIDs of citekeys                                  # all dynamic-key references that have that citekey
          continue unless citekey in (pinned[libraryID]?[citekey] || [])  # if that citekey is not freshly pinned, move along
          reset = reset.concat(itemIDs)

      if reset.length
        reset = yield Zotero.Items.get(reset)
        for item in reset
          getCiteKey(item.getField('extra'))
          item.setField('extra', citekey.extra.trim())
          debug('Keymanager.update: clearing citekey:', item.id)
          yield item.saveTx()

    return
  )

module.exports = new KeyManager()
