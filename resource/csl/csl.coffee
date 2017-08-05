Exporter = require('../lib/exporter.coffee')
debug = require('../lib/debug.coffee')
getCiteKey = require('../../content/getCiteKey.coffee')

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

date2csl = (date) ->
  throw new Error("Expected date, got #{date.type}") unless date.type == 'date'
  csl = [date.year]
  if date.month
    csl.push(date.month)
    if date.day
      csl.push(date.day)
  return csl
parseDate = (date) ->
  parsed = Zotero.BetterBibTeX.parseDate(date)
  switch parsed.type
    when 'date'
      return { 'date-parts': [ date2csl(parsed) ] }

    when 'interval'
      return { 'date-parts': [ date2csl(parsed.from), date2csl(parsed.to) ] }

    when 'verbatim'
      return { raw: parsed.verbatim }

    else
      throw new Error("Unexpected date type #{parsed.type}")
  return

class CSLExporter
  constructor: ->
    @Exporter = new Exporter()

  doExport: ->
    items = []
    while item = Zotero.BetterBibTeX.simplifyFields(Zotero.nextItem())
      continue if item.itemType == 'note' || item.itemType == 'attachment'

      ### TODO: caching ###
#      cached = Zotero.BetterBibTeX.cache.fetch(item.itemID, @Exporter.context)
#      if cached
#        csl = cached.bibtex
#      else
      if true
        citekey = getCiteKey(item.extra)
        item.extra = citekey.extra
        item.__citekey__ = citekey.citekey
        fields = @Exporter.extractFields(item)

        if item.accessDate # WTH is Juris-M doing with those dates?
          item.accessDate = item.accessDate.replace(/T?[0-9]{2}:[0-9]{2}:[0-9]{2}.*/, '').trim()

        csl = Zotero.Utilities.itemToCSLJSON(item)

        # 637
        delete csl['publisher-place']
        delete csl['archive-place']
        delete csl['event-place']
        delete csl['original-publisher-place']
        delete csl['publisher-place']
        csl[if item.itemType == 'presentation' then 'event-place' else 'publisher-place'] = item.place if item.place

        csl.type = item.cslType if item.cslType in ValidCSLTypes

        delete csl.authority
        csl.type = 'motion_picture' if item.__type__ == 'videoRecording' && csl.type == 'video'

        csl.issued = parseDate(item.date) if csl.issued && item.date

        debug('extracted:', fields)
        for name, value of fields
          continue unless value.format == 'csl'

          switch @Exporter.CSLVariables[name].type
            when 'date'
              csl[name] = parseDate(value.value)

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

        citekey = csl.id = item.__citekey__

        ### Juris-M workarounds to match Zotero as close as possible ###
        for kind in ['author', 'editor', 'director']
          for creator in csl[kind] || []
            delete creator.multi
        delete csl.multi
        delete csl.system_id
        if csl.accessed && csl.accessed.raw && (m = csl.accessed.raw.match(/^([0-9]{4})-([0-9]{2})-([0-9]{2})$/))
          csl.accessed = {"date-parts": [[ m[1], parseInt(m[2]), parseInt(m[3]) ]]}
        delete csl.genre if csl.type == 'broadcast' && csl.genre == 'television broadcast'

        csl = @serialize(csl)
        ###
        TODO: caching
        Zotero.BetterBibTeX.cache.store(item.itemID, @Exporter.context, citekey, csl)
        ###

      items.push(csl)

    Zotero.write(@flush(items))
    return

module.exports = CSLExporter
