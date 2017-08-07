debug = require('./debug.coffee')

module.exports = (paths...) ->
  f = Zotero.getZoteroDirectory()
  throw new Error('no path specified') if paths.length == 0

  paths.unshift('better-bibtex')
  debug('createFile:', paths)

  leaf = paths.pop()
  for path in paths
    f.append(path)
    f.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0o777) unless f.exists()
  f.append(leaf)
  return f
