# shared include as it is needed both in the translator and the host extension, but the importer doesn't have the
# Zotero.BetterBibTeX namespace

$namespace$.Context = class
  constructor: (config) ->
    @translatorID = config.id
    @translator = config.label

    for section in ['preferences', 'options']
      for own attribute, key of @[section]
        continue unless @valid[key]
        @[key] = config[section][key]

  # deterministic JSON so I can use it as a key
  toJSON: ->
    keys = Object.keys(@)
    keys.sort()
    fields = []
    for k in keys
      continue if typeof @[k] == 'undefined'
      fields.push(JSON.stringify({"#{k}": @[k]}).slice(1, -1))
    return "{#{fields.join(', ')}}"

$namespace$.Context::preferences = {
  pattern: 'citeKeyFormat'
  skipFields: 'skipfields'
  usePrefix: 'useprefix'
  preserveCaps: 'preserveCaps'
  fancyURLs: 'fancyURLs'
  langid: 'langid'
  attachmentRelativePath: 'attachmentRelativePath'
  autoAbbrev: 'auto-abbrev'
  autoAbbrevStyle: 'auto-abbrev.style'
  unicode: 'unicode'
  pinKeys: 'pin-citekeys'
  rawImport: 'raw-imports'
  DOIandURL: 'doi-and-url'
  attachmentsNoMetadata: 'attachmentsNoMetadata'
}
$namespace$.Context::options = {
  useJournalAbbreviation: 'useJournalAbbreviation'
  exportCharset: 'exportCharset'
  exportFileData: 'exportFileData'
  exportNotes: 'exportNotes'
  exportCollections: 'Export Collections'
  preserveBibTeXVariables: 'Preserve BibTeX variables'
}
$namespace$.Context::valid = new ->
  for own k, v of $namespace$.Context::preferences
    continue if v in ['attachmentRelativePath',  'pin-citekeys']
    @[v] = true
  for own k, v of $namespace$.Context::options
    continue if v in ['exportFileData', 'Export Collections']
    @[v] = true
  return @
