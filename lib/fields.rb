#!/usr/bin/env ruby

require 'json'

fields = []
Dir['test/fixtures/*/*.json'].each{|library|
  library = JSON.parse(open(library).read)
  next unless library.is_a?(Hash) && library['items']
  fields << library['items'].collect{|item| item.keys}
}
fields.flatten!
fields.uniq!
fields.sort!
fields.reject!{|f| %w{attachments __citekey__ __citekeys__ accessDate}.include?(f) }
puts "  fields = %w{"
fields.each_slice(8){|chunk|
  puts "    #{chunk.join(' ')}"
}
puts "  }"
