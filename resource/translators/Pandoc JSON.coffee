doExport = ->
  caching = Translator.header.BetterBibTeX?.cache?.JSON

  items = []
  while item = Zotero.nextItem()
    continue if item.itemType == 'note' || item.itemType == 'attachment'
    if caching
      cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, Translator.header)
      if cached?.citekey
        items.push(cached.bibtex)
        continue

    Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem')
    fields = Translator.extractFields(item)
    json = Zotero.Utilities.itemToCSLJSON(item)

    json.issued = Zotero.BetterBibTeX.parseDateToArray(item.date) if json.issued && item.date

    for name, value of fields
      continue unless value.format == 'csl'

      if name in ['container', 'event-date', 'submitted', 'original-date', 'issued', 'accessed']
        json[name] = Zotero.BetterBibTeX.parseDateToArray(value.value)

      else
        json[name] = value.value

    citekey = json.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey
    Translator.debug('CSL: export', json)
    json = JSON.stringify(json)
    Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, json) if caching
    items.push(json)

  items = "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

  Zotero.write(items)
