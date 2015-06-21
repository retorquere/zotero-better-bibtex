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

Template = '''
  {% for collection in collections %}
    <div class="collection">
      <h{{ collection.level }}>{{ collection.title }}</h{{ collection.level }}>
      {% for item in collection.items %}
        <fieldset class="note">
          {% if item.itemType == 'note' %}
            <div class="standalone">
              {{ item.note | safe }}
            </div>
          {% else %}
            <legend>{{ item.title }}</legend>
            {% for note in item.notes %}
              <div class="child">
                {{ note.note | safe }}
              </div>
            {% endfor %}
          {% endif %}
        </fieldset>
      {% endfor %}
    </div>
  {% endfor %}
  '''

doExport = ->
  report = new Report()
  Translator.nunjucks.configure({ autoescape: true })
  Zotero.write(Translator.nunjucks.renderString(Template, {collections: report.data}))
