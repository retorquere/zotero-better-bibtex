ValidCSLTypes = [
  'article'
  'article-magazine'
  'article-newspaper'
  'article-journal'
  'review'
  'review-book'
  'bill'
  'broadcast'
  'dataset'
  'figure'
  'graphic'
  'interview'
  'legislation'
  'legal_case'
  'map'
  'motion_picture'
  'musical_score'
  'patent'
  'post'
  'post-weblog'
  'personal_communication'
  'song'
  'speech'
  'treaty'
  'webpage'
  'book'
  'chapter'
  'entry'
  'entry-dictionary'
  'entry-encyclopedia'
  'manuscript'
  'pamphlet'
  'paper-conference'
  'report'
  'thesis'
]

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
      csl['archive-place'] ?= item.place

      csl.type = item.cslType if item.cslType in ValidCSLTypes

      delete csl.authority
      csl.type = 'motion_picture' if item.__type__ == 'videoRecording' && csl.type == 'video'

      csl.issued = Zotero.BetterBibTeX.parseDateToArray(item.date) if csl.issued && item.date

      Translator.debug('extracted:', fields)
      for name, value of fields
        continue unless value.format == 'csl'

        switch Translator.CSLVariables[name].type
          when 'date'
            csl[name] = Zotero.BetterBibTeX.parseDateToArray(value.value)

          when 'creator'
            creators = []
            for creator in value.value
              creator = {family: creator.name || creator.lastName || '', given: creator.firstName || '', isInstitution: (if creator.name then 1 else undefined)}
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

      ### Juris-M workarounds to match Zotero as close as possible ###
      for kind in ['author', 'editor', 'director']
        for creator in csl[kind] || []
          delete creator.multi
      delete csl.multi
      delete csl.system_id
      if csl.accessed && csl.accessed.raw && (m = csl.accessed.raw.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/))
        csl.accessed = {"date-parts": [[ m[1], parseInt(m[2]), parseInt(m[3]) ]]}
      delete csl.genre if csl.type == 'broadcast' && csl.genre == 'television broadcast'

      csl = serialize(csl)
      Zotero.BetterBibTeX.cache.store(item.itemID, Translator.header, citekey, csl)

    items.push(csl)

  Zotero.write(flush(items))
