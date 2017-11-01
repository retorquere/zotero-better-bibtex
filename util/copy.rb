#!/usr/bin/env ruby

require 'json'

main = ARGV.shift
copy = Integer(ARGV.shift)

data = JSON.parse(File.read(main))

timestamp = Time.now

1.upto(copy){|n|
  data['items'] << data['items'].sample.dup
  data['items'][-1]['title'] = "#{timestamp}-#{n}"
}

open(main, 'w'){|f|
  f.puts(JSON.pretty_generate(data))
}
