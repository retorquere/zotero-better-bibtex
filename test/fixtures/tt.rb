require 'json'

Dir['*/*.json'].sort.each{|json|
  next unless json =~ /^(im|ex)port\//
  data = JSON.parse(open(json).read)

  next unless data['config']
  next unless data['config']['preferences']

  data['config']['preferences']['autoAbbrevStyle'] = data['config']['preferences'].delete('auto-abbrev.style')
  data['config']['preferences']['autoAbbrev'] = data['config']['preferences'].delete('auto-abbrev')
  data['config']['preferences']['autoExport'] = data['config']['preferences'].delete('auto-export')
  data['config']['preferences']['citekeyFormat'] = data['config']['preferences'].delete('citeKeyFormat')
  data['config']['preferences']['DOIandURL'] = data['config']['preferences'].delete('doi-and-url')
  data['config']['preferences']['keyConflictPolicy'] = data['config']['preferences'].delete('key-conflict-policy')
  data['config']['preferences']['langID'] = data['config']['preferences'].delete('langid')
  data['config']['preferences']['pinCitekeys'] = data['config']['preferences'].delete('pin-citekeys')
  data['config']['preferences']['rawImports'] = data['config']['preferences'].delete('raw-imports')
  data['config']['preferences']['showCitekeys'] = data['config']['preferences'].delete('show-citekey')
  data['config']['preferences']['usePrefix'] = data['config']['preferences'].delete('useprefix')
  data['config']['preferences']['skipFields'] = data['config']['preferences'].delete('skipfields')

  data['config']['preferences'].each_pair{|k, v|
    data['config']['preferences'].delete(k) if v.nil?
  }

  open(json, 'w'){|f| f.write(JSON.pretty_generate(data))}
}
