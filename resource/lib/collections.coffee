sanitize = (coll) ->
  sane = {
    name: coll.name
    collections: []
    items: []
  }

  for c in coll.children || coll.descendents
    switch c.type
      when 'item'       then sane.items.push(c.id)
      when 'collection' then sane.collections.push(@sanitizeCollection(c))
      else              throw "Unexpected collection member type '#{c.type}'"

  sane.collections.sort( ( (a, b) -> a.name.localeCompare(b.name) ) ) if BetterBibTeX.preferences.testing

  return sane

collections = null
module.exports = ->
  if !collections && Zotero.nextCollection && BetterBibTeX.header.configOptions?.getCollections
    collections = []
    while collection = Zotero.nextCollection()
      collections.push(@sanitizeCollection(collection))
  return collections
