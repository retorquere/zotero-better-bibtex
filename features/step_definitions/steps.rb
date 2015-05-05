require 'os'

require 'selenium/webdriver'
require 'json'
require 'pp'
require 'fileutils'
require 'ostruct'
require 'yaml'
require 'benchmark'
require 'shellwords'

if !OS.mac?
  require 'headless'
  $headless ||= false
  unless $headless
    $headless = Headless.new(display: 100) # reserve 100 for BetterBibTeX
    $headless.start
  end
  at_exit do
    $headless.destroy if $headless
  end
end

def cmd(cmdline)
  throw cmdline unless system(cmdline)
end

STDOUT.sync = true unless ENV['CI'] == 'true'
def say(msg)
  return if ENV['CI'] == 'true'
  STDOUT.puts msg
end

Dir['*.xpi'].each{|xpi| File.unlink(xpi)}
cmd('rake')
unless ENV['OFFLINE'].to_s.downcase == 'yes'
  say 'Getting plugins'
  if File.file?('features/plugins.yml')
    plugins = YAML.load_file('features/plugins.yml')
  else
    plugins = []
  end
  plugins << 'https://zotplus.github.io/debug-bridge/update.rdf'
  plugins << 'https://www.zotero.org/download/update.rdf'
  plugins.uniq!
  getxpis(plugins, 'test/fixtures/plugins')
end

def download(url, path)
  cmd "curl -L -s -S -o #{path.shellescape} #{url.shellescape}"
end

def loadZotero(profile)
  profile ||= 'default'
  $Firefox ||= OpenStruct.new

  case $Firefox.profile
    when profile
      # reuse existing profile

    when nil
      say "starting Firefox with #{profile} profile"
      $Firefox.profile = profile
    
      profiles = File.expand_path('test/fixtures/profiles/')
      FileUtils.mkdir_p(profiles)
      profile_dir = File.join(profiles, profile)
      if !File.directory?(profile_dir)
        archive = File.join('tmp', profile + '.tar.gz')
        download("https://github.com/ZotPlus/zotero-better-bibtex/releases/download/test-profiles/#{profile}.tar.gz", archive)
        cmd "tar -xzC #{profiles.shellescape} -f #{archive.shellescape}"
      end
      profile = Selenium::WebDriver::Firefox::Profile.new(profile_dir)
    
      say "Installing plugins..."
      (Dir['*.xpi'] + Dir['test/fixtures/plugins/*.xpi']).each{|xpi|
        say "Installing #{File.basename(xpi)}"
        profile.add_extension(xpi)
      }

      profile['extensions.zotero.showIn'] = 2
      profile['extensions.zotero.httpServer.enabled'] = true
      profile['dom.max_chrome_script_run_time'] = 6000
    
      if ENV['CI'] != 'true'
        profile['extensions.zotero.debug.store'] = true
        profile['extensions.zotero.debug.log'] = true
        profile['extensions.zotero.translators.better-bibtex.debug'] = true
      end
    
      profile['extensions.zotfile.useZoteroToRename'] = true
    
      profile['browser.download.dir'] = "/tmp/webdriver-downloads"
      profile['browser.download.folderList'] = 2
      profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
      profile['pdfjs.disabled'] = true
    
      say "Starting Firefox..."
      client = Selenium::WebDriver::Remote::Http::Default.new
      client.timeout = 6000 # seconds – default is 60
      $Firefox.browser = Selenium::WebDriver.for :firefox, :profile => profile, :http_client => client
      say "Firefox started"
    
      sleep 2
      say "Starting Zotero..."
      $Firefox.browser.navigate.to('chrome://zotero/content/tab.xul') # does this trigger the window load?
      say "Zotero started"
      #$headless.take_screenshot('/home/emile/zotero/zotero-better-bibtex/screenshot.png')
      $Firefox.DebugBridge = JSONRPCClient.new('http://localhost:23119/debug-bridge')
      $Firefox.DebugBridge.bootstrap('Zotero.BetterBibTeX')
      $Firefox.BetterBibTeX = JSONRPCClient.new('http://localhost:23119/debug-bridge/better-bibtex')
      $Firefox.ScholarlyMarkdown = JSONRPCClient.new('http://localhost:23119/better-bibtex/schomd')
      $Firefox.BetterBibTeX.init
    
      Dir['*.debug'].each{|d| File.unlink(d) }
      Dir['*.status'].each{|d| File.unlink(d) }
      Dir['*.log'].each{|d| File.unlink(d) unless File.basename(d) == 'cucumber.log' }

    else
      throw "Firefox profile #{profile} requested but #{$Firefox.profile} already running"
  end
end
at_exit do
  $Firefox.browser.quit if $Firefox && $Firefox.browser
end

Before do |scenario|
  loadZotero(scenario.source_tag_names.collect{|tag| (tag =~ /^@firefox-/ ? tag.sub(/^@firefox-/, '') : nil)}.first)
  $Firefox.BetterBibTeX.reset unless scenario.source_tag_names.include?('@noreset')
  expect($Firefox.BetterBibTeX.cacheSize).not_to eq(0) if scenario.source_tag_names.include?('@keepcache')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.testMode', true)
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.testMode.timestamp', '2015-02-24 12:14:36 +0100')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.attachmentRelativePath', true)
  @selected = nil
  @expectedExport = nil
  @exportOptions = {}
end

After do |scenario|
  if ENV['CI'] != 'true'
    open("#{scenario.name}.debug", 'w'){|f| f.write($Firefox.DebugBridge.log) } if scenario.source_tag_names.include?('@logcapture')
    filename = scenario.name.gsub(/[^0-9A-z.\-]/, '_')
    if scenario.failed?
      @logcaptures ||= 0
      @logcaptures += 1
      if @logcaptures <= 5
        open("#{filename}.debug", 'w'){|f| f.write($Firefox.DebugBridge.log) }
        open("#{filename}.log", 'w'){|f| f.write(browserLog) }
      end

      #BetterBibTeX.exportToFile(@expectedExport.translator, File.join('/tmp', File.basename(@expectedExport.filename))) if @expectedExport
    end

    open("#{filename}.cache", 'w'){|f| f.write($Firefox.BetterBibTeX.cache.to_yaml)} if scenario.failed? || scenario.source_tag_names.include?('@dumpcache')
    $Firefox.BetterBibTeX.exportToFile('Zotero TestCase', "#{filename}.json") if scenario.source_tag_names.include?('@librarydump')

    # `FAIL=FAST cucumber` to stop on first failure
    Cucumber.wants_to_quit = (ENV['FAIL'] == 'fast') && scenario.failed?
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
      data = JSON.parse(open(bib).read)

      if data['config']['label'] == 'Zotero TestCase'
        (data['config']['preferences'] || {}).each_pair{|key, value|
          $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.' + key, value)
        }
        @exportOptions = data['config']['options'] || {}
      end
    end

    entries = OpenStruct.new({start: $Firefox.BetterBibTeX.librarySize})

    $Firefox.BetterBibTeX.import(bib)

    start = Time.now

    expected = references.to_i + attachments.to_i

    while !entries.now || entries.now != entries.new
      sleep 2
      entries.now = entries.new || entries.start
      entries.new = $Firefox.BetterBibTeX.librarySize

      elapsed = Time.now - start
      if elapsed > 5
        processed = entries.new - entries.start
        remaining = expected - processed
        speed = processed / elapsed
        timeleft = (Time.mktime(0)+((expected - processed) / speed)).strftime("%H:%M:%S")
        say "Slow import (#{elapsed}): #{processed} entries @ #{speed.round(1)} entries/sec, #{timeleft} remaining"
      end
    end

    expect(entries.now - entries.start).to eq(references.to_i + attachments.to_i)
  }
end

Then /^write the library to '([^']+)'$/ do |filename|
  $Firefox.BetterBibTeX.exportToFile('Zotero TestCase', filename)
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

Then /^the library (without collections )?should match '([^']+)'$/ do |nocollections, filename|
  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = JSON.parse(open(expected).read)

  found = $Firefox.BetterBibTeX.library
  
  if nocollections
    expected['collections'] = []
    found['collections'] = []
  end

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

def preferenceValue(value)
  value.strip!
  return true if value == 'true'
  return false if value == 'false'
  return Integer(value) if value =~ /^[0-9]+$/
  return value[1..-1] if value =~ /^'[^']+'$/
  return value
end

Then(/^the following library export should match '([^']+)':$/) do |filename, table|
  exportOptions = table.rows_hash
  exportOptions.each{ |_,str| preferenceValue(str) }
  exportOptions = @exportOptions.merge(exportOptions)

  translator = exportOptions.delete('translator')
  benchmark = (exportOptions.delete('benchmark') == 'true')

  found = nil
  bm = Benchmark.measure { found = $Firefox.BetterBibTeX.exportToString(translator, exportOptions).strip }
  STDOUT.puts bm if benchmark

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = open(expected).read.strip
  open("tmp/#{File.basename(filename)}", 'w'){|f| f.write(found)} if found != expected
  expect(found).to eq(expected)
end

Then(/^a library export using '([^']+)' should match '([^']+)'$/) do |translator, filename|
  found = $Firefox.BetterBibTeX.exportToString(translator, @exportOptions).strip

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = open(expected).read.strip
  open("tmp/#{File.basename(filename)}", 'w'){|f| f.write(found)} if found != expected
  expect(found).to eq(expected)
end

Then(/^'([^']+)' should match '([^']+)'$/) do |found, expected|
  found = open(File.expand_path(found)).read.strip
  expected = File.expand_path(File.join('test/fixtures', expected))
  expected = open(expected).read.strip
  expect(found).to eq(expected)
end

Then(/I? ?export the library to '([^']+)':$/) do |filename, table|
  exportOptions = table.rows_hash
  exportOptions.each{ |_,str| preferenceValue(str) }
  exportOptions = @exportOptions.merge(exportOptions)

  translator = exportOptions.delete('translator')
  benchmark = (exportOptions.delete('benchmark') == 'true')

  bm = Benchmark.measure { $Firefox.BetterBibTeX.exportToFile(translator, exportOptions, File.expand_path(filename)) }
  STDOUT.puts bm if benchmark
end

When(/^I set preferences:$/) do |table|
  table.rows_hash.each_pair{ |name, value|
    name = "translators.better-bibtex#{name}" if name[0] == '.'
    $Firefox.BetterBibTeX.setPreference(name, preferenceValue(value))
  }
end
When(/^I set preference (.*) to (.*)$/) do |name, value|
  name = "translators.better-bibtex#{name}" if name[0] == '.'
  $Firefox.BetterBibTeX.setPreference(name, preferenceValue(value))
end

Then /^I? ?wait ([0-9]+) seconds?(.*)/ do |secs, comment|
  wait = Integer(secs)
  wait = 0 if comment =~ / CI$/ && ENV['CI'] != 'true'
  sleep wait unless wait == 0
end

Then /^show the (browser|Zotero) log$/ do |kind|
  say $Firefox.DebugBridge.log if kind == 'Zotero'
  say browserLog if kind == 'browser'
end

Then /^(write|append) the (browser|Zotero) log to '([^']+)'$/ do |action, kind, filename|
  open(filename, action[0]){|f| 
    f.write(kind == 'Zotero' ? $Firefox.DebugBridge.log : browserLog)
  }
end

Then /restore '([^']+)'$/ do |db|
  $Firefox.BetterBibTeX.restore(db)
end

Then /^show the citekeys$/ do
  pp $Firefox.BetterBibTeX.getKeys
end

Then /^save the query log to '([^']+)'$$/ do |filename|
  open(filename, 'w'){|f| f.write($Firefox.BetterBibTeX.sql.to_yaml) }
end

Then /^I select the first item where ([^\s]+) = '([^']+)'$/ do |attribute, value|
  @selected = $Firefox.BetterBibTeX.select(attribute, value)
  expect(@selected).not_to be(nil)
end

Then /^I remove the selected item$/ do
  $Firefox.BetterBibTeX.remove(@selected)
end

Then /^I generate a new citation key$/ do
  expect(@selected).not_to be(nil)
  $Firefox.BetterBibTeX.pinCiteKey(@selected)
end

Then /^the markdown citation for (.*) should be '(.*)'$/ do |keys, citation|
  keys = keys.split(',').collect{|k| k.strip}
  expect($Firefox.ScholarlyMarkdown.citation(keys)).to eq(JSON.parse(citation))
end
