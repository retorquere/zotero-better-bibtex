debug = require('../debug.coffee')

XmlNode = require('../xmlnode.coffee')
AutoExport = require('../auto-export.coffee')
Translators = require('../translators.coffee')

module.exports = AutoExportPrefs =
  remove: ->
    return unless exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport')
    Autoexport.db.remove(id)
    @refresh()
    return

  mark: ->
    return unless exportlist = document.getElementById('better-bibtex-export-list')
    selected = exportlist.currentIndex
    return if selected < 0

    id = parseInt(exportlist.contentView.getItemAtIndex(selected).getAttribute('autoexport'))
    AutoExport.run(id)
    @refresh()
    return

  name: (ae, full) ->
    switch ae.type
      when 'library'
        name = Zotero.Libraries.getName(ae.id)
      when 'collection'
        if full
          name = @collectionPath(ae.id)
        else
          name = Zotero.Collections.get(ae.id)
    return name || ae.path

  collectionPath: (id) ->
    return '' unless id
    coll = Zotero.Collections.get(id)
    return '' unless coll

    return @collectionPath(coll.parent) + '/' + coll.name if coll.parent
    return coll.name

  refresh: ->
    return unless exportlist = document.getElementById('better-bibtex-auto-exports')
    while exportlist.firstChild
      exportlist.removeChild(exportlist.firstChild)

    tree = new XUL('http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul', exportlist, document)

    for ae in AutoExport.chain().simplesort('path').data()
      debug('refresh:', {id: ae.$loki, status: ae.status})
      tree.treeitem({autoexport: "#{ae.$loki}", '': ->
        return @treerow(->
          @treecell({editable: 'false', label: "#{ae.type}: #{AutoExportPref.name(ae.collection)}"})
          @treecell({editable: 'false', label: "#{ae.status} (#{ae.updated})" })
          @treecell({editable: 'false', label: ae.path})
          @treecell({editable: 'false', label: Translators.byId[ae.translatorID]?.label || '??'})
          @treecell({editable: 'false', label: '' + ae.useJournalAbbreviation})
          @treecell({editable: 'false', label: '' + ae.exportNotes})
          return
        )
      })
    return

class XUL extends XmlNode
  constructor: (@namespace, @root, @doc) ->
    super(@namespace, @root, @doc)

  Node: XUL

  XUL::alias(['treerow', 'treeitem', 'treecell', 'treechildren', 'listitem'])
