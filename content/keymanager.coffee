debug = require('./debug.coffee')
parser = require('./keymanager/pattern-parser.pegjs')

class KeyManager
  init: Zotero.Promise.coroutine(->
    debug('KeyManager.init()')
    @query = {
      field: {}
      type: {}
      url: 'https://zotero/better-bibtex/citekey'
    }

    for field in yield Zotero.DB.queryAsync("select fieldID, fieldName from fields where fieldName in ('title', 'url')") # 110, 1
      @query.field[field.fieldName] = field.fieldID
    for type in yield Zotero.DB.queryAsync("select itemTypeID, typeName from itemTypes where typeName in ('note', 'attachment')") # 1, 14
      @query.type[type.typeName] = type.itemTypeID

    @query.citekeys = """
      select attachment.itemID, attachment.parentItemID, title_value.valueID, title_value.value as citekey
      from itemAttachments attachment
      join itemData title on title.fieldID = #{@query.field.title} and title.itemID = attachment.itemID
      join itemDataValues title_value on title_value.valueID = title.valueID
      join itemData url on url.fieldID = #{@query.field.url} and url.itemID = attachment.itemID
      join itemDataValues url_value on url_value.valueID = url.valueID and url_value.value = '#{@query.url}'
      where attachment.linkMode = #{Zotero.Attachments.LINK_MODE_LINKED_URL}
    """

    items = """
      with citekey as (#{@query.citekeys})
      select item.itemID
      from items item
      left join citekey on citekey.parentItemID = item.itemID
      where citekey.parentItemID is null
    """

    items = yield Zotero.DB.queryAsync(items)
    for item in (items || [])
      Zotero.debug("No citation key: #{item.itemID}")
      ## TODO: generate new key here

    ## TODO: Possibly only do these scans when extensions.zotero.translators.better-bibtex.scanCitekeys is set, then reset it

    ## TODO: find items with more than one citekey and delete all but one

    ## TODO: scan for 'bibtex:...' keys and move them to attachments

    @observerID = Zotero.Notifier.registerObserver(@, ['item'], 'BetterBibTeX.KeyManager', 100)

    debug('KeyManager.init() done')
    return
  )

  notify: Zotero.Promise.coroutine((action, type, ids, extraData) ->
    debug('KeyManager.notify', {action, type, ids, extraData})

    ## test for field updates https://groups.google.com/d/msg/zotero-dev/naAxXIbpDhU/7rM-5IKGBQAJ
    ids = (id for id in ids when !extraData[id].BetterBibTeX)
    debug('KeyManager.notify', {ids})

    for item in yield Zotero.Items.getAsync(ids)
      continue if item.isAttachment() || item.isNote()
      # continue if item.getField('extra')
      debug('KeyManager.notify: change extra', item.id)

      ## generate citation key if not pinned, store in attachment not extra
      item.setField('extra', 'updated')
      yield item.saveTx({
        notifierData: { BetterBibTeX: true }
      })

    return
  )
module.exports = new KeyManager()
