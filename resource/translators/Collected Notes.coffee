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
    html += "<h#{ collection.level }>#{ HTMLtoXML(collection.title) }</h#{ collection.level }>"
    for item in collection.items
      continue unless item.itemType == 'note'
      html += '<div>' + HTMLtoXML(item.note) + '</div>'

    for item in collection.items
      continue if item.itemType == 'note'
      html += "<h#{ collection.level + 1}>#{ HTMLtoXML(collection.title) }</h#{ collection.level + 1}>"

      for note in item.notes
        html += "<div>\n#{ HTMLtoXML(note.note) }\n</div>\n"

  Zotero.write(LaTeX.html2latex(html))
