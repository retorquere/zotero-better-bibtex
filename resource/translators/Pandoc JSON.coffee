parseDate = (date) ->
  date = Zotero.Utilities.strToDate(date)

  date.year = parseInt(date.year) if date.year
  return null if typeof date.year != 'number'
  return [date.year] if !date.month && typeof date.month != 'number'
  return [date.year, date.month + 1] if !date.day && typeof date.day != 'number'
  return [date.year, date.month + 1, date.day]

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

    for name, value of fields
      switch
        when value.format == 'csl' && name in ['issued', 'accessed']
          dates = value.value.split('/')
          cslDates = (parseDate(date) for date in dates)
          cslDates = (date for date in cslDates when date)

          switch
            when cslDates.length not in [1, 2] || cslDates.length != dates.length
              json[name] = {literal: value.value}
            when cslDates.length == 1
              json[name] = {'date-parts': cslDates[0]}
            else
              json[name] = {'date-parts': cslDates}

        when value.format == 'csl'
          json[name] = value.value

        when name in ['PMCID', 'PMID', 'DOI']
          json[name] = value.value

    citekey = json.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey
    json = JSON.stringify(json)
    Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, json) if caching
    items.push(json)

  items = "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

  Zotero.write(items)
