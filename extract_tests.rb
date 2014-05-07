#!/usr/bin/env ruby

require 'json'

source = ARGV[0]
js = File.open(source).read
js.gsub!(/.*var testCases =/m, '')
js.gsub!(/\/\*\*.*/m, '')

tests = JSON.parse(js)
tests.each_with_index{|test, i|
  i = "#{i}".rjust(3, '0')
  case test['type']
    when 'import'
      File.open(File.join(File.dirname(source), test['type'], File.basename(source, File.extname(source)) + ".#{i}.bib"), 'w'){|f|
        f.write(test['input'])
      }
      File.open(File.join(File.dirname(source), test['type'], File.basename(source, File.extname(source)) + ".#{i}.json"), 'w'){|f|
        f.write(JSON.pretty_generate(test['items']))
      }
    else
      throw test['type']
  end
}
