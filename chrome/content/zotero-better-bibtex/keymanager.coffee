Zotero.BetterBibTeX.keymanager = {}

Zotero.BetterBibTeX.keymanager.log = Zotero.BetterBibTeX.log

Zotero.BetterBibTeX.keymanager.init = ->
  # three-letter month abbreviations. I assume these are the same ones that the
  # docs say are defined in some appendix of the LaTeX book. (I don't have the
  # LaTeX book.)
  @months = [ 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec' ]
  @journalAbbrevCache = Object.create(null)
  @cache = Object.create(null)
  for row in Zotero.BetterBibTeX.DB.query('select itemID, citekey, citeKeyFormat from keys')
    @cache[row.itemID] = {citekey: row.citekey, citeKeyFormat: row.citeKeyFormat}
  @log('CACHE PRIMED', @cache)

  @__exposedProps__ = {
    months: 'r'
    journalAbbrev: 'r'
    extract: 'r'
    get: 'r'
    keys: 'r'
  }
  for own key, value of @__exposedProps__
    @[key].__exposedProps__ = []
  return @

Zotero.BetterBibTeX.keymanager.reset = (hard) ->
  if hard
    Zotero.BetterBibTeX.DB.query('delete from keys')
    Zotero.BetterBibTeX.DB.query('delete from cache')

  @cache = Object.create(null)
  @log('KEY CACHE CLEARED')
  return

Zotero.BetterBibTeX.keymanager.journalAbbrev = (item) ->
  item = arguments[1] if item._sandboxManager # the sandbox inserts itself in call parameters

  return item.journalAbbreviation if item.journalAbbreviation
  return unless Zotero.BetterBibTeX.pref.get('auto-abbrev')

  if typeof @journalAbbrevCache[item.publicationTitle] is 'undefined'
    styleID = Zotero.BetterBibTeX.pref.get('auto-abbrev.style')
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
        @journalAbbrevCache[title] = abbr

    @journalAbbrevCache[item.publicationTitle] ?= ''

  return @journalAbbrevCache[item.publicationTitle]

Zotero.BetterBibTeX.keymanager.extract = (item, clone) ->
  item = arguments[1] if item._sandboxManager
  switch
    when item.getField
      item = {extra: item.getField('extra')}
    when clone
      item = {extra: item.extra.slice(0)}
  return null unless item.extra

  embeddedKeyRE = /bibtex: *([^\s\r\n]+)/
  andersJohanssonKeyRE = /biblatexcitekey\[([^\]]+)\]/
  extra = item.extra

  m = embeddedKeyRE.exec(item.extra) or andersJohanssonKeyRE.exec(item.extra)
  return null unless m

  item.extra = item.extra.replace(m[0], '').trim()
  return m[1]

# TODO
Zotero.BetterBibTeX.keymanager.displayText = (item) ->
  citekey = Zotero.BetterBibTeX.DB.rowQuery('select citekey, citeKeyFormat from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0])

  return citekey ? @get(item) + '*'

Zotero.BetterBibTeX.keymanager.selected = (options) ->
  win = @windowMediator.getMostRecentWindow('navigator:browser')
  items = Zotero.Items.get((item.id for item in win.ZoteroPane.getSelectedItems() when !item.isAttachment() && !item.isNote()))

  for item in items
    @get(item, options)

Zotero.BetterBibTeX.keymanager.set = (item, citekey) ->
  if Zotero.BetterBibTeX.pref.get('key-conflict-policy') == 'change'
    # remove soft-keys that conflict with pinned keys
    Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey])

  # store new key
  Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, null)', [ item.itemID, item.libraryID || 0, citekey])

  @cached[item.itemID] = {citekey: citekey, citeKeyFormat: null}
  return

Zotero.BetterBibTeX.keymanager.remove = (item) ->
  Zotero.BetterBibTeX.DB.query('delete from keys where itemID = ?', [item.itemID])
  delete @cache[item.itemID]
  return

Zotero.BetterBibTeX.keymanager.get = (item, options) ->
  if item._sandboxManager
    item = arguments[1]
    options = arguments[2]

  # pinmode can be:
  #  reset: clear any pinned key, generate new dynamic key
  #  manual: generate and pin
  #  on-change: generate and pin if pin-citekeys is on-change, 'null' behavior if not
  #  on-export: generate and pin if pin-citekeys is on-export, 'null' behavior if not
  #  null: fetch -> generate -> return

  # legacy use, phase out later
  options = {pinmode: options} if (typeof options) == 'string' || (options instanceof String)

  cached = @cache[item.itemID] || Zotero.BetterBibTeX.DB.rowQuery('select citekey, citeKeyFormat from keys where itemID=? and libraryID = ?', [item.itemID, item.libraryID || 0]) || {}
  extra = {
    save: false
    body: ''
  }

  options.pinmode = 'manual' if options.pinmode == Zotero.BetterBibTeX.pref.get('pin-citekeys')
  citeKeyFormat = Zotero.BetterBibTeX.pref.get('citeKeyFormat')

  switch options.pinmode
    when 'reset', 'manual' # clear any pinned key
      if cached.citekey && !cached.citeKeyFormat
        extra = {save: true, body: @extract(item, true) }
        cached = {citekey: null, citeKeyFormat: (if options.pinmode == 'manual' then null else citeKeyFormat)}

  if !cached.citekey
    Formatter = Zotero.BetterBibTeX.formatter(citeKeyFormat)
    cached.citekey = new Formatter(Zotero.BetterBibTeX.toArray(item)).value
    postfix = { n: -1, c: '' }
    while Zotero.BetterBibTeX.DB.valueQuery('select count(*) from keys where citekey=? and libraryID = ? and itemID <> ?', [cached.citekey + postfix.c, item.libraryID || 0, item.itemID])
      postfix.n++
      postfix.c = String.fromCharCode('a'.charCodeAt() + postfix.n)

    cached.citekey += postfix.c
    cached.citeKeyFormat = (if options.pinmode == 'manual' then null else citeKeyFormat)
    citekey = { citekey: citekey + postfix.c, citeKeyFormat: pattern }

    # remove soft-keys that conflict with pinned keys
    Zotero.BetterBibTeX.DB.query('delete from keys where libraryID = ? and citeKeyFormat is not null and citekey = ?', [item.libraryID || 0, citekey.citekey])

    # store new key
    Zotero.BetterBibTeX.DB.query('insert or replace into keys (itemID, libraryID, citekey, citeKeyFormat) values (?, ?, ?, ?)', [ item.itemID, item.libraryID || 0, citekey.citekey, citekey.citeKeyFormat ])

    if options.pinmode == 'manual'
      extra.body += " \nbibtex: #{citekey.citekey}"
      extra.save = true

  if extra.save
    extra.body = extra.body.trim()
    item = Zotero.Items.get(item.itemID) if not item.getField
    if extra.body != item.getField('extra')
      item.setField('extra', extra.body)
      item.save()

  @cache[item.itemID] = cached

  return cached if options.metadata
  return cached.citekey

Zotero.BetterBibTeX.keymanager.keys = ->
  return Zotero.BetterBibTeX.DB.query('select * from keys order by libraryID, itemID')

