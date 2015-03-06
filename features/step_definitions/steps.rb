require 'headless'
require 'selenium/webdriver'
require 'json'
require 'pp'
require 'fileutils'
require 'ostruct'
require 'yaml'

$headless ||= false
unless $headless
  $headless = Headless.new(display: 100) # reserve 100 for BBT
  $headless.start

  profile_dir = File.expand_path('test/fixtures/profile')
  profile = Selenium::WebDriver::Firefox::Profile.new(profile_dir)
  
  STDOUT.sync = true
  STDOUT.puts "Installing plugins..."
  Dir['tmp/plugins/*.xpi'].shuffle.each{|xpi|
    STDOUT.puts "Installing #{File.basename(xpi)}"
    profile.add_extension(xpi)
  }
  profile['extensions.zotero.showIn'] = 2
  profile['extensions.zotero.httpServer.enabled'] = true

  if ENV['CI'] != 'true'
    profile['extensions.zotero.debug.store'] = true
    profile['extensions.zotero.debug.log'] = true
    profile['extensions.zotero.translators.better-bibtex.debug'] = true
  end

  profile['extensions.zotero.translators.better-bibtex.caching'] = true if ENV['CACHE'] == 'yes'
  profile['extensions.zotero.translators.better-bibtex.attachmentRelativePath'] = true
  profile['extensions.zotfile.useZoteroToRename'] = true

  profile['browser.download.dir'] = "/tmp/webdriver-downloads"
  profile['browser.download.folderList'] = 2
  profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
  profile['pdfjs.disabled'] = true

  BROWSER = Selenium::WebDriver.for :firefox, :profile => profile

  sleep 2
  BROWSER.navigate.to('chrome://zotero/content/tab.xul') # does this trigger the window load?
  #$headless.take_screenshot('/home/emile/zotero/zotero-better-bibtex/screenshot.png')
  DBB = JSONRPCClient.new('http://localhost:23119/debug-bridge')
  DBB.bootstrap('Zotero.BetterBibTeX')
  BBT = JSONRPCClient.new('http://localhost:23119/debug-bridge/better-bibtex')
  SCHOMD = JSONRPCClient.new('http://localhost:23119/better-bibtex/schomd')
  BBT.init

  Dir['*.debug'].each{|d| File.unlink(d) }
  Dir['*.cache'].each{|d| File.unlink(d) }
  Dir['*.log'].each{|d| File.unlink(d) unless File.basename(d) == 'cucumber.log' }
end
at_exit do
  $headless.destroy if $headless
end

Before do
  BBT.reset
  BBT.setPreference('translators.better-bibtex.testmode', true)
  @selected = nil
  @expectedExport = nil
  sleep 1
  throw 'Library not empty!' unless BBT.librarySize == 0
end

After do |scenario|
  if ENV['CIRCLECI'] != 'true'
    open("#{scenario.title}.debug", 'w'){|f| f.write(DBB.log) } if scenario.source_tag_names.include?('@logcapture')
    filename = scenario.title.gsub(/[^0-9A-z.\-]/, '_')
    if scenario.failed?
      @logcaptures ||= 0
      @logcaptures += 1
      if @logcaptures <= 5
        open("#{filename}.debug", 'w'){|f| f.write(DBB.log) }
        open("#{filename}.log", 'w'){|f| f.write(browserLog) }
      end

      #BBT.exportToFile(@expectedExport.translator, File.join('/tmp', File.basename(@expectedExport.filename))) if @expectedExport
    end

    open("#{filename}.cache", 'w'){|f| f.write(BBT.cache.to_yaml)} if scenario.failed? || scenario.source_tag_names.include?('@dumpcache')
    BBT.exportToFile('Zotero TestCase', "#{filename}.json") if scenario.source_tag_names.include?('@librarydump')
  end
end

#Given /^that ([^\s]+) is set to (.*)$/ do |pref, value|
#  if value =~ /^['"](.*)['"]$/
#    ZOTERO.setCharPref(pref, $1)
#  elsif ['false', 'true'].include?(value.downcase)
#    ZOTERO.setBoolPref(pref, value.downcase == 'true')
#  elsif value.downcase == 'null'
#    ZOTERO.setCharPref(pref, nil)
#  else
#    ZOTERO.setIntPref(pref, Integer(value))
#  end
#end

When /^I import ([0-9]+) references? (with ([0-9]+) attachments? )?from '([^']+)'( as '([^']+)')?$/ do |references, dummy, attachments, filename, dummy2, aliased|
  bib = nil
  Dir.mktmpdir {|dir|
    bib = File.expand_path(File.join('test/fixtures', filename))

    if aliased.to_s != ''
      aliased = File.expand_path(File.join(dir, File.basename(aliased)))
      FileUtils.cp(bib, aliased)
      bib = aliased
    end

    if File.extname(filename) == '.json'
      begin
        data = JSON.parse(open(bib).read)
      rescue
        data = {}
      end

      if data.is_a?(Hash) && data['config'].is_a?(Hash) && data['config']['label'] == 'Zotero TestCase'
        (data['config']['preferences'] || {}).each_pair{|key, value|
          BBT.setPreference('translators.better-bibtex.' + key, value)
        }
        (data['config']['options'] || {}).each_pair{|key, value|
          BBT.setExportOption(key, value)
        }
      end
    end

    entries = OpenStruct.new({start: BBT.librarySize})

    BBT.import(bib)

    start = Time.now

    expected = references.to_i + attachments.to_i

    while !entries.now || entries.now != entries.new
      sleep 2
      entries.now = entries.new || entries.start
      #STDOUT.puts entries.now
      entries.new = BBT.librarySize

      elapsed = Time.now - start
      if elapsed > 5
        processed = entries.new - entries.start
        remaining = expected - processed
        speed = processed / elapsed
        timeleft = (Time.mktime(0)+((expected - processed) / speed)).strftime("%H:%M:%S")
        STDOUT.puts "Slow import (#{elapsed}): #{processed} entries @ #{speed.round(1)} entries/sec, #{timeleft} remaining"
      end
    end

    expect(entries.now - entries.start).to eq(references.to_i + attachments.to_i)
  }
end

Then /^write the library to '([^']+)'$/ do |filename|
  BBT.exportToFile('Zotero TestCase', filename)
end

def normalize(o)
  if o.is_a?(Hash)
    arr= []
    o.each_pair{|k,v|
      arr << {k => normalize(v)}
    }
    arr.sort!{|a, b| "#{a.keys[0]}~#{a.values[0]}" <=> "#{b.keys[0]}~#{b.values[0]}" }
    return arr
  elsif o.is_a?(Array)
    return o.collect{|v| normalize(v)}.sort{|a,b| a.to_s <=> b.to_s}
  else
    return o
  end
end

Then /^the library should match '([^']+)'$/ do |filename|
  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = JSON.parse(open(expected).read)

  found = BBT.library

  renum = lambda{|collection, idmap, items=true|
    collection.delete('id')
    collection['items'] = collection['items'].collect{|i| idmap[i] } if items
    collection['collections'].each{|coll|
      renum.call(coll, idmap)
    }
  }
  [expected, found].each_with_index{|library, i|
    library.delete('config')
    newID = {}
    library['items'].sort!{|a, b| a['itemID'] <=> b['itemID'] }
    library['items'].each_with_index{|item, i|
      newID[item['itemID']] = i
      item['itemID'] = i
      item.delete('itemID')
      item['attachments'].each{|a| a.delete('path')} if item['attachments']
    }
    renum.call(library, newID, false)
    library.normalize!
  }

  expect(JSON.pretty_generate(found)).to eq(JSON.pretty_generate(expected))
end

Then(/^a library export using '([^']+)' should match '([^']+)'$/) do |translator, filename|
  found = BBT.exportToString(translator).strip

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = open(expected).read.strip
  open("tmp/#{File.basename(filename)}", 'w'){|f| f.write(found)} if found != expected
  expect(found).to eq(expected)
end

Then(/^export the library using '([^']+)' to '([^']+)'$/) do |translator, filename|
  BBT.exportToFile(translator, filename)
end

When(/^I set (preference|export option)\s+(.+)\s+to (.*)$/) do |setting, name, value|
  value.strip!
  value = case value
            when 'true', 'false' then (value == 'true')
            when /^'.*'$/ then value.gsub(/^'|'$/, '')
            else Integer(value)
          end

  case setting
    when 'preference'
      BBT.setPreference(name, value)

    else
      BBT.setExportOption(name, value)
  end
end


Then /^sleep ([0-9]+) seconds$/ do |secs|
  STDOUT.puts "sleeping #{secs} seconds"
  sleep Integer(secs)
  STDOUT.puts "proceeding"
end

Then /^show the (browser|Zotero) log$/ do |kind|
  STDOUT.puts DBB.log if kind == 'Zotero'
  STDOUT.puts browserLog if kind == 'browser'
end

Then /^(write|append) the (browser|Zotero) log to '([^']+)'$/ do |action, kind, filename|
  open(filename, action[0]){|f| 
    f.write(kind == 'Zotero' ? DBB.log : browserLog)
  }
end

Then /^show the citekeys$/ do
  pp BBT.getKeys
end

Then /^I select the first item where ([^\s]+) = '([^']+)'$/ do |attribute, value|
  @selected = BBT.select(attribute, value)
  expect(@selected).not_to be(nil)
end

Then /^I remove the selected item$/ do
  BBT.remove(@selected)
end

Then /^I generate a new citation key$/ do
  expect(@selected).not_to be(nil)
  BBT.pinCiteKey(@selected)
end

Then /^the markdown citation for (.*) should be '(.*)'$/ do |keys, citation|
  keys = keys.split(',').collect{|k| k.strip}
  expect(SCHOMD.citation(keys)).to eq(JSON.parse(citation))
end
