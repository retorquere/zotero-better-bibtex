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

class TagSoupParser
  constructor: (html) ->
    @html = ''

    HTMLParser(html, @)

  start: (tag, attrs, unary) ->
    return if tag.toLowerCase() == 'script'

    attributes = (" #{attr.name}='#{attr.escaped}'" for attr in attrs).join('')
    @html += "<#{tag}#{attributes}#{(if unary then '/' else '')}>"

  end: (tag) ->
    return if tag.toLowerCase() == 'script'

    @html += "</#{tag}>"

  chars: (text) ->
    @html += text

  comment: (text) ->
    @html += "<!--#{text}-->"

clean = (html) ->
  return (new TagSoupParser(html)).html

doExport = ->
  report = new Report()

  html = ''
  for collection in report.data
    html += "<div class='collection'>\n<h#{ collection.level }>#{ clean(collection.title) }</h#{ collection.level }>"
    for item in collection.items
      html += "<fieldset class='note'>\n"
      if item.itemType == 'note'
        html += "<div class='standalone'>\n#{ clean(item.note) }\n</div>\n"
      else
        html += "<legend>#{ clean(item.title) }\n</legend>\n"
        for note in item.notes
          html += "<div class='child'>\n#{ clean(note.note) }\n</div>\n"
      html += "</fieldset>\n"
    html += "</div>\n"

  Zotero.write(html)
