#!/usr/bin/env ruby

require 'json'

Dir['test/fixtures/*/*.json'].each{|json|
  test = JSON.parse(open(json).read)
  next unless test.is_a?(Hash)
  next unless test['config']
  next unless test['config'].is_a?(Hash)
  next unless test['config']['id'] == '36a3b0b5-bad0-4a04-b79b-441c7cef77db'

  obsoleteKeys = %w{attachmentRelativePath preserveCaps fancyURLs}

  hasObs = test['config']['preferences'] && (test['config']['preferences'].keys & obsoleteKeys != [])
  if test['keymanager'] || test['_items'] || test['id'] || test['cache'] || hasObs
    obsoleteKeys.each{|key| test['config']['preferences'].delete(key)} if hasObs
    test.delete('keymanager')
    test.delete('_items')
    test.delete('id')
    test.delete('cache')
    open(json, 'w'){|f| f.write(JSON.pretty_generate(test)) }
    puts "scrubbed #{json}"
  end
  junk = test.keys.reject{|k| %w{config items collections}.include?(k) }
  next if junk.length == 0
  puts json
  junk.each{|k|
    puts "#{k}: #{test[k].class}"
  }
}
