#!/usr/bin/env ruby

require 'json'

root = File.join(File.dirname(__FILE__), '..')
supported = JSON.parse(File.read(File.join(root, 'gen/preferences.json'))).keys

Dir[File.join(root, 'test/fixtures/*/*.json')].each{|lib|
  next if lib =~ /\.csl.json$/

  data = JSON.parse(File.read(lib))
  next unless data.is_a?(Hash) && data['config'] && data['config']['preferences']

  data['config']['preferences'].keys.each{|key|
    data['config']['preferences'].delete(key) unless supported.include?(key)
  }

  File.open(lib, 'w'){|f| f.puts(JSON.pretty_generate(data)) }
}
