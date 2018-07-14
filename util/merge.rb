#!/usr/bin/env ruby

require 'json'

main = ARGV.shift

data = JSON.parse(File.read(main))

jurisM = (main =~ /\.juris-m\.json$/)

ARGV.each{|add|
  next if add =~ /\.csl(\.juris-m)?\.json$/
  next if !jurisM && add =~ /\.juris-m\.json$/

  d = JSON.parse(File.read(add))

  data['items'] << d['items']
  data['items'].flatten!
}

puts data['items'].length

open(main, 'w'){|f|
  f.puts(JSON.pretty_generate(data))
}
