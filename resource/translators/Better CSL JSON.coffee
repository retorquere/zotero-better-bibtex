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

    swap = {
      shortTitle: 'title-short'
      journalAbbreviation: 'container-title-short'
    }
    ### ham-fisted workaround for #365 ###
    swap.author = 'director' if json.type in [ 'motion_picture', 'broadcast']

    for k, v of swap
      [json[k], json[v]] = [json[v], json[k]]

    citekey = json.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey
    json = JSON.stringify(json)
    Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, json)
    items.push(json)

  items = "[\n" + ("  #{item}" for item in items).join(",\n") + "\n]\n"

  Zotero.write(items)
