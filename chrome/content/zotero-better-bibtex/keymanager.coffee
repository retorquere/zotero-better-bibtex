Zotero.BetterBibTeX.keymanager = new class
  constructor: ->
    @log = Zotero.BetterBibTeX.log
    @journalAbbrevs = Object.create(null)
    @keys = Zotero.BetterBibTeX.Cache.addCollection('keys')
    @keys.on('insert', (data) -> Zotero.BetterBibTeX.debug("keymanager.get: loki insert #{JSON.stringify(data)}"))
    @keys.on('update', (data) -> Zotero.BetterBibTeX.debug("keymanager.get: loki update #{JSON.stringify(data)}"))
    @keys.on('delete', (data) -> Zotero.BetterBibTeX.debug("keymanager.get: loki delete #{JSON.stringify(data)}"))

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
    cache = []
    for key in @keys.where((obj) -> true)
      key = JSON.parse(JSON.stringify(key))
      # remove metadata
      delete key.meta
      delete key['$loki']
      cache.push(key)
    return cache

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
    Zotero.BetterBibTeX.debug("keymanager.selected: #{action}")

    zoteroPane = Zotero.getActiveZoteroPane()
    items = Zotero.Items.get((item.id for item in zoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote()))

    throw new Error("Unexpected action #{action}") unless action in ['set', 'reset']

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
      Zotero.BetterBibTeX.debug("keymanager.save: no change", Zotero.BetterBibTeX.log.object(extra), citekey, !!(extra.__citekey__ == citekey), !citekey, !extra.__citekey__)
      return

    extra = extra.extra
    extra += " \nbibtex: #{citekey}" if citekey
    extra = extra.trim()
    if extra == item.getField('extra')
      Zotero.BetterBibTeX.debug("keymanager.save: no change, but not expected here!")
      return

    if citekey
      Zotero.BetterBibTeX.debug("keymanager.save(#{item.itemID}), set key #{citekey}")
    else
      Zotero.BetterBibTeX.debug("keymanager.save(#{item.itemID}), remove key")
    item.setField('extra', extra)
    item.save()

  set: (item, citekey, pin) ->
    Zotero.BetterBibTeX.debug("keymanager.set: #{item.itemID}, #{citekey}, #{!!pin}")

    throw new Error('Cannot set empty cite key') if !citekey || citekey.trim() == ''

    # no keys for notes and attachments
    return unless @eligible(item)

    item = Zotero.Items.get(item.itemID) unless item.getField

    itemID = @integer(item.itemID)
    libraryID = @integer(item.libraryID)

    if pin && Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
      # remove soft-keys which conflict with pinned keys
      @keys.removeWhere((o) -> o.citekey == citekey && o.libraryID == libraryID && o.itemID != itemID && o.citekeyFormat)

    # store new key
    key = @keys.findOne({itemID})
    citekeyFormat = if pin then null else Zotero.BetterBibTeX.pref.get('citekeyFormat')
    if key
      key.citekey = citekey
      key.citekeyFormat = citekeyFormat
      @keys.update(key)
    else
      key = {itemID, libraryID, citekey, citekeyFormat}
      @keys.insert(key)

    @save(item, citekey) if pin

    return key

  remove: (item, soft) ->
    Zotero.BetterBibTeX.debug("keymanager.remove: #{item.itemID}, soft: #{!!soft}")

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
    return type not in ['note', 'attachment']

  get: (item, pinmode) ->
    if item._sandboxManager
      item = arguments[1]
      pinmode = arguments[2]

    Zotero.BetterBibTeX.debug("keymanager.get: getting key for #{item.itemID}: #{pinmode}")

    # no keys for notes and attachments
    return unless @eligible(item)

    # pinmode can be:
    #  on-change: generate and pin if pinCitekeys is on-change, 'null' behavior if not
    #  on-export: generate and pin if pinCitekeys is on-export, 'null' behavior if not
    #  null: fetch -> generate -> return

    pin = (pinmode == Zotero.BetterBibTeX.pref.get('pinCitekeys'))
    cached = @keys.findOne({itemID: @integer(item.itemID)})

    # if we have a cache hit which is pinned, or no pinning is requested, return it
    return cached if cached && (!pin || !cached.citekeyFormat)
    return @set(item, @free(item), pin)

  resolve: (citekeys, libraryID) ->
    try
      libraryID = @integer(libraryID)
    catch
      libraryID = null
    return (key.itemID for key in @keys.find({citekey: { '$in': citekeys }, libraryID: libraryID})) if Array.isArray(citekeys)
    return (key.itemID for key in @keys.find({citekey: citekeys, libraryID: libraryID}))

