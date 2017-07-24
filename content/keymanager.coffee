debug = require('./debug.coffee')
co = Zotero.Promise.coroutine

class KeyManager
  init: co(->
    debug('KeyManager.init()')
    @query = {
      field: {}
      type: {}
    }

    for field in yield Zotero.DB.queryAsync("select fieldID, fieldName from fields where fieldName in ('extra')")
      @query.field[field.fieldName] = field.fieldID
    for type in yield Zotero.DB.queryAsync("select itemTypeID, typeName from itemTypes where typeName in ('note', 'attachment')") # 1, 14
      @query.type[type.typeName] = type.itemTypeID

    @query.select = """
      select item.itemID, item.libraryID, extra.value as extra
      from items item
      left join itemData field on field.fieldID = #{@query.field.extra} and field.itemID = item.itemID
      left join itemDataValues extra on extra.valueID = field.valueID
      where item.itemTypeId not in (#{@query.type.attachment}, #{@query.type.note})
    """

    @formatter = require('./keymanager/formatter.coffee')

    @observerID = Zotero.Notifier.registerObserver(@, ['item'], 'BetterBibTeX.KeyManager', 100)

    yield @update()

    debug('KeyManager.init() done')
    return
  )

  notify: co((action, type, ids, extraData) ->
    debug('KeyManager.notify', {action, type, ids, extraData})

    ## TODO: test for field updates https://groups.google.com/d/msg/zotero-dev/naAxXIbpDhU/7rM-5IKGBQAJ

    ## skip saves we caused ourselves
    ids = (id for id in ids when !extraData[id].BetterBibTeX)
    debug('KeyManager.notify', {ids})

    yield @update(ids)

    return
  )

  citekeyRE: /(?:^|\n)bibtex(\*?):([^\n]+)(?:\n|$)/

  # update finds all references without citation keys, and all dynamic references that are marked to be overridden -- either
  # an array of ids, or the string '*' for all dynamic references (only to be used when the pattern changes)
  update: co((override = []) ->
    citekeys = {}
    update = []

    start = new Date()
    debug('citekey scan start')
    items = yield Zotero.DB.queryAsync(@query.select)
    for item in items
      citekeys[item.libraryID] ||= {}

      [dynamic, citekey] = (@citekeyRE.exec(item.extra || '') || ['*', ''])
      switch
        when !dynamic
          citekeys[item.ibraryID][citekey] = true

        when override == '*' || (override.length && item.itemID in override)
          update.push(item.itemID)

        else
          citekeys[item.ibraryID][citekey] = true
    debug('citekey scan complete:', new Date() - start)

    return unless update.length

    basechar = 'a'.charCodeAt(0) - 1

    items = yield Zotero.Items.get(update)
    for item in items
      extra = item.getField('extra') || ''

      [dynamic, citekey] = (@citekeyRE.exec(item.extra || '') || ['*', ''])
      proposed = @formatter.format(item)

      # let's see if we can keep this citekey
      if citekey && !citekeys[item.ibraryID][citekey]
        # citekey is unchanged and also not taken -- rare
        if citekey == proposed.citekey
          citekeys[item.ibraryID][citekey] = true
          continue

        if citekey.startsWith(proposed.citekey)
          if proposed.postfix == '0'
            if citekey.substr(proposed.citekey.length).match(/-[0-9]+$/)
              citekeys[item.ibraryID][citekey] = true
              continue
          else
            if citekey.substr(proposed.citekey.length).match(/[a-z]$/)
              citekeys[item.ibraryID][citekey] = true
              continue

      # perhaps no postfixing is required
      if !citekeys[item.ibraryID][proposed.citekey]
        citekey = proposed.citekey

      # seek free postfix
      else
        postfix = 1
        while true
          citekey = proposed.citekey + (if proposed.postfix == '0' then '-' + postfix else String.fromCharCode(basechar + postfix))
          break unless citekeys[item.ibraryID][citekey]
          postfix += 1

      extra = extra.replace(@citekeyRE, "\n").trim()
      extra += "\nbibtex*:" + citekey
      extra = extra.trim()

      item.setField('extra', extra)
      yield item.saveTx({ notifierData: { BetterBibTeX: true } })

    return
  )

module.exports = new KeyManager()
