#!/usr/bin/env ruby

require 'cld'
require 'json'

data = JSON.parse(open(ARGV[0]).read)
data['items'].each{|item|
  next unless item['title']

  ld = CLD.detect_language(item['title'])

  if ld[:code] == 'en'
    item.delete('language')
  else
    item['language'] = ld[:code]
  end
}

open(ARGV[0], 'w'){|f|
  f.puts(JSON.pretty_generate(data))
}
