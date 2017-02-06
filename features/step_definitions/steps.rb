require 'os'

require 'selenium/webdriver'
require 'json'
require 'pp'
require 'fileutils'
require 'ostruct'
require 'yaml'
require 'benchmark'
require 'shellwords'
require 'nokogiri'
require 'mechanize'
require 'open-uri'
require 'net/http'
require 'uri'
require 'neatjson'

#$DEBUG=true

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
  STDOUT.puts msg
end

def download(url, path)
  cmd "curl -L -s -S -o #{path.shellescape} #{url.shellescape}"
end

def loadZotero
  return if $Firefox
  $Firefox = OpenStruct.new

  profile = Selenium::WebDriver::Firefox::Profile.new(File.expand_path('test/fixtures/profiles/default'))
  profile.log_file = File.expand_path(File.join(File.dirname(__FILE__), "#{ENV['LOGS'] || '.'}/firefox-console.log"))

  say "Installing plugins..."
  (Dir['*.xpi'] + Dir['test/fixtures/plugins/*.xpi']).each{|xpi|
    say "Installing #{File.basename(xpi)}"
    profile.add_extension(xpi)
  }

  profile['xpinstall.signatures.required'] = false

  profile['extensions.zotero.showIn'] = 2
  profile['extensions.zotero.translators.better-bibtex.confirmCacheResetSize'] = 0
  profile['extensions.zotero.httpServer.enabled'] = true
  profile['dom.max_chrome_script_run_time'] = 6000
  profile['browser.shell.checkDefaultBrowser'] = false

  if ENV['CI'] != 'true'
    profile['extensions.zotero.debug.store'] = true
    profile['extensions.zotero.debug.log'] = true
    profile['extensions.zotero.translators.better-bibtex.debug'] = true
  end

  profile['extensions.zotfile.automatic_renaming'] = 1
  profile['extensions.zotfile.watch_folder'] = false

  profile['browser.download.manager.showWhenStarting'] = false
  FileUtils.mkdir_p("/tmp/webdriver-downloads")

  profile['browser.download.dir'] = "/tmp/webdriver-downloads"
  profile['browser.download.folderList'] = 2
  profile['browser.download.manager.showWhenStarting'] = false
  profile['browser.helperApps.alwaysAsk.force'] = false
  profile['browser.helperApps.neverAsk.saveToDisk'] = "application/octet-stream"
  #profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
  profile['browser.shell.checkDefaultBrowser'] = false
  profile['browser.uitour.enabled'] = false
  profile['dom.max_chrome_script_run_time'] = 6000
  profile['extensions.autoDisableScopes'] = 0
  profile['extensions.zotero.backup.numBackups'] = 0
  #profile['extensions.zotero.debug.level'] = $DEBUG_LEVEL
  profile['extensions.zotero.showIn'] = 2 # show in tab
  profile['extensions.zotero.debug.log'] = true
  profile['extensions.zotero.debug.store'] = true
  profile['extensions.zotero.debug.time'] = true
  profile['extensions.zotero.firstRun2'] = false
  profile['extensions.zotero.firstRunGuidance'] = false
  profile['extensions.zotero.httpServer.enabled'] = true
  profile['extensions.zotero.reportTranslationFailure'] = false
  profile['extensions.zotero.showIn'] = 2
  profile['extensions.zotero.translators.better-bibtex.debug'] = true
  profile['extensions.zotfile.automatic_renaming'] = 1
  profile['extensions.zotfile.watch_folder'] = false
  profile['pdfjs.disabled'] = true
  profile['xpinstall.signatures.required'] = false

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
  sleep 3
  $Firefox.DebugBridge.bootstrap('Zotero.BetterBibTeX')
  $Firefox.BetterBibTeX = JSONRPCClient.new('http://localhost:23119/debug-bridge/better-bibtex')
  $Firefox.ScholarlyMarkdown = JSONRPCClient.new('http://localhost:23119/better-bibtex/schomd')
  $Firefox.BetterBibTeX.init
  say "Zotero started"

  Dir['*.debug'].each{|d| File.unlink(d) }
  Dir['*.dbg'].each{|d| File.unlink(d) }
  Dir['*.status'].each{|d| File.unlink(d) }
  Dir['*.keys'].each{|d| File.unlink(d) }
  Dir['*.serialized'].each{|d| File.unlink(d) }
  Dir['*.cache'].each{|d| File.unlink(d) }
  Dir['*.log'].each{|d| File.unlink(d) unless File.basename(d) == 'cucumber.log' }
end
at_exit do
  $Firefox.browser.quit if $Firefox && $Firefox.browser
end

Before do |scenario|
  loadZotero
  $Firefox.BetterBibTeX.reset unless scenario.source_tag_names.include?('@noreset')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.confirmCacheResetSize', 0)
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.tests', 'all')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.test.timestamp', '2015-02-24 12:14:36 +0100')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.autoExport', 'on-change')
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.debug', true)
  $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.removeStock', true)

  @cacheStats = $Firefox.BetterBibTeX.cacheStats

  @selected = nil
  @expectedExport = nil
  @exportOptions = {}
  #@caywPicks = [{"id":"5","locator":"page","prefix":"prefix","suffix":"suffix","suppress-author":true}]
  @caywPicks = []
end

AfterStep do |scenario|
  #sleep 5 if ENV['CIRCLECI'] == 'true'
end

def writeLog(file, contents)
  return if contents.strip == ''
  open(file, 'w'){|f| f.write(contents) }
end

After do |scenario|
  Cucumber.wants_to_quit = scenario.failed? && ENV['CI'] != 'true'

  filename = scenario.name.gsub(/[^0-9A-z.\-]/, '_')

  if scenario.failed? || (ENV['CI'] != 'true' && scenario.source_tag_names.include?('@dumplogs'))
    logdir = ENV['LOGS'] || '.'
    writeLog("#{logdir}/#{filename}.debug", $Firefox.DebugBridge.log)
    writeLog("#{logdir}/#{filename}.log", browserLog)
  end

  if ENV['CI'] != 'true'
    open("#{filename}.keys", 'w'){|f| f.write(JSON.pretty_generate($Firefox.BetterBibTeX.keyManagerState)) } if scenario.failed? && scenario.source_tag_names.include?('@dumpkeys')
    open("#{filename}.cache", 'w'){|f| f.write(JSON.pretty_generate($Firefox.BetterBibTeX.cacheState)) } if scenario.failed? || scenario.source_tag_names.include?('@dumpcache')
    open("#{filename}.serialized", 'w'){|f| f.write(JSON.pretty_generate($Firefox.BetterBibTeX.serializedState)) } if scenario.failed? || scenario.source_tag_names.include?('@dumpserialized')

    $Firefox.BetterBibTeX.exportToFile('BetterBibTeX JSON', {}, "#{filename}.json") if scenario.source_tag_names.include?('@dumplibrary')
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

When /^I? ?reset the database to '(.+)'$/ do |db|
  $Firefox.BetterBibTeX.reset(db)
end

When /^I import (.+) from '(.+?)'(?:(?: as )'(.+)')?$/ do |items, filename, aliased|
  references = nil
  attachments = nil
  #TODO: count notes
  notes = nil
  items.split(/\s+/).reject{|word| %{wwith and}.include?(word)}.each_slice(2).each{|tgt|
    count, kind = *tgt
    throw "Unexpected non-numeric value #{count.inspect}" unless count =~ /^[0-9]+$/

    if kind =~ /^references?$/
      references = count.to_i
    elsif kind =~ /^notes?$/
      notes = count.to_i
    elsif kind =~ /^attachments?$/
      attachments = count.to_i
    else
      throw "Unexpected item type #{kind.inspect}"
    end
  }

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

      if data['config']['label'] == 'BetterBibTeX JSON'
        (data['config']['preferences'] || {}).each_pair{|key, value|
          next if %w{confirmCacheResetSize tests test.timestamp attachmentRelativePath autoExport debug}.include?(key)
          $Firefox.BetterBibTeX.setPreference('translators.better-bibtex.' + key, value)
        }
        @exportOptions = data['config']['options'] || {}
      end
    end

    # before import, should be empty
    start = Time.now
    state = [$Firefox.BetterBibTeX.librarySize]
    $Firefox.BetterBibTeX.import(bib)

    expected = references.to_i + (attachments.nil? ? 0 : attachments.to_i)

    while state.size < 2 || state[-1].values.inject(:+) != state[-2].values.inject(:+)
      sleep 2
      state << $Firefox.BetterBibTeX.librarySize

      elapsed = Time.now - start
      if elapsed > 5
        current = state[-1]['references'] + (attachments.nil? ? 0 : state[-1]['attachments'])
        baseline = state[0]['references'] + (attachments.nil? ? 0 : state[0]['attachments'])
        processed = current - baseline
        remaining = expected - processed
        speed = processed / elapsed
        if speed == 0
          timeleft = '??'
        else
          timeleft = (Time.mktime(0)+((expected - processed) / speed)).strftime("%H:%M:%S")
        end
        say "Slow import (#{elapsed}): #{processed} entries @ #{speed.round(1)} entries/sec, #{timeleft} remaining"
      end
    end

    expect("#{state[-1]['references'] - state[0]['references']} references").to eq("#{references} references")
    expect("#{state[-1]['attachments'] - state[0]['attachments']} attachments").to eq("#{attachments} attachments") if attachments
  }
end

Then /^write the library to '(.+)'$/ do |filename|
  $Firefox.BetterBibTeX.exportToFile('BetterBibTeX JSON', {}, filename)
end

def testfile(filename)
  f = File.expand_path(File.join('test/fixtures', filename))

  jurism = ENV.keys.select{|k| k =~ /^JURISM/}.sort.first
  pf = File.join(File.dirname(f), File.basename(f, File.extname(f)) + ".#{jurism && ENV[jurism] == 'true' ? 'juris-m' : 'zotero'}" + File.extname(f))
  return pf if File.file?(pf)
  return f
end

def normalize_library(library, nocollections)
  library.delete('keymanager')
  library.delete('cache')
  library.delete('config')
  library.delete('id')

  fields = %w{
    DOI ISBN ISSN abstractNote applicationNumber archive archiveLocation assignee
    bookTitle callNumber caseName code conferenceName country court creators
    date dateDecided dateEnacted distributor docketNumber edition encyclopediaTitle episodeNumber
    extra filingDate firstPage institution issue issueDate issuingAuthority itemID
    itemType journalAbbreviation jurisdiction key language legalStatus libraryCatalog manuscriptType
    medium multi nameOfAct network note notes numPages number
    numberOfVolumes pages patentNumber place priorityNumbers proceedingsTitle programTitle publicLawNumber
    publicationTitle publisher references related relations reportNumber reportType reporter
    reporterVolume rights runningTime section seeAlso series seriesNumber seriesText
    seriesTitle shortTitle status studio tags thesisType title type
    university url videoRecordingFormat volume websiteTitle websiteType
  }
  # item order doesn't matter, but for my tests I need them to be stable
  library['items'].sort_by!{|item| fields.collect{|field| item[field].to_s } }

  idmap = {}
  library['items'].each_with_index{|item, i| idmap[item['itemID']] = i }

  library['collections'] = [] if nocollections

  scrubhash = lambda{|hash|
    hash.keys.each{|k|
      case hash[k]
        when Array, Hash
          hash.delete(k) if hash[k].empty?
        when String
          hash.delete(k) if hash[k].strip == ''
        when NilClass
          hash.delete(k)
      end
    }
  }

  library['items'].each_with_index{|item, i|
    item['itemID'] = i
    item.delete('multi')
    item.delete('accessDate')

    item['creators'] ||= []
    item['creators'].each{|creator|
      creator.delete('creatorID')
      creator.delete('multi')
      scrubhash.call(creator)
    }

    # attachment order doesn't matter
    item['attachments'] ||= []
    item['attachments'].each{|att|
      att.delete('path')
      scrubhash.call(att)
    }
    item['attachments'].sort_by!{|att| %w{title url mimeType}.collect{|field| att[field]} }

    item['note'] = Nokogiri::HTML(item['note']).inner_text.gsub(/[\s\n]+/, ' ').strip if item['note']
    item.delete('__citekey__')
    item.delete('__citekeys__')

    scrubhash.call(item)
  }

  renum = lambda{|collection|
    collection.delete('id')
    # item order doesn't matter
    collection['items'] = collection['items'].collect{|id| idmap[id]}.sort if collection['items']
    collection['collections'].each{|sub| renum.call(sub) } if collection['collections']
  }

  renum.call({'collections' => library['collections']})
end

Then /^the library (without collections )?should match '(.+)'$/ do |nocollections, filename|
  expected = testfile(filename)
  expected = JSON.parse(open(expected).read)
  normalize_library(expected, nocollections)

  found = $Firefox.BetterBibTeX.library
  throw "library is not a hash!" unless found.is_a?(Hash)
  normalize_library(found, nocollections)

  options = { wrap: 40, sort: true }
  expect(JSON.neat_generate(found, options)).to eq(JSON.neat_generate(expected, options))
end

def preferenceValue(value)
  value.strip!
  return true if value == 'true'
  return false if value == 'false'
  return Integer(value) if value =~ /^[0-9]+$/
  return value[1..-2] if value =~ /^'[^']+'$/
  return value
end

Then(/^there should have been the following cache activity:$/) do |table|
  cacheStats = $Firefox.BetterBibTeX.cacheStats

  table.hashes.each{|stat|
    stat = OpenStruct.new(stat)
    expect(cacheStats[stat.cache][stat.measure] - @cacheStats[stat.cache][stat.measure]).to eq(stat.value.to_i)
  }

  @cacheStats = cacheStats
end

Then(/^the following library export should match '(.+)':$/) do |filename, table|
  exportOptions = table.rows_hash
  exportOptions.each{ |_,str| preferenceValue(str) }
  exportOptions = @exportOptions.merge(exportOptions)

  translator = exportOptions.delete('translator')
  benchmark = (exportOptions.delete('benchmark') == 'true')

  found = nil
  bm = Benchmark.measure { found = $Firefox.BetterBibTeX.exportToString(translator, exportOptions).strip }
  STDOUT.puts bm if benchmark

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = testfile(filename)
  expected = open(expected).read.strip
  open("tmp/#{File.basename(filename)}", 'w'){|f| f.write(found)} if found != expected
  expect(found).to eq(expected)
end

Then(/show the cache activity/) do
  puts $Firefox.BetterBibTeX.cacheStats.inspect
end

def sort_object(o)
  return o unless o

  return o.collect{|m| sort_object(m)} if o.is_a?(Array)
  
  if o.is_a?(Hash)
    h = {}
    o.keys.sort.each{|k|
      h[k] = sort_object(o[k])
    }
    return h
  end

  return o
end
Then(/^a library export using '(.+)' should match '(.+)'$/) do |translator, filename|
  found = $Firefox.BetterBibTeX.exportToString(translator, @exportOptions).strip

  @expectedExport = OpenStruct.new(filename: filename, translator: translator)

  expected = testfile(filename)
  expected = open(expected).read.strip

  case File.extname(filename)
    when '.json'
      found = JSON.pretty_generate(sort_object(JSON.parse(found)))
      expected = JSON.pretty_generate(sort_object(JSON.parse(expected)))
    when '.yml'
      found = sort_object(YAML.load(found)).to_yaml
      expected = sort_object(YAML.load(expected)).to_yaml
  end

  expect(found).to eq(expected)
end

Then(/^'(.+)' should match '(.+)'$/) do |found, expected|
  found = open(File.expand_path(found)).read.strip
  expected = File.expand_path(File.join('test/fixtures', expected))
  expected = open(expected).read.strip
  expect(found).to eq(expected)
end

Then(/I? ?export the library to '(.+)':$/) do |filename, table|
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
    value = preferenceValue(value)
    value = open(File.expand_path(File.join('test/fixtures', value))).read if name == 'translators.better-bibtex.postscript'
    $Firefox.BetterBibTeX.setPreference(name, value)
  }
end
When(/^I set preference ([^\s]+) to (.*)$/) do |name, value|
  name = "translators.better-bibtex#{name}" if name[0] == '.'
  value = preferenceValue(value)
  if name == 'translators.better-bibtex.postscript'
    value = File.expand_path(File.join('test/fixtures', value))
    value = open(value).read
  end
  $Firefox.BetterBibTeX.setPreference(name, value)
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

Then /^(write|append) the (browser|Zotero) log to '(.+)'$/ do |action, kind, filename|
  open(filename, action[0]){|f| 
    f.write(kind == 'Zotero' ? $Firefox.DebugBridge.log : browserLog)
  }
end

Then /restore '(.+)'$/ do |db|
  $Firefox.BetterBibTeX.restore(db)
end

Then /^save the query log to '(.+)'$$/ do |filename|
  open(filename, 'w'){|f| f.write($Firefox.BetterBibTeX.sql.to_yaml) }
end

Then /^I select the first item where ([^\s]+) = '(.+)'$/ do |attribute, value|
  @selected = $Firefox.BetterBibTeX.find(attribute, value, true)
  expect(@selected).not_to be(nil)
  sleep 3
end

Then /^I remove the selected item$/ do
  $Firefox.BetterBibTeX.remove(@selected)
end
Then /^I restore the trash$/ do
  $Firefox.BetterBibTeX.restore
end

Then /^I (re)?set the citation keys?$/ do |action|
  sleep 3
  $Firefox.BetterBibTeX.selected("#{action}set")
  sleep 3
end

Then /^the markdown citation for ([^\s]*) should be '(.*)'$/ do |keys, citation|
  keys = keys.split(',').collect{|k| k.strip}
  expect($Firefox.ScholarlyMarkdown.citation(keys)).to eq(citation)
end

Then /^the (markdown|html|bbl) bibliography for (.*) should be '(.*)'$/ do |type, keys, bibliography|
  keys = keys.split(',').collect{|k| k.strip}
  found = case type
    when 'markdown' then $Firefox.ScholarlyMarkdown.bibliography(keys).gsub(/[\s\n]+/, ' ')
    when 'html' then $Firefox.ScholarlyMarkdown.bibliographyhtml(keys)
    when 'bbl' then $Firefox.ScholarlyMarkdown.bibliographybbl(keys)
  end
  found.strip!
  expected = bibliography.gsub(/[\s\n]+/, ' ') if type == 'markdown'
  expected.strip!
  expect(found).to eq(expected)
end

When(/^I pick '(.+)' for CAYW$/) do |title|
  @caywPicks << {'id' => $Firefox.BetterBibTeX.find('title', title)}
end

When(/^I pick '(.+)' for CAYW:$/) do |title, table|
  pick = {}
  pick = table.rows_hash
  pick.keys.each{|k| pick[k] = preferenceValue(pick[k]) }
  pick['id'] = $Firefox.BetterBibTeX.find('title', title)
  @caywPicks << pick
end

Then(/^the picks for (.+) should be '(.*)'$/) do |format, expected|
  found = $Firefox.BetterBibTeX.cayw(@caywPicks, format)
  expect(found).to eq(expected)
end

Then(/^the picks for (.+) should match \/(.*)\/$/) do |format, regexp|
  found = $Firefox.BetterBibTeX.cayw(@caywPicks, format)
  expect(found).to match(/#{regexp}/)
end

Then(/^a schomd (.+) request using '(.+)' should match '(.+)'$/) do |method, params, expected|
  header = {'Content-Type': 'text/json'}
  schomd = {'method': method, 'params': JSON.parse(params) }

  uri = URI.parse('http://127.0.0.1:23119/better-bibtex/schomd')
  http = Net::HTTP.new(uri.host, uri.port)
  request = Net::HTTP::Post.new(uri.request_uri, header)
  request.body = schomd.to_json

  # Send the request
  response = http.request(request)

  expected = JSON.parse(open(File.join('test/fixtures', expected)).read)
  found = JSON.parse(response.body.strip)
  expect(found).to eq(expected)
end
