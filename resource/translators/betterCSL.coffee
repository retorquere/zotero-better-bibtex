doExport = ->
  items = []
  while item = Zotero.nextItem()
    continue if item.itemType == 'note' || item.itemType == 'attachment'

    cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, Translator.header)
    if cached
      csl = cached.bibtex
    else
      Zotero.BetterBibTeX.keymanager.extract(item, 'nextItem')
      fields = Translator.extractFields(item)
      csl = Zotero.Utilities.itemToCSLJSON(item)

      csl.issued = Zotero.BetterBibTeX.parseDateToArray(item.date) if csl.issued && item.date

      for name, value of fields
        continue unless value.format == 'csl'

        switch Translator.CSLVariables[name].type
          when 'date'
            csl[name] = Zotero.BetterBibTeX.parseDateToArray(value.value)

          when 'creator'
            creators = []
            for creator in value.value
              creator = {family: creator.lastName || '', given: creator.firstName || ''}
              Zotero.BetterBibTeX.CSL.parseParticles(creator)
              creators.push(creator)

            csl[name] = creators

          else
            csl[name] = value.value

      swap = {
        shortTitle: 'title-short'
        journalAbbreviation: 'container-title-short'
      }
      ### ham-fisted workaround for #365 ###
      swap.author = 'director' if csl.type in [ 'motion_picture', 'broadcast']

      for k, v of swap
        [csl[k], csl[v]] = [csl[v], csl[k]]

      citekey = csl.id = Zotero.BetterBibTeX.keymanager.get(item, 'on-export').citekey

      ### Juris-M workaround ###
      for author in item.author || []
        delete author.multi
      delete item.multi

      csl = serialize(csl)
      Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, csl)

    items.push(csl)

  Zotero.write(flush(items))
