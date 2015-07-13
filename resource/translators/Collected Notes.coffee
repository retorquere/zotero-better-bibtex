class Report
  constructor: ->
    @items = {}
    @data = [{level:1, title: Zotero.getOption('exportFilename').replace(/\.html$/i, ''), items: []}]

    while item = Zotero.nextItem()
      @items[item.itemID] = item if item.itemType == 'note' || item.notes?.length > 0

    @assigned = {}
    @unpack(Translator.collections, 2)
    for own itemID, item of @items
      @data[0].items.push(item) unless @assigned[itemID]

  unpack: (collection, level) ->
    return unless collection

    level = {level, title: collection.name, items: []}
    pos = @data.length
    @data.push(level)

    for itemID in collection.items || []
      item = @items[itemID]
      continue unless item
      @assigned[itemID] = true
      level.items.push(item)

    notes = level.items.length

    for coll in collection.collections || []
      notes += @unpack(coll, level + 1)

    @data = @data.slice(0, pos) if notes == 0

    return notes

doExport = ->
  report = new Report()

  html = ''
  for collection in report.data
    html += "<h#{ collection.level }>#{ MarkDown.marked(collection.title) }</h#{ collection.level }>\n"
    for item in collection.items
      continue unless item.itemType == 'note'
      html += "<div>#{ item.note }</div>\n"

    for item in collection.items
      continue if item.itemType == 'note'
      title = item.title

      creators = (Translator.creator(creator) for creator in item.creators)
      creators = (creator for creator in creators when creator)
      if creators.length > 0
        creators = creators.join(' and')
      else
        creators = null

      if item.date
        date = Zotero.Utilities.strToDate(item.date)
        if typeof date.year == 'undefined'
          date = item.date
        else
          date = Zotero.Utilities.strToISO(item.date)
      else
        date = null

      author = (str for str in [creators, date] when str)
      if author.length > 0
        author = "(#{author.join(', ')})"
      else
        author = null

      title = (str for str in [item.title || '', author] when str).join(' ')

      html += "<h#{ collection.level + 1}>#{ MarkDown.marked(title) }</h#{ collection.level + 1}>\n"

      for note in item.notes
        html += "<div>#{ note.note }</div>\n"

  Zotero.write(html)
