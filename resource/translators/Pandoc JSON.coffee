doExport = ->
  items = []
  while item = Zotero.nextItem()
    continue if item.itemType == 'note' || item.itemType == 'attachment'

    Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem')
    fields = Translator.extractFields(item)
    json = Zotero.Utilities.itemToCSLJSON(item)

    json.issued = Zotero.BetterBibTeX.parseDateToArray(item.date) if json.issued && item.date

    for name, value of fields
      continue unless value.format == 'csl'

      switch Translator.CSLVariables[name].type
        when 'date'
          json[name] = Zotero.BetterBibTeX.parseDateToArray(value.value)

        when 'creator'
          creators = []
          for creator in value.value
            creator = {family: creator.lastName || '', given: creator.firstName || ''}
            Zotero.BetterBibTeX.CSL.parseParticles(creator)
            creators.push(creator)

          json[name] = creators

        else
          json[name] = value.value

    # ham-fisted workaround for #365
    if json.type in [ 'motion_picture', 'broadcast'] && json.author
      json.director = json.author
      delete json.author

    citekey = json.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey
    json = JSON.stringify(json)
    Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, json)
    items.push(json)

  items = "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

  Zotero.write(items)
