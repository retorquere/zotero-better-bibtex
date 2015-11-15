#!/usr/bin/env ruby

require 'cld'
require 'json'

data = JSON.parse(open(ARGV[0]).read)
data['items'].each{|item|
  next unless item['title']

  ld = CLD.detect_language(item['title'])

  item['language'] = ld[:code] if ld[:code] != 'en'
}

open(ARGV[0], 'w'){|f|
  f.puts(JSON.pretty_generate(data))
}
