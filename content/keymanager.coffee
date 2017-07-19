debug = require('./debug.coffee')

class KeyManager
  init: Zotero.Promise.coroutine ->
    debug('KeyManager.init()')
    @query = {
      field: {}
      type: {}
      url: 'zotero://better-bibtex/citekey'
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

    nokey = """
      with citekey as (#{@query.citekeys})
      select item.itemID
      from items item
      left join citekey on citekey.parentItemID = item.itemID
      where citekey.parentItemID is null
    """

    nokeys = yield Zotero.DB.queryAsync(nokey)
    for item in (nokeys || [])
      Zotero.debug("No citation key: #{item.itemID}")

    debug('KeyManager.init() done')
    return

module.exports = new KeyManager()
