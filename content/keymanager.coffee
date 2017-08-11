debug = require('./debug.coffee')
flash = require('./flash.coffee')
Prefs = require('./preferences.coffee')
co = Zotero.Promise.coroutine
Formatter = require('./keymanager/formatter.coffee')
Citekey = require('./keymanager/get-set.coffee')
events = require('./events.coffee')
DB = require('./db.coffee')
version = require('../gen/version.js')

class KeyManager
  pin: co((id, pin) ->
    debug('KeyManager.pin', id, pin)
    item = yield Zotero.Items.getAsync(id)
    citekey = Citekey.get(item.getField('extra'))

    if !citekey.citekey
      item.setField('extra', citekey.extra)
      debug('KeyManager.pin, no citekey found, refreshing', id)
      yield item.saveTx()
      return

    return if !!pin == !!citekey.pinned

    item.setField('extra', "#{citekey.extra}\nbibtex#{if pin then '' else '*'}:#{citekey.citekey}".trim())
    yield item.saveTx()
    debug('KeyManager.pin done', pin, id, citekey)
    return
  )

  refresh: co((id) ->
    debug('KeyManager.refresh', id)
    item = yield Zotero.Items.getAsync(id)
    citekey = Citekey.get(item.getField('extra'))
    debug('KeyManager.refresh:', id, citekey)
    return if citekey.pinned
    item.setField('extra', citekey.extra)
    debug('KeyManager.refresh', id, citekey)
    yield item.saveTx() # the save will be picked up by the monkey-patched save, no key will be found, and a new one will be assigned
    debug('KeyManager.refresh done', id, citekey)
    return
  )

  init: co(->
    debug('KeyManager.init...')

    @keys = DB.getCollection('citekey')

    @query = {
      field: {}
      type: {}
    }

    for field in yield Zotero.DB.queryAsync("select fieldID, fieldName from fields where fieldName in ('extra')")
      @query.field[field.fieldName] = field.fieldID
    for type in yield Zotero.DB.queryAsync("select itemTypeID, typeName from itemTypes where typeName in ('note', 'attachment')") # 1, 14
      @query.type[type.typeName] = type.itemTypeID

    @formatter = new Formatter(@)

    yield @rescan()

    debug('KeyManager.init: done')

    events.on('preference-changed', (pref) =>
      debug('KeyManager.pref changed', pref)
      if pref in ['autoAbbrevStyle', 'citekeyFormat', 'citekeyFold', 'skipWords']
        @formatter.update()
      return
    )

    return
  )

  rescan: co(->
    if @scanning
      flash('Scanning still in progress', "Scan is still running, #{@scanning} items left")
      return

    @scan()

    debug('KeyManager.rescan: scanning for unset keys')

    flash('Scanning', 'Scanning for references without citation keys. If you have a large library, this may take a while', 1)
    unset = yield @unset()
    @scanning = unset.length
    debug('KeyManager.rescan: scanning for unset keys finished, found', unset)

    if unset.length
      start = new Date()
      flash('Assigning citation keys', "Found #{unset.length} references without a citation key")
      for id in unset
        yield Zotero.DB.executeTransaction(co(->
          item = yield Zotero.Items.getAsync(id)
          debug('KeyManager.rescan: saving item', item.id)
          yield item.save()
          @scanning--
          if (@scanning % 100) == 1
            flash('Assigning citation keys', "Still busy, #{@scanning} remaining...")
          return
        ))
      @scanning = false
      flash('Assigning citation keys', "#{unset.length} references updated in #{((new Date()) - start) / 1000.0}s")
    debug('KeyManager.rescan: done updating citation keys')

    return
  )

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
      citekey = Citekey.get(item.extra)
      unset.push(item.itemID) unless citekey.citekey
    return unset
  )

  scan: co(->
    start = new Date()
    debug('Keymanager.scan: citekey scan start')

    @keys.removeDataOnly()

    items = yield Zotero.DB.queryAsync("""
      select item.itemID, item.libraryID, extra.value as extra, item.itemTypeID
      from items item
      left join itemData field on field.itemID = item.itemID and field.fieldID = #{@query.field.extra}
      left join itemDataValues extra on extra.valueID = field.valueID
      where item.itemID not in (select itemID from deletedItems)
        and item.itemTypeID not in (#{@query.type.attachment}, #{@query.type.note})
    """)
    for item in items
      key = @keys.insert(Object.assign(Citekey.get(item.extra), {
        itemID: item.itemID,
        libraryID: item.libraryID,
      }))
      debug('Keymanager.scan: got', {itemID: item.itemID, extra: item.extra, key})

    debug('Keymanager.scan: citekey scan complete:', new Date() - start)
    return
  )

  postfixAlpha: (n) ->
    postfix = ''
    a = 1
    b = 26
    while (num -= a) >= 0
      postfix = String.fromCharCode(parseInt(num % b / a) + 97) + postfix
      a = b
      b *= 26
    return postfix

  postfixRE: {
    numeric: /^(-[0-9]+)?$/
    alphabetic: /^([a-z])?$/
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
      citekey = proposed.citekey + (if proposed.postfix == '0' then '-' + postfix else @postfixAlpha(postfix))
      return citekey unless keys.findOne({ libraryID: item.libraryID,  citekey })
      postfix += 1

    return null
  )

  generate: (item) ->
    debug('KeyManager.generate: getting existing key from extra field,if any')
    citekey = Citekey.get(item.getField('extra'))
    debug('KeyManager.generate: found key', citekey)
    return false if citekey.pinned

    debug('KeyManager.generate: formatting...', citekey)
    proposed = @formatter.format(item)
    debug('KeyManager.generate: proposed=', proposed)

    debug("KeyManager.generate: testing whether #{item.id} can keep #{citekey.citekey}")
    # item already has proposed citekey
    if citekey.citekey.slice(0, proposed.citekey.length) == proposed.citekey                                # key begins with proposed sitekey
      re = (proposed.postfix == '0' && @postfixRE.numeric) || @postfixRE.alphabetic
      if citekey.citekey.slice(proposed.citekey.length).match(re)                                           # rest matches proposed postfix
        if @keys.findOne({ libraryID: item.libraryID, citekey: citekey.citekey, itemID: { $ne: item.id } })  # noone else is using it
          return false
        else
          debug("KeyManager.generate: #{item.id}: #{citekey.citekey} is in use by", @keys.findOne({ libraryID: item.libraryID, citekey: citekey.citekey, itemID: { $ne: item.id } }))
      else
        debug("KeyManager.generate: #{item.id}: #{citekey.citekey} has wrong postfix for", proposed)
    else
      debug("KeyManager.generate: #{item.id}: #{citekey.citekey} does not start with #{proposed.citekey}")

    debug("KeyManager.generate: testing whether #{item.id} can use proposed #{proposed.citekey}")
    # unpostfixed citekey is available
    if !@keys.findOne({ libraryID: item.libraryID, citekey: proposed.citekey, itemID: { $ne: item.id } })
      debug("KeyManager.generate: #{item.id} can use proposed #{proposed.citekey}")
      return proposed.citekey

    debug("KeyManager.generate: generating free citekey from #{item.id} from", proposed.citekey)
    postfix = 1
    while true
      postfixed = proposed.citekey + (if proposed.postfix == '0' then '-' + postfix else String.fromCharCode(@postfixBaseChar + postfix))
      debug("KeyManager.generate: trying", postfixed)
      return postfixed unless @keys.findOne({ libraryID: item.libraryID, citekey: postfixed })
      postfix += 1

    # we should never get here
    debug("KeyManager.generate: we should not be here!")
    return false

module.exports = new KeyManager()
