#BetterBibTeXAutoExportPref =
#  remove: ->
#    exportlist = document.getElementById('better-bibtex-export-list')
#    selected = exportlist.currentIndex
#    return if selected < 0
#
#    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')
#    Zotero.BetterBibTeX.DB.collection.autoexport.remove(parseInt(id))
#    @refresh()
#
#  mark: ->
#    exportlist = document.getElementById('better-bibtex-export-list')
#    selected = exportlist.currentIndex
#    return if selected < 0
#
#    id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))
#
#    ae = Zotero.BetterBibTeX.DB.collection.autoexport.get(id)
#    if !ae
#      Zotero.BetterBibTeX.debug('No autoexport', id)
#      return
#
#    try
#      translate = Zotero.BetterBibTeX.auto.prepare(ae)
#    catch err
#      Zotero.BetterBibTeX.debug('failed to prepare', ae, err)
#      return
#
#    Zotero.BetterBibTeX.auto.run(ae, translate, 'manual refresh')
#
#  exportType: (id) ->
#    return switch
#      when id == '' then ''
#      when id == 'library' then 'library'
#      when m = /^(library|search|collection):[0-9]+$/.exec(id) then m[1]
#      else id
#
#  exportName: (id, full) ->
#    try
#      name = switch
#        when id == '' then ''
#        when id == 'library' then Zotero.Libraries.getName()
#        when m = /^library:([0-9]+)$/.exec(id) then Zotero.Libraries.getName(m[1])
#        when m = /^search:([0-9]+)$/.exec(id) then Zotero.Searches.get(m[1])?.name
#        when m = /^collection:([0-9]+)$/.exec(id) then (if full then @collectionPath(m[1]) else Zotero.Collections.get(m[1])?.name)
#      return name || id
#    catch err
#      return "not found: #{id}"
#
#  collectionPath: (id) ->
#    return '' unless id
#    coll = Zotero.Collections.get(id)
#    return '' unless coll
#
#    return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
#    return coll.name
#
#  refresh: ->
#    exportlist = document.getElementById('better-bibtex-auto-exports')
#    while exportlist.firstChild
#      exportlist.removeChild(exportlist.firstChild)
#
#    tree = new BetterBibTeXAutoExport('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', exportlist, document)
#
#    for ae in Zotero.BetterBibTeX.DB.collection.autoexport.chain().simplesort('path').data()
#      Zotero.BetterBibTeX.debug('refresh:', {id: ae.$loki, status: ae.status})
#      status = "#{ae.status} (#{ae.updated})"
#      tree.treeitem({autoexport: "#{ae['$loki']}", '': ->
#        @treerow(->
#          @treecell({editable: 'false', label: "#{BetterBibTeXAutoExportPref.exportType(ae.collection)}: #{BetterBibTeXAutoExportPref.exportName(ae.collection)}"})
#          @treecell({editable: 'false', label: status})
#          @treecell({editable: 'false', label: ae.path})
#          @treecell({editable: 'false', label: Zotero.BetterBibTeX.Translators.getName(ae.translatorID)})
#          @treecell({editable: 'false', label: ae.exportCharset})
#          @treecell({editable: 'false', label: '' + ae.useJournalAbbreviation})
#          @treecell({editable: 'false', label: '' + ae.exportNotes})
#        )
#      })
#
#class BetterBibTeXAutoExport extends Zotero.BetterBibTeX.XmlNode
#  constructor: (@namespace, @root, @doc) ->
#    super(@namespace, @root, @doc)
#
#  Node: BetterBibTeXAutoExport
#
#  BetterBibTeXAutoExport::alias(['treerow', 'treeitem', 'treecell', 'treechildren', 'listitem'])
