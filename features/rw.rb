require 'json'
%w{export import}.each{|dir|
  Dir["#{dir}/*.json"].sort.each{|json|
    data = JSON.parse(open(json).read)
    next unless data['config']

    data['config']['preferences'] = {}
    data['config']['options'] = {}

    data['config'].each_pair{|key, value|
      case key
        when 'useJournalAbbreviation', 'exportCharset', 'exportFileData', 'exportNotes'
          data['config']['options'][key] = data['config'].delete(key)

        when 'pattern'
          data['config']['preferences']['citeKeyFormat'] = data['config'].delete(key)
        when 'skipFields'
          data['config']['preferences']['skipfields'] = data['config'].delete(key)
        when 'usePrefix'
          data['config']['preferences']['useprefix'] = data['config'].delete(key)
        when 'braceAll'
          data['config']['preferences']['brace-all'] = data['config'].delete(key)
        when 'fancyURLs'
          data['config']['preferences']['fancyURLs'] = data['config'].delete(key)
        when 'langid'
          data['config']['preferences']['langid'] = data['config'].delete(key)
        when 'attachmentRelativePath'
          data['config']['preferences']['attachmentRelativePath'] = data['config'].delete(key)
        when 'autoAbbrev'
          data['config']['preferences']['auto-abbrev'] = data['config'].delete(key)
        when 'autoAbbrevStyle'
          data['config']['preferences']['auto-abbrev.style'] = data['config'].delete(key)
        when 'unicode'
          data['config']['preferences']['unicode'] = data['config'].delete(key)
        when 'pinKeys'
          data['config']['preferences']['pin-citekeys'] = data['config'].delete(key)
      end
    }

    data['config'].delete('preferences') if data['config']['preferences'].size == 0
    data['config'].delete('options') if data['config']['options'].size == 0

    open(json, 'w'){|f| f.write(JSON.pretty_generate(data, :indent => '  ')) }
  }
}
