class JabRef
  constructor: (@collections) ->
    @citekeys = {}

  exportGroups: ->
    debug('exportGroups:', @collections)
    return if Object.keys(@collections).length == 0 || !BetterBibTeX.preferences.jabrefGroups

    switch
      when BetterBibTeX.preferences.jabrefGroups == 3
        meta = 'groupsversion:3'
      when BetterBibTeX.BetterBibLaTeX
        meta = 'databaseType:biblatex'
      else
        meta = 'databaseType:bibtex'

    Zotero.write("@comment{jabref-meta: #{meta};}\n")
    Zotero.write('@comment{jabref-meta: groupstree:\n')
    Zotero.write('0 AllEntriesGroup:;\n')
    for key, collection of @collections
      continue unless collection.root
      Zotero.write(@exportGroup(collection, 1))
    Zotero.write(';\n')
    Zotero.write('}\n')
    return

  serialize: (list, wrap) ->
    serialized = (elt.replace(/\\/g, '\\\\').replace(/;/g, '\\;') for elt in list)
    serialized = (elt.match(/.{1,70}/g).join("\n") for elt in serialized) if wrap
    return serialized.join(if wrap then ";\n" else ';')

  exportGroup: (collection, level) ->
    collected = ["#{level} ExplicitGroup:#{collection.name}", '0']
    if BetterBibTeX.preferences.jabrefGroups == 3
      references = (@citekeys[id] for id in (collection.items || []) when @citekeys[id])
      references.sort() if BetterBibTeX.preferences.testing
      collected = collected.concat(references)
    # what is the meaning of the empty cell at the end, JabRef?
    collected = collected.concat([''])

    collected = [@serialize(collected)]

    for child in collection.collections || []
      collected = collected.concat(@exportGroup(child, level + 1))

    if level
      return collected
    else
      return @serialize(collected, true)

module.exports = JabRef
