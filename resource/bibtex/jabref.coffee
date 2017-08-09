class JabRef
  constructor: (@collections) ->
    @citekeys = {}

  exportGroups: ->
    debug('exportGroups:', @collections)
    return if @collections.length == 0 || !BetterBibTeX.preferences.jabrefGroups

    switch
      when BetterBibTeX.preferences.jabrefGroups == 3
        meta = 'groupsversion:3'
      when BetterBibTeX.BetterBibLaTeX
        meta = 'databaseType:biblatex'
      else
        meta = 'databaseType:bibtex'

    Zotero.write("@comment{jabref-meta: #{meta};}\n")
    Zotero.write('@comment{jabref-meta: groupstree:\n')
    Zotero.write(@exportGroup({collections: @collections}))
    Zotero.write(';\n')
    Zotero.write('}\n')
    return

  assignToGroups: (item, collection) ->
    return unless @collections && BetterBibTeX.preferences.jabrefGroups == 4

    collection = {items: [], collections: @collections} unless collection

    if item.itemID in collection.items
      item.groups ||= []
      item.groups.push(collection.name)
      item.groups.sort() if BetterBibTeX.preferences.testing

    for coll in collection.collections
      @assignToGroups(item, coll)
    return

  serialize: (list, wrap) ->
    serialized = (elt.replace(/\\/g, '\\\\').replace(/;/g, '\\;') for elt in list)
    serialized = (elt.match(/.{1,70}/g).join("\n") for elt in serialized) if wrap
    return serialized.join(if wrap then ";\n" else ';')

  exportGroup: (collection, level = 0) ->
    if level
      collected = ["#{level} ExplicitGroup:#{collection.name}", '0']
      if BetterBibTeX.preferences.jabrefGroups == 3
        references = (@citekeys[id] for id in (collection.items || []) when @citekeys[id])
        references.sort() if BetterBibTeX.preferences.testing
        collected = collected.concat(references)
      # what is the meaning of the empty cell at the end, JabRef?
      collected = collected.concat([''])
    else
      collected = ['0 AllEntriesGroup:']

    collected = [@serialize(collected)]

    for child in collection.collections || []
      collected = collected.concat(@exportGroup(child, level + 1))

    if level
      return collected
    else
      return @serialize(collected, true)

module.exports = JabRef
