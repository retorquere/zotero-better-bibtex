Zotero.BetterBibTeX.keymanager = new class
  constructor: ->
    @log = Zotero.BetterBibTeX.log
    @journalAbbrevs = Object.create(null)
    @keys = Zotero.BetterBibTeX.Cache.addCollection('keys', {disableChangesApi: false})
    @keys.on('insert', (key) ->
      Zotero.BetterBibTeX.debug('keymanager.loki insert', key)
      Zotero.BetterBibTeX.keymanager.verify(key)

      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        Zotero.BetterBibTeX.keymanager.keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
    )
    @keys.on('update', (key) ->
      Zotero.BetterBibTeX.debug('keymanager.loki update', key)
      Zotero.BetterBibTeX.keymanager.verify(key)

      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        Zotero.BetterBibTeX.keymanager.keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      Zotero.BetterBibTeX.cache.remove({itemID: key.itemID})
    )
    @keys.on('delete', (key) ->
      Zotero.BetterBibTeX.debug('keymanager.loki delete', key)
      Zotero.BetterBibTeX.cache.remove({itemID: key.itemID})
    )

    @findKeysSQL = "select i.itemID as itemID, i.libraryID as libraryID, idv.value as extra
                    from items i
                    join itemData id on i.itemID = id.itemID
                    join itemDataValues idv on idv.valueID = id.valueID
                    join fields f on id.fieldID = f.fieldID
                    where f.fieldName = 'extra' and not i.itemID in (select itemID from deletedItems)
                      and (idv.value like '%bibtex:%' or idv.value like '%biblatexcitekey[%' or idv.value like '%biblatexcitekey{%')"

    # three-letter month abbreviations. I assume these are the same ones that the
    # docs say are defined in some appendix of the LaTeX book. (I don't have the
    # LaTeX book.)
    @months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

    @__exposedProps__ = {
      months: 'r'
      journalAbbrev: 'r'
      extract: 'r'
      get: 'r'
      cache: 'r'
    }
    for own key, value of @__exposedProps__
      @[key].__exposedProps__ = []

    @embeddedKeyRE = /bibtex: *([^\s\r\n]+)/
    @andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/

  integer: (v) ->
    return v if typeof v == 'number' || v == null
    _v = parseInt(v)
    throw new Error("#{v} is not an integer-string") if isNaN(_v)
    return _v

  report: (msg) ->
    @log(msg)
    for key in @keys.where((obj) -> true)
      @log('key:', @log.object(key))

  cache: ->
    return (@clone(key) for key in @keys.where((obj) -> true))

  load: ->
    # clean up keys for items that have gone missing
    Zotero.DB.query('delete from betterbibtex.keys where not itemID in (select itemID from items)')

    for row in Zotero.DB.query('select k.itemID, k.citekey, k.citekeyFormat, i.libraryID from betterbibtex.keys k join items i on k.itemID = i.itemID')
      @keys.insert({itemID: @integer(row.itemID), libraryID: row.libraryID, citekey: row.citekey, citekeyFormat: row.citekeyFormat})

  reset: ->
    Zotero.DB.query('delete from betterbibtex.keys')
    Zotero.BetterBibTeX.cache.reset()
    @journalAbbrevs = Object.create(null)
    @keys.removeDataOnly()
    @keys.flushChanges()
    @scan()

  resetJournalAbbrevs: ->
    @journalAbbrevs = Object.create(null)

  clearDynamic: ->
    citekeyFormat = Zotero.BetterBibTeX.pref.get('citekeyFormat')
    @keys.removeWhere((obj) -> obj.citekeyFormat && obj.citekeyFormat != citekeyFormat)

  flush: ->
    tip = Zotero.DB.transactionInProgress()
    Zotero.DB.beginTransaction() unless tip

    for change in @keys.getChanges()
      o = change.obj
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query('insert or replace into betterbibtex.keys (itemID, citekey, citekeyFormat) values (?, ?, ?)', [o.itemID, o.citekey, o.citekeyFormat])
        when 'R'
          Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [o.itemID])

    Zotero.DB.commitTransaction() unless tip
    @keys.flushChanges()

  journalAbbrev: (item) ->
    item = arguments[1] if item._sandboxManager # the sandbox inserts itself in call parameters

    return item.journalAbbreviation if item.journalAbbreviation
    return unless item.publicationTitle
    return unless Zotero.BetterBibTeX.pref.get('autoAbbrev')

    if typeof @journalAbbrevs[item.publicationTitle] is 'undefined'
      styleID = Zotero.BetterBibTeX.pref.get('autoAbbrevStyle')
      styleID = (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)[0].styleID if styleID is ''
      style = Zotero.Styles.get(styleID) # how can this be null?

      if style
        cp = style.getCiteProc(true)

        cp.setOutputFormat('html')
        cp.updateItems([item.itemID])
        cp.appendCitationCluster({ citationItems: [{id: item.itemID}], properties: {} } , true)
        cp.makeBibliography()

        abbrevs = cp
        for p in ['transform', 'abbrevs', 'default', 'container-title']
          abbrevs = abbrevs[p] if abbrevs

        for own title,abbr of abbrevs or {}
          @journalAbbrevs[title] = abbr

      @journalAbbrevs[item.publicationTitle] ?= ''

    return @journalAbbrevs[item.publicationTitle]

  extract: (item, insitu) ->
    if item._sandboxManager
      item = arguments[1]
      insitu = arguments[2]

    switch
      when item.getField
        throw("#{insitu}: cannot extract in-situ for real items") if insitu
        item = {itemID: item.id, extra: item.getField('extra')}
      when !insitu
        item = {itemID: item?.itemID, extra: item.extra.slice(0)}

    return item unless item.extra

    m = @embeddedKeyRE.exec(item.extra) or @andersJohanssonKeyRE.exec(item.extra)
    return item unless m

    item.extra = item.extra.replace(m[0], '').trim()
    item.__citekey__ = m[1].trim()
    delete item.__citekey__ if item.__citekey__ == ''
    return item

  free: (item) ->
    Formatter = Zotero.BetterBibTeX.formatter(Zotero.BetterBibTeX.pref.get('citekeyFormat'))
    citekey = (new Formatter(Zotero.BetterBibTeX.toArray(item))).value

    libraryID = @integer(if item.libraryID == undefined then Zotero.DB.valueQuery('select libraryID from items where itemID = ?', [item.itemID]) else item.libraryID)
    itemID = @integer(item.itemID)
    in_use = (key.citekey for key in @keys.where((o) -> o.libraryID == libraryID && o.itemID != itemID && o.citekey.indexOf(citekey) == 0 && (o.citekey.length - citekey.length) in [0, 1]))
    Zotero.BetterBibTeX.debug("keymanager.free: find free key default=#{citekey}, taken:", in_use, 'cache:', @keys.where((o) -> true))
    postfix = { n: -1, c: '' }
    while (citekey + postfix.c) in in_use
      postfix.n++
      postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)

    return citekey + postfix.c

  selected: (action) ->
    throw new Error("Unexpected action #{action}") unless action in ['set', 'reset']

    zoteroPane = Zotero.getActiveZoteroPane()
    items = (item for item in zoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote())
    Zotero.BetterBibTeX.debug("keymanager.selected(#{action}):", (item.itemID for item in items))

    for item in items
      @remove(item, action == 'set')

    if action == 'set'
      for item in items
        @set(item, @free(item), true)

  save: (item, citekey) ->
    # only save if no change
    item = Zotero.Items.get(item.itemID) unless item.getField

    extra = @extract(item)

    if (extra.__citekey__ == citekey) || (!citekey && !extra.__citekey__)
      Zotero.BetterBibTeX.debug("keymanager.save(#{item.itemID}, #{citekey}): no change")
      return

    extra = extra.extra
    extra += " \nbibtex: #{citekey}" if citekey
    extra = extra.trim()
    Zotero.BetterBibTeX.debug("keymanager.save(#{item.itemID}, #{citekey})")
    item.setField('extra', extra)
    item.save()

  set: (item, citekey, pin) ->
    Zotero.BetterBibTeX.debug("keymanager.set(item=#{item.itemID}, citekey=#{citekey}, pin=#{!!pin})")

    throw new Error('Cannot set empty cite key') if !citekey || citekey.trim() == ''

    # no keys for notes and attachments
    return unless @eligible(item)

    item = Zotero.Items.get(item.itemID) unless item.getField

    itemID = @integer(item.itemID)
    libraryID = @integer(item.libraryID)

    citekeyFormat = if pin then null else Zotero.BetterBibTeX.pref.get('citekeyFormat')
    key = @keys.findOne({itemID})
    return @verify(key) if key && key.citekey == citekey && key.citekeyFormat == citekeyFormat

    if key
      key.citekey = citekey
      key.citekeyFormat = citekeyFormat
      key.libraryID = libraryID
      @keys.update(key)
    else
      key = {itemID, libraryID, citekey, citekeyFormat}
      @keys.insert(key)

    @save(item, citekey) if pin

    return @verify(key)

  scan: (ids, reason) ->
    if reason in ['delete', 'trash']
      ids = (@integer(id) for id in ids || [])
      @keys.removeWhere((o) -> o.itemID in ids)
      return

    Zotero.BetterBibTeX.debug('keymanager.scan:', ids, reason)
    switch
      when !ids
        items = Zotero.DB.query(@findKeysSQL)
      when ids.length == 0
        items = []
      when ids.length == 1
        items = Zotero.Items.get(ids[0])
        items = if items then [items] else []
      else
        items = Zotero.Items.get(ids) || []

    pinned = {}
    for item in items
      itemID = @integer(item.itemID)
      citekey = @extract(item).__citekey__
      cached = @keys.findOne({itemID})

      continue unless citekey && citekey != ''

      if !cached || cached.citekey != citekey || cached.citekeyFormat != null
        libraryID = @integer(item.libraryID)
        if cached
          cached.citekey = citekey
          cached.citekeyFormat = null
          cached.libraryID = libraryID
          @keys.update(cached)
        else
          cached = {itemID, libraryID, citekey: citekey, citekeyFormat: null}
          @keys.insert(cached)

      pinned['' + item.itemID] = cached.citekey

    Zotero.BetterBibTeX.debug('keymanager.scan: pinned =', pinned)

    for itemID in ids || []
      continue if pinned['' + itemID]
      Zotero.BetterBibTeX.debug('keymanager.scan: not pinned', itemID)
      @remove({itemID}, true)
      @get({itemID}, 'on-change')

  remove: (item, soft) ->
    Zotero.BetterBibTeX.debug("keymanager.remove: item=#{item.itemID}, soft=#{!!soft}")

    @keys.removeWhere({itemID: @integer(item.itemID)})
    @save(item) unless soft # only use soft remove if you know a hard set follows!

  eligible: (item) ->
    type = item.itemType
    if !type
      item = Zotero.Items.get(item.itemID) unless item.itemTypeID
      type = switch item.itemTypeID
        when 0 then 'note'
        when 14 then 'attachment'
        else 'reference'
    return false if type in ['note', 'attachment']
    #item = Zotero.Items.get(item.itemID) unless item.getField
    #return false unless item
    #return !item.deleted
    return true

  verify: (entry) ->
    return entry unless Zotero.BetterBibTeX.pref.get('debug') || Zotero.BetterBibTeX.pref.get('testMode')

    verify = {citekey: true, citekeyFormat: null, itemID: true, libraryID: null}
    for own key, value of entry
      switch
        when key in ['$loki', 'meta']                                       then  # ignore
        when verify[key] == undefined                                       then  throw new Error("Unexpected field #{key} in #{typeof entry} #{JSON.stringify(entry)}")
        when verify[key] && typeof value == 'number'                        then  delete verify[key]
        when verify[key] && typeof value == 'string' && value.trim() != ''  then  delete verify[key]
        when verify[key] && !value                                          then  throw new Error("field #{key} of #{typeof entry} #{JSON.stringify(entry)} may not be empty")
        else                                                                      delete verify[key]

    verify = Object.keys(verify)
    return entry if verify.length == 0
    throw new Error("missing fields #{verify} in #{typeof entry} #{JSON.stringify(entry)}")

  clone: (key) ->
    clone = JSON.parse(JSON.stringify(key))
    delete clone.meta
    delete clone['$loki']

    @verify(clone)
    return clone

  get: (item, pinmode) ->
    if item._sandboxManager
      item = arguments[1]
      pinmode = arguments[2]

    Zotero.BetterBibTeX.debug("keymanager.get: item=#{item.itemID}, pinmode=#{pinmode}")

    # no keys for notes and attachments
    return unless @eligible(item)

    # pinmode can be:
    #  on-change: generate and pin if pinCitekeys is on-change, 'null' behavior if not
    #  on-export: generate and pin if pinCitekeys is on-export, 'null' behavior if not
    #  null: fetch -> generate -> return

    pin = (pinmode == Zotero.BetterBibTeX.pref.get('pinCitekeys'))
    cached = @keys.findOne({itemID: @integer(item.itemID)})

    # store new cache item if we have a miss or if a re-pin is requested
    cached = @set(item, @free(item), pin) if !cached || (pin && cached.citekeyFormat)
    return @clone(cached)

  resolve: (citekeys, libraryID) ->
    try
      libraryID = @integer(libraryID)
    catch
      libraryID = null
    return (key.itemID for key in @keys.find({citekey: { '$in': citekeys }, libraryID: libraryID})) if Array.isArray(citekeys)
    return (key.itemID for key in @keys.find({citekey: citekeys, libraryID: libraryID}))

