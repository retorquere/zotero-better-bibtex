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

    json = Zotero.Utilities.itemToCSLJSON(item)
    citekey = json.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey
    json = JSON.stringify(json)
    Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, json) if caching
    items.push(json)

  items = "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

  Zotero.write(items)
