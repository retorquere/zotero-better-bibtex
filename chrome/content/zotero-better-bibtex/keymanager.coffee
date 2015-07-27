Zotero.BetterBibTeX.keymanager = new class
  constructor: ->
    @log = Zotero.BetterBibTeX.log
    @resetJournalAbbrevs()

    @keys = Zotero.BetterBibTeX.Cache.addCollection('keys', {disableChangesApi: false, indices: 'itemID libraryID citekey citekeyFormat'.split(/\s+/) })
    @keys.on('insert', (key) ->
      #Zotero.BetterBibTeX.debug('keymanager.loki insert', key)
      Zotero.BetterBibTeX.keymanager.verify(key)

      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        # removewhere will trigger 'delete' for the conflicts, which will take care of their cache dependents
        Zotero.BetterBibTeX.keymanager.keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)
    )
    @keys.on('update', (key) ->
      #Zotero.BetterBibTeX.debug('keymanager.loki update', key)
      Zotero.BetterBibTeX.keymanager.verify(key)

      if !key.citekeyFormat && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
        Zotero.BetterBibTeX.keymanager.keys.removeWhere((o) -> o.citekey == key.citekey && o.libraryID == key.libraryID && o.itemID != key.itemID && o.citekeyFormat)

      Zotero.BetterBibTeX.cache.remove({itemID: key.itemID})
    )
    @keys.on('delete', (key) ->
      #Zotero.BetterBibTeX.debug('keymanager.loki delete', key)
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

    @embeddedKeyRE = /bibtex: *([^\s\r\n]+)/
    @andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/

  integer: (v) ->
    return v if typeof v == 'number' || v == null
    _v = parseInt(v)
    throw new Error("#{typeof v} '#{v}' is not an integer-string") if isNaN(_v)
    return _v

  cache: ->
    return (@clone(key) for key in @keys.find())

  load: ->
    # clean up keys for items that have gone missing
    Zotero.DB.query('delete from betterbibtex.keys where not itemID in (select itemID from items)')

    for row in Zotero.DB.query('select k.itemID, k.citekey, k.citekeyFormat, i.libraryID from betterbibtex.keys k join items i on k.itemID = i.itemID')
      @keys.insert({itemID: @integer(row.itemID), libraryID: row.libraryID, citekey: row.citekey, citekeyFormat: row.citekeyFormat})

    # select non-note, non-attachment items that don't have a cached key, and generate one, to make sure the cache is
    # complete. Should only run after first installation, as after that all new items or item changes will generate
    # keys, but better safe than sorry.
    # TODO: this works locally but fails on Travis -- investigate later
    #for row in Zotero.DB.query('select itemID from items where itemTypeID not in (0, 14) and itemID not in (select itemID from betterbibtex.keys)')
    #  @get({itemID: row.itemID})

  reset: ->
    Zotero.DB.query('delete from betterbibtex.keys')
    @resetJournalAbbrevs()
    @keys.removeDataOnly()
    @keys.removeWhere((obj) -> true) # causes cache drop
    @keys.flushChanges()
    @scan()

  resetJournalAbbrevs: ->
    @journalAbbrevs = {
      default: {
        "container-title": { },
        "collection-title": { },
        "institution-entire": { },
        "institution-part": { },
        "nickname": { },
        "number": { },
        "title": { },
        "place": { },
        "hereinafter": { },
        "classic": { },
        "container-phrase": { },
        "title-phrase": { }
      }
    }

  clearDynamic: ->
    @keys.removeWhere((obj) -> obj.citekeyFormat && obj.citekeyFormat != Zotero.BetterBibTeX.citekeyFormat)

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
    item = arguments[1] if arguments[0]._sandboxManager # the sandbox inserts itself in call parameters

    return item.journalAbbreviation if item.journalAbbreviation
    key = item.publicationTitle || item.reporter || item.code
    return unless key
    return unless Zotero.BetterBibTeX.pref.get('autoAbbrev')

    style = Zotero.BetterBibTeX.pref.get('autoAbbrevStyle') || (style for style in Zotero.Styles.getVisible() when style.usesAbbreviation)[0].styleID

    @journalAbbrevs['default']?['container-title']?[key] || Zotero.Cite.getAbbreviation(style, @journalAbbrevs, 'default', 'container-title', key)
    return @journalAbbrevs['default']?['container-title']?[key] || key

  extract: ->
    [item, insitu] = (if arguments[0]._sandboxManager then Array.slice(arguments, 1) else arguments)

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

  assign: (item, pin) ->
    {citekey, postfix: postfixStyle} = Zotero.BetterBibTeX.formatter.format(item)
    citekey = "zotero-#{if item.libraryID in [undefined, null] then 'null' else item.libraryID}-#{item.itemID}" if citekey in [undefined, null, '']
    return null unless citekey

    libraryID = @integer(if item.libraryID == undefined then Zotero.DB.valueQuery('select libraryID from items where itemID = ?', [item.itemID]) else item.libraryID)
    itemID = @integer(item.itemID)
    in_use = (key.citekey for key in @keys.where((o) -> o.libraryID == libraryID && o.itemID != itemID && o.citekey.indexOf(citekey) == 0))
    postfix = { n: -1, c: '' }
    while (citekey + postfix.c) in in_use
      postfix.n++
      if postfixStyle == '0'
        postfix.c = '-' + (postfix.n + 1)
      else
        postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)

    res = @set(item, citekey + postfix.c, pin)
    return res

  selected: (action) ->
    throw new Error("Unexpected action #{action}") unless action in ['set', 'reset']

    zoteroPane = Zotero.getActiveZoteroPane()
    items = (item for item in zoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote())

    for item in items
      @remove(item, action == 'set')

    if action == 'set'
      for item in items
        @assign(item, true)

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
    item.setField('extra', extra)
    item.save({skipDateModifiedUpdate: true})

  set: (item, citekey, pin) ->
    throw new Error('Cannot set empty cite key') if !citekey || citekey.trim() == ''

    # no keys for notes and attachments
    return unless @eligible(item)

    item = Zotero.Items.get(item.itemID) unless item.getField

    itemID = @integer(item.itemID)
    libraryID = @integer(item.libraryID)

    citekeyFormat = if pin then null else Zotero.BetterBibTeX.citekeyFormat
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

    for itemID in ids || []
      continue if pinned['' + itemID]
      @remove({itemID}, true)
      @get({itemID}, 'on-change')

  remove: (item, soft) ->
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
    return entry unless Zotero.BetterBibTeX.pref.get('debug') || Zotero.BetterBibTeX.testing

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
    return key if key in [undefined, null]
    clone = JSON.parse(JSON.stringify(key))
    delete clone.meta
    delete clone['$loki']

    @verify(clone)
    return clone

  get: ->
    [item, pinmode] = (if arguments[0]._sandboxManager then Array.slice(arguments, 1) else arguments)

    # no keys for notes and attachments

    if typeof item.key != 'undefined' && typeof item.libraryID != 'undefined'
      item = Zotero.Items.getByLibraryAndKey(item.libraryID, item.key)

    return unless @eligible(item)

    # pinmode can be:
    #  on-change: generate and pin if pinCitekeys is on-change, 'null' behavior if not
    #  on-export: generate and pin if pinCitekeys is on-export, 'null' behavior if not
    #  null: fetch -> generate -> return

    pin = (pinmode == Zotero.BetterBibTeX.pref.get('pinCitekeys'))
    cached = @keys.findOne({itemID: @integer(item.itemID)})

    # store new cache item if we have a miss or if a re-pin is requested
    cached = @assign(item, pin) if !cached || (pin && cached.citekeyFormat)
    return @clone(cached)

  resolve: (citekeys, libraryID) ->
    libraryID = null if libraryID == undefined
    libraryID = @integer(libraryID)
    citekeys = [citekeys] unless Array.isArray(citekeys)

    resolved = {}
    for citekey in citekeys
      resolved[citekey] = @keys.findObject({citekey, libraryID})
    return resolved

  alternates: ->
    [item] = (if arguments[0]._sandboxManager then Array.slice(arguments, 1) else arguments)

    return Zotero.BetterBibTeX.formatter.alternates(item)

