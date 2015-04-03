# shared include as it is needed both in the translator and the host extension, but the importer doesn't have the
# Zotero.BetterBibTeX namespace

$namespace$.Context = class
  constructor: (source) ->
    source = Zotero.DB.rowQuery('select * from betterbibtex.context where id = ?', [source]) if typeof source == 'number'

    if Array.isArray(source)
      for own attribute, option of @attributes
        value = source[attribute]
        @[option] = switch attribute
          when 'pattern', 'preserveCaps', 'langid', 'unicode', 'autoAbbrevStyle', 'DOIandURL', 'skipFields' then value
          when 'usePrefix', 'autoAbbrev', 'attachmentsNoMetadata', 'useJournalAbbreviation', 'exportNotes', 'preserveBibTeXVariables' then {'true': true, 'false': false}[value] ? !!value
          else throw "Unexpected option #{attribute}"
    else
      for section in ['preferences', 'options']
        for own attribute, option of @[section]
          continue unless @valid[option]
          @[option] = config[section][option]

    @citeKeyFormat ?= ''
    @skipfields ?= ''
    @preserveCaps = 'inner' unless @preserveCaps in ['all', 'inner', 'no']
    @langid ?= 'en'
    @['auto-abbrev.style'] ?= ''
    @unicode = 'auto' unless @unicode in ['always', 'never', 'auto']
    @['doi-and-url'] = 'both' unless @['doi-and-url'] in ['doi', 'url', 'both']
    @exportCharset = (@exportCharset || 'UTF-8').toUpperCase()

Object.defineProperty($namespace$.Context::, 'db', {
  get: ->
    unless @_db
      @_db = Object.create(null)
      for own attribute, option of @attributes
        @_db[attribute] = switch attribute
          when 'pattern', 'preserveCaps', 'langid', 'unicode', 'autoAbbrevStyle', 'DOIandURL', 'skipFields'                           then "#{@[attribute]}"
          when 'usePrefix', 'autoAbbrev', 'attachmentsNoMetadata', 'useJournalAbbreviation', 'exportNotes', 'preserveBibTeXVariables' then "#{!!@[attribute]}"
          else throw "Unexpected attribute #{attribute}"
    return @_db
})

$namespace$.Context::preferences = {
  pattern: 'citekeyFormat'
  skipfields: 'skipfields'
  useprefix: 'useprefix'
  preserveCaps: 'preserveCaps'
  fancyURLs: 'fancyURLs'
  langid: 'langid'
  attachmentRelativePath: 'attachmentRelativePath'
  autoAbbrev: 'auto-abbrev'
  autoAbbrevStyle: 'auto-abbrev.style'
  unicode: 'unicode'
  pinCitekeys: 'pin-citekeys'
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
  for own attribute, option of $namespace$.Context::preferences
    continue if option in ['attachmentRelativePath',  'pinCitekeys']
    @[option] = true
  for own attribute, option of $namespace$.Context::options
    continue if option in ['exportFileData', 'Export Collections']
    @[option] = true
  return @
$namespace$.Context::attributes = new ->
  for own attribute, option of $namespace$.Context::preferences
    continue unless $namespace$.Context::valid[option]
    @[attribute] = option
  for own attribute, option of $namespace$.Context::options
    continue unless $namespace$.Context::valid[option]
    @[attribute] = option
  return @
