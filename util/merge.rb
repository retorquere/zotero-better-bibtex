#!/usr/bin/env ruby

require 'json'

main = ARGV.shift

data = JSON.parse(File.read(main))

ARGV.each{|add|
  d = JSON.parse(File.read(add))

  data['items'] << d['items']
  data['items'].flatten!
}

open(main, 'w'){|f|
  f.puts(JSON.pretty_generate(data))
}
