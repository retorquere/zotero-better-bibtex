require 'headless'
require 'selenium/webdriver'
require 'json'
require 'pp'
require 'fileutils'
require 'ostruct'
require 'yaml'
require 'benchmark'
require 'shellwords'

$headless ||= false
unless $headless
  $headless = Headless.new(display: 100) # reserve 100 for BBT
  $headless.start
end
at_exit do
  $headless.destroy if $headless
end

def cmd(cmdline)
  throw cmdline unless system(cmdline)
end

def download(url, path)
  cmd "curl -L -s -S -o #{path.shellescape} #{url.shellescape}"
end

def loadZotero(profile)
  profile ||= 'default'

  xpi = Dir['*.xpi']
  cmd "rake" if xpi.length == 0
  xpi = Dir['*.xpi']
  throw "Expected exactly one XPI, found #{xpi.length}" unless xpi.length == 1
  xpi = xpi.first

  $Firefox ||= OpenStruct.new
  throw "Firefox profile #{profile} requested but #{$Firefox.profile} already running" if $Firefox.profile && $Firefox.profile != profile
  STDOUT.puts "starting Firefox with #{profile} profile"
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

  if File.file?('features/plugins.yml')
    plugins = YAML.load_file('features/plugins.yml')
  else
    plugins = []
  end
  plugins << "file://" + File.expand_path("#{Dir['*.xpi'][0]}")
  plugins << 'https://zotplus.github.io/debug-bridge/update.rdf'
  plugins << 'https://www.zotero.org/download/update.rdf'
  plugins.uniq!
  getxpis(plugins, 'tmp/plugins')
 
  STDOUT.sync = true
  STDOUT.puts "Installing plugins..."
  Dir['tmp/plugins/*.xpi'].shuffle.each{|xpi|
    STDOUT.puts "Installing #{File.basename(xpi)}"
    profile.add_extension(xpi)
  }
  profile['extensions.zotero.showIn'] = 2
  profile['extensions.zotero.httpServer.enabled'] = true
  profile['dom.max_chrome_script_run_time'] = 600

  if ENV['CI'] != 'true'
    profile['extensions.zotero.debug.store'] = true
    profile['extensions.zotero.debug.log'] = true
    profile['extensions.zotero.translators.better-bibtex.debug'] = true
  end

  profile['extensions.zotero.translators.better-bibtex.attachmentRelativePath'] = true
  profile['extensions.zotfile.useZoteroToRename'] = true

  profile['browser.download.dir'] = "/tmp/webdriver-downloads"
  profile['browser.download.folderList'] = 2
  profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
  profile['pdfjs.disabled'] = true

  client = Selenium::WebDriver::Remote::Http::Default.new
  client.timeout = 600 # seconds – default is 60
  $Firefox.browser = Selenium::WebDriver.for :firefox, :profile => profile, :http_client => client

  sleep 2
  $Firefox.browser.navigate.to('chrome://zotero/content/tab.xul') # does this trigger the window load?
  #$headless.take_screenshot('/home/emile/zotero/zotero-better-bibtex/screenshot.png')
  $Firefox.DBB = JSONRPCClient.new('http://localhost:23119/debug-bridge')
  $Firefox.DBB.bootstrap('Zotero.BetterBibTeX')
  $Firefox.BBT = JSONRPCClient.new('http://localhost:23119/debug-bridge/better-bibtex')
  $Firefox.SCHOMD = JSONRPCClient.new('http://localhost:23119/better-bibtex/schomd')
  $Firefox.BBT.init

  Dir['*.debug'].each{|d| File.unlink(d) }
  Dir['*.status'].each{|d| File.unlink(d) }
  Dir['*.log'].each{|d| File.unlink(d) unless File.basename(d) == 'cucumber.log' }
  open('cucumber.status', 'w'){|f| f.write('success')}
end

Before do |scenario|
  loadZotero(scenario.source_tag_names.collect{|tag| (tag =~ /^@firefox-/ ? tag.sub(/^@firefox-/, '') : nil)}.first)
  $Firefox.BBT.reset unless scenario.source_tag_names.include?('@noreset')
  expect($Firefox.BBT.cacheSize).not_to eq(0) if scenario.source_tag_names.include?('@keepcache')
  $Firefox.BBT.setPreference('translators.better-bibtex.testMode', true)
  $Firefox.BBT.setPreference('translators.better-bibtex.testMode.timestamp', '2015-02-24 12:14:36 +0100')
  @selected = nil
  @expectedExport = nil
end

After do |scenario|
  @failed ||= scenario.failed?
  open('cucumber.status', 'w'){|f| f.write('failed')} if @failed

  if ENV['CI'] != 'true'
    open("#{scenario.name}.debug", 'w'){|f| f.write($Firefox.DBB.log) } if scenario.source_tag_names.include?('@logcapture')
    filename = scenario.name.gsub(/[^0-9A-z.\-]/, '_')
    if scenario.failed?
      @logcaptures ||= 0
      @logcaptures += 1
      if @logcaptures <= 5
        open("#{filename}.debug", 'w'){|f| f.write($Firefox.DBB.log) }
        open("#{filename}.log", 'w'){|f| f.write(browserLog) }
      end

      #BBT.exportToFile(@expectedExport.translator, File.join('/tmp', File.basename(@expectedExport.filename))) if @expectedExport
    end

    open("#{filename}.cache", 'w'){|f| f.write($Firefox.BBT.cache.to_yaml)} if scenario.failed? || scenario.source_tag_names.include?('@dumpcache')
    $Firefox.BBT.exportToFile('Zotero TestCase', "#{filename}.json") if scenario.source_tag_names.include?('@librarydump')

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
      begin
        data = JSON.parse(open(bib).read)
      rescue
        data = {}
      end

      if data.is_a?(Hash) && data['config'].is_a?(Hash) && data['config']['label'] == 'Zotero TestCase'
        (data['config']['preferences'] || {}).each_pair{|key, value|
          $Firefox.BBT.setPreference('translators.better-bibtex.' + key, value)
        }
        (data['config']['options'] || {}).each_pair{|key, value|
          $Firefox.BBT.setExportOption(key, value)
        }
      end
    end

    entries = OpenStruct.new({start: $Firefox.BBT.librarySize})

    $Firefox.BBT.import(bib)

    start = Time.now

    expected = references.to_i + attachments.to_i

    while !entries.now || entries.now != entries.new
      sleep 2
      entries.now = entries.new || entries.start
      #STDOUT.puts entries.now
      entries.new = $Firefox.BBT.librarySize

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
  $Firefox.BBT.exportToFile('Zotero TestCase', filename)
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

  found = $Firefox.BBT.library

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

Then(/^a (timed )?library export using '([^']+)' should match '([^']+)'$/) do |timed, translator, filename|
  found = nil
  bm = Benchmark.measure { found = $Firefox.BBT.exportToString(translator).strip }
  puts bm if timed

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = File.expand_path(File.join('test/fixtures', filename))
  expected = open(expected).read.strip
  open("tmp/#{File.basename(filename)}", 'w'){|f| f.write(found)} if found != expected
  expect(found).to eq(expected)
end

Then(/^export the library using '([^']+)' to '([^']+)'$/) do |translator, filename|
  bm = Benchmark.measure { $Firefox.BBT.exportToFile(translator, filename) }
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
      $Firefox.BBT.setPreference(name, value)

    else
      $Firefox.BBT.setExportOption(name, value)
  end
end


Then /^sleep ([0-9]+) seconds$/ do |secs|
  STDOUT.puts "sleeping #{secs} seconds"
  sleep Integer(secs)
  STDOUT.puts "proceeding"
end

Then /^show the (browser|Zotero) log$/ do |kind|
  STDOUT.puts $Firefox.DBB.log if kind == 'Zotero'
  STDOUT.puts browserLog if kind == 'browser'
end

Then /^(write|append) the (browser|Zotero) log to '([^']+)'$/ do |action, kind, filename|
  open(filename, action[0]){|f| 
    f.write(kind == 'Zotero' ? $Firefox.DBB.log : browserLog)
  }
end

Then /restore '([^']+)'$/ do |db|
  $Firefox.BBT.restore(db)
end

Then /^show the citekeys$/ do
  pp $Firefox.BBT.getKeys
end

Then /^save the query log to '([^']+)'$$/ do |filename|
  open(filename, 'w'){|f| f.write($Firefox.BBT.sql.to_yaml) }
end

Then /^I select the first item where ([^\s]+) = '([^']+)'$/ do |attribute, value|
  @selected = $Firefox.BBT.select(attribute, value)
  expect(@selected).not_to be(nil)
end

Then /^I remove the selected item$/ do
  $Firefox.BBT.remove(@selected)
end

Then /^I generate a new citation key$/ do
  expect(@selected).not_to be(nil)
  $Firefox.BBT.pinCiteKey(@selected)
end

Then /^the markdown citation for (.*) should be '(.*)'$/ do |keys, citation|
  keys = keys.split(',').collect{|k| k.strip}
  expect($Firefox.SCHOMD.citation(keys)).to eq(JSON.parse(citation))
end
