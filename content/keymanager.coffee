debug = require('./debug.coffee')
Prefs = require('./preferences.coffee')
co = Zotero.Promise.coroutine
Formatter = require('./keymanager/formatter.coffee')
getCiteKey = require('./getCiteKey.coffee')
events = require('./events.coffee')
Loki = require('./loki.coffee')

class KeyManager
  pin: co((id, pin) ->
    item = yield Zotero.Items.getAsync(id)
    citekey = getCiteKey(item.getField('extra'))

    if !citekey.citekey
      item.setField('extra', citekey.extra)
      debug('KeyManager.pin, no citekey found, refreshing', id)
      # unmarked save will trigger citekey generation
      yield item.saveTx()
      return

    return if pin && citekey.pinned
    return if !pin && !citekey.pinned
    item.setField('extra', "#{citekey.extra}\nbibtex#{if pin then '' else '*'}:#{citekey.citekey}".trim())
    debug('KeyManager.pin', pin, id)
    yield item.saveTx({ notifierData: { BetterBibTeX: true } })
    return
  )

  refresh: co((id) ->
    item = yield Zotero.Items.getAsync(id)
    citekey = getCiteKey(item.getField('extra'))
    return if citekey.pinned
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
    ids = (id for id in ids when !extraData[id]?.BetterBibTeX)
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
      where item.itemTypeID not in (#{@query.type.attachment}, #{@query.type.note}) and item.itemID not in (select itemID from deletedItems)
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
      where item.itemTypeID not in (#{@query.type.attachment}, #{@query.type.note}) and item.itemID not in (select itemID from deletedItems)
    """)
    for item in items
      citekey = getCiteKey(item.extra)
      dyn.push(item.itemID) if !citekey.pinned || !citekey.citekey
    debug('KeyManager.patternChanged', dyn)
    yield @update(dyn)
    return
  )

  # update finds all references without citation keys, and all dynamic references that are marked to be overridden -- either
  # an array of ids, or the string '*' for all dynamic references (only to be used when the pattern changes)
  update: co((ids = []) ->
    debug('KeyManager.update', {ids})
    return unless ids.length

    citekeys = yield @scan(ids)

    save = []

    # update all dynamic keys where necessary
    for item in citekeys.find({update: true, pinned: false})
      citekey = yield @findKey(item, citekeys)
      if citekey != item.citekey
        debug('KeyManager.update:', item.itemID, 'changed citation key from', item.citekey, 'to', citekey)
        item.item.setField('extra', item.extra + "\nbibtex*:" + citekey)
        save.push(item.item)
      else
        debug('KeyManager.update:', item.itemID, 'keeping', item.citekey)

      # not sure if this is necessary anymore?
      item.update = false
      item.citekey = citekey
      citekeys.update(item)

    # find all dynamic conflicts
    if Prefs.get('keyConflictPolicy') != 'keep'
      for pinned in citekeys.find({ update: true, pinned: true })
        for item in citekeys.find({ libraryID: pinned.libraryID, pinned: false, citekey: pinned.citekey })
          throw new Error('this should have been handled in the loop above!') if item.item
          citekey = yield @findKey(item, citekeys)
          throw new Error('this should not have been found') if citekey == item.citekey
          throw new Error('item not set') unless item.item

          debug('KeyManager.update:', item.itemID, 'changed citation key from', item.citekey, 'to', citekey)
          item.item.setField('extra', item.extra + "\nbibtex*:" + citekey)
          save.push(item.item)

    # defer to the end because man I hate async this could potentially cause race conditions
    for item in save
      debug('KeyManager.update: saving', item.id)
      yield item.saveTx({ notifierData: { BetterBibTeX: true } })

    debug('KeyManager.update done')
    return
  )

  scan: co((ids) ->
    start = new Date()
    debug('Keymanager.scan: citekey scan start')

    keys = Loki('keys').addCollection('keys', {
      indices: [ 'itemID', 'libraryID', 'citekey', 'pinned' ],
      schema: {
        type: 'object'
        properties: {
          itemID: { type: 'integer' }
          libraryID: { type: 'integer' }
          citekey: { type: 'string' }
          pinned: { coerce: 'boolean', default: false }
          update: { coerce: 'boolean', default: false }
          extra: { coerce: 'string', default: '' }
        }
        required: [ 'itemID', 'libraryID', 'citekey', 'extra', 'update' ]
      }
    })

    update = ids.reduce(((acc, id) -> acc[id] = true; return acc), {})

    items = yield Zotero.DB.queryAsync("""
      select item.itemID, item.libraryID, extra.value as extra, item.itemTypeID
      from items item
      left join itemData field on field.itemID = item.itemID and field.fieldID = #{@query.field.extra}
      left join itemDataValues extra on extra.valueID = field.valueID
      where item.itemID not in (select itemID from deletedItems)
        and item.itemTypeID not in (#{@query.type.attachment}, #{@query.type.note})
    """)
    for item in items
      key = keys.insert(Object.assign(getCiteKey(item.extra), {
        update: update[item.itemID],
        itemID: item.itemID,
        libraryID: item.libraryID,
      }))
      debug('Keymanager.scan: got', {itemID: item.itemID, extra: item.extra, key})

    debug('Keymanager.scan: citekey scan complete:', new Date() - start)

    return keys
  )

  postfixBaseChar: 'a'.charCodeAt(0) - 1
  postfixRE: {
    zotero: /^(-[0-9]+)?$/
    bbt: /^([a-z])?$/
  }
  findKey: co((item, keys) ->
    item.item ||= yield Zotero.Items.getAsync(item.itemID)
    proposed = @formatter.format(item.item)

    # item already has proposed citekey
    if item.citekey.slice(0, proposed.citekey.length) == proposed.citekey &&
      item.citekey.slice(proposed.citekey.length).match(if proposed.postfix == '0' then @postfixRE.zotero else @postfixRE.bbt) &&
      !keys.findOne({ $and: [ { libraryID: item.libraryID }, { citekey: item.citekey }, { itemID: { $ne: item.itemID } } ] })
        return item.citekey

    # unpostfixed citekey is available
    if !keys.findOne({ libraryID: item.libraryID, citekey: proposed.citekey })
      return proposed.citekey

    postfix = 1
    while true
      throw new Error('Postfix out of bounds') if proposed.postfix != '0' && postfix > 26
      citekey = proposed.citekey + (if proposed.postfix == '0' then '-' + postfix else String.fromCharCode(@postfixBaseChar + postfix))
      return citekey unless keys.findOne({ libraryID: item.libraryID,  citekey })
      postfix += 1

    return null
  )

module.exports = new KeyManager()
