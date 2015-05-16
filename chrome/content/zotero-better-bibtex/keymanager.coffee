Zotero.BetterBibTeX.keymanager = new class
  constructor: ->
    @log = Zotero.BetterBibTeX.log
    @journalAbbrevs = Object.create(null)
    @keys = Zotero.BetterBibTeX.Cache.addCollection('keys')
    #@keys.on('insert', (data) -> Zotero.debug("keymanager.get: loki insert #{JSON.stringify(data)}"))
    #@keys.on('update', (data) -> Zotero.debug("keymanager.get: loki update #{JSON.stringify(data)}"))

    # three-letter month abbreviations. I assume these are the same ones that the
    # docs say are defined in some appendix of the LaTeX book. (I don't have the
    # LaTeX book.)
    @months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]

    @__exposedProps__ = {
      months: 'r'
      journalAbbrev: 'r'
      extract: 'r'
      get: 'r'
      keys: 'r'
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
      @log('key:', key)

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
    Zotero.DB.beginTransaction()

    for change in @keys.getChanges()
      o = change.obj
      switch change.operation
        when 'I', 'U'
          Zotero.DB.query('insert or update into betterbibtex.keys (itemID, citekey, citekeyFormat) values (?, ?, ?)', [o.itemID, o.citekey, o.citekeyFormat])
        when 'R'
          Zotero.DB.query('delete from betterbibtex.keys where itemID = ?', [o.itemID])

    Zotero.DB.commitTransaction()
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
    return item

  selected: (pinmode) ->
    zoteroPane = Zotero.getActiveZoteroPane()
    items = Zotero.Items.get((item.id for item in zoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote()))

    for item in items
      @get(item, pinmode)

  set: (item, citekey) ->
    throw new Error('Cannot set empty cite key') if !citekey || citekey.trim() == ''

    if Zotero.BetterBibTeX.pref.get('keyConflictPolicy') == 'change'
      # remove soft-keys that conflict with pinned keys
      @keys.removeWhere({citekey: { '$eq': citekey }, libraryID: { '$eq': item.libraryID || null }, citekeyFormat: { '$ne' : null }})

    # store new key
    key = @keys.findOne({itemID: @integer(item.itemID)})
    if key
      key.citekey = citekey
      key.citekeyFormat = null
      @keys.update(key)
    else
      @keys.insert({itemID: @integer(item.itemID), libraryID: item.libraryID, citekey: citekey, citekeyFormat: null})

  remove: (item) ->
    @keys.removeWhere({itemID: @integer(item.itemID)})

  resolve: (citekeys, libraryID) ->
    try
      libraryID = @integer(libraryID)
    catch
      libraryID = null
    return (key.itemID for key in @keys.find({citekey: { '$in': citekeys }, libraryID: libraryID})) if Array.isArray(citekeys)
    return (key.itemID for key in @keys.find({citekey: citekeys, libraryID: libraryID}))

  get: (item, pinmode) ->
    if item._sandboxManager
      item = arguments[1]
      pinmode = arguments[2]

    # pinmode can be:
    #  reset: clear any pinned key, generate new dynamic key
    #  manual: generate and pin
    #  on-change: generate and pin if pinCitekeys is on-change, 'null' behavior if not
    #  on-export: generate and pin if pinCitekeys is on-export, 'null' behavior if not
    #  null: fetch -> generate -> return

    pinmode = 'manual' if pinmode == Zotero.BetterBibTeX.pref.get('pinCitekeys')
    itemID = @integer(item.itemID)
    libraryID = @integer(item.libraryID || Zotero.DB.valueQuery('select libraryID from items where itemID = ?', [item.itemID]) || null)
    citekeyFormat = Zotero.BetterBibTeX.pref.get('citekeyFormat')

    cached = @keys.findOne({itemID})

    todo = {}

    if pinmode in ['reset', 'manual'] # clear any pinned key
      if cached && !cached.citekeyFormat # if we've found a key and it was pinned
        todo.citekeyFormat = (if pinmode == 'manual' then null else citekeyFormat)

    if !cached || pinmode in ['reset', 'manual'] # generate new key
      Formatter = Zotero.BetterBibTeX.formatter(citekeyFormat)
      citekey = (new Formatter(Zotero.BetterBibTeX.toArray(item))).value
      postfix = { n: -1, c: '' }
      keys = (key.citekey for key in @keys.where((o) -> o.libraryID == libraryID && o.itemID != itemID && o.citekey.indexOf(citekey) == 0 && (o.citekey.length - citekey.length) in [0, 1]))
      while (citekey + postfix.c) in keys
        postfix.n++
        postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)

      todo.citekey = citekey + postfix.c
      todo.citekeyFormat = (if pinmode == 'manual' then null else citekeyFormat)

    if cached
      unless (todo.citekey == undefined || todo.citekey == cached.citekey) && (todo.citekeyFormat == undefined || todo.citekeyFormat == cached.citekeyFormat)
        cached.citekey = todo.citekey
        cached.citekeyFormat = todo.citekeyFormat
        @keys.update(cached)
    else
      cached = {itemID: itemID, libraryID: libraryID, citekey: todo.citekey, citekeyFormat: todo.citekeyFormat}
      @keys.insert(cached)

    if pinmode in ['reset', 'manual']
      item = Zotero.Items.get(item.itemID) unless item.getField || item.extra
      extra = @extract(item)
      switch pinmode
        when 'reset'
          if extra
            item = Zotero.Items.get(item.itemID) if not item.getField
            item.setField('extra', extra.extra)
            item.save()

        when 'manual'
          unless extra?.__citekey__ == cached.citekey
            extra = if extra then extra.extra else ''
            item = Zotero.Items.get(item.itemID) if not item.getField
            item.setField('extra', "#{extra} \nbibtex: #{cached.citekey}".trim())
            item.save()

    return cached
