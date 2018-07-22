#!/usr/bin/env ruby

require 'dotenv/load'
require 'circleci'
require 'json'
require 'open-uri'

CircleCi.configure do |config|
  config.token = ENV['CIRCLECI']
end

runtimes = {}
build = CircleCi::Build.new 'retorquere', 'zotero-better-bibtex', nil, ARGV[0]
build.artifacts.body.each{|artifact|
  next unless File.basename(artifact['path']) == 'runtimes.json'

  cluster = artifact['node_index']
  prefix = (cluster < 2) ? 'zotero' : 'jurism'

  rt = JSON.parse(open(artifact['url']).read)
  rt.keys.each{|k|
    name = "#{prefix}:#{k}"
    rt[name] = rt.delete(k)
    rt[name]['cluster'] = cluster
  }

  runtimes = runtimes.merge(rt)
}

balance = [0, 0, 0, 0]

while runtimes.length > 0
  scenario = runtimes.find{|k, v| v['cluster'] == (balance[0] < balance[1] ? 0 : 1) }
  scenario ||= runtimes.find{|k, v| v['cluster'] == (balance[2] < balance[3] ? 2 : 3) }
  break if scenario.nil?
  name, scenario = scenario

  balance[scenario['cluster']] += scenario['runtime']
  runtimes.delete(name)

  #puts balance.inspect
end

puts
runtimes.values.each{|test|
  if test['cluster'] % 2 == 0
    move = 'remove'
  else
    move = '   add'
  end
  puts "#{move} @test-cluster-1: #{test['name']}"
}
