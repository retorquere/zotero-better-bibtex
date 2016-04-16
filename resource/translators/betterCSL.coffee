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

      if item.accessDate # WTH is Juris-M doing with those dates?
        item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()

      csl = Zotero.Utilities.itemToCSLJSON(item)
      csl['archive-place'] = item.place if item.place && !csl['archive-place']

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

      ### Juris-M workarounds ###
      for author in csl.author || []
        delete author.multi
      for editor in csl.editor || []
        delete editor.multi
      delete csl.multi
      delete csl.system_id
      if csl.accessed && csl.accessed.raw && (m = csl.accessed.raw.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/))
        csl.accessed = {"date-parts": [[ m[1], parseInt(m[2]), parseInt(m[3]) ]]}

      csl = serialize(csl)
      Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, csl)

    items.push(csl)

  Zotero.write(flush(items))
