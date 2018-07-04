#!/usr/bin/env ruby

require 'json'

root = File.join(File.dirname(__FILE__), '..')
supported = JSON.parse(File.read(File.join(root, 'gen/preferences.json'))).keys

Dir[File.join(root, 'test/fixtures/*/*.json')].each{|lib|
  next if lib =~ /\.csl.json$/

  data = JSON.parse(File.read(lib))
  next unless data.is_a?(Hash) && data['config']

  resave = false

  if data['config']['preferences']
    data['config']['preferences'].keys.each{|key|
      next if supported.include?(key)
      data['config']['preferences'].delete(key) 
      resave = true
    }
  end

  if data['items'] && lib =~ /\/import\//
    data['items'].each{|item|
      next unless item['extra']
      resave = true
      item['extra'].sub!(/\nbibtex:/, "\nCitation Key:")
      item['extra'].sub!(/^bibtex:/, "Citation Key:")
    }
  end

  puts lib if resave

  File.open(lib, 'w'){|f| f.puts(JSON.pretty_generate(data)) } if resave
}
