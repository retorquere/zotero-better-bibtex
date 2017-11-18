#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'
require 'selenium/webdriver'
require 'httparty'
require 'shellwords'
require 'benchmark'
require 'json'
require 'reverse_markdown'

if !OS.mac? && (ENV['HEADLESS'] || 'true') == 'true'
  STDOUT.puts "Starting headless..."
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

class IniFile
  def write_compact( opts = {} )
    filename = opts.fetch(:filename, @filename)
    encoding = opts.fetch(:encoding, @encoding)
    mode = encoding ? "w:#{encoding}" : "w"

    File.open(filename, mode) do |f|
      @ini.each do |section,hash|
        f.puts "[#{section}]"
        hash.each {|param,val| f.puts "#{param}#{@param}#{escape_value val}" unless val.nil?}
        f.puts
      end
    end
    self
  end
end

class HTTPInternalError < StandardError; end
class HTTPNotFoundError < StandardError; end

def execute(options)
  options = {script: options} if options.is_a?(String)
  options = {
    timeout: 10,
    headers: { 'Content-Type' => 'text/plain' },
  }.merge(options || {})
  args = options.delete(:args) || {}
  options[:body] = "var args = #{args.to_json};\n" + options.delete(:script)

  #STDOUT.puts "Executing " + options[:body][0..60].gsub(/\n/, ' ') + "..."
  #STDOUT.flush
  port = ENV['JURISM'] == 'true' ? 24119 : 23119
  response = HTTParty.post("http://127.0.0.1:#{port}/debug-bridge/execute", options)
  #STDOUT.puts "Got " + response.body[0..60].gsub(/\n/, ' ') + '...'
  #STDOUT.flush

  case response.code
    when 200, 201
      return response.parsed_response
    when 500
      raise HTTPInternalError.new(response.body)
    when 404
      raise HTTPNotFoundError.new
    else
      raise "Unexpected response code #{response.code.inspect}"
  end
end

#def normalize_library(library, collections=false)
#  library.delete('keymanager')
#  library.delete('cache')
#  library.delete('config')
#  library.delete('id')
#
#  fields = %w{
#    DOI ISBN ISSN abstractNote applicationNumber archive archiveLocation assignee
#    bookTitle callNumber caseName code conferenceName country court creators
#    date dateDecided dateEnacted distributor docketNumber edition encyclopediaTitle episodeNumber
#    extra filingDate firstPage institution issue issueDate issuingAuthority itemID
#    itemType journalAbbreviation jurisdiction key language legalStatus libraryCatalog manuscriptType
#    medium multi nameOfAct network note notes numPages number
#    numberOfVolumes pages patentNumber place priorityNumbers proceedingsTitle programTitle publicLawNumber
#    publicationTitle publisher references related relations reportNumber reportType reporter
#    reporterVolume rights runningTime section seeAlso series seriesNumber seriesText
#    seriesTitle shortTitle status studio tags thesisType title type
#    university url videoRecordingFormat volume websiteTitle websiteType
#  }
#  # item order doesn't matter, but for my tests I need them to be stable
#  library['items'].sort_by!{|item| fields.collect{|field| item[field].to_s } }
#
#  idmap = {}
#  library['items'].each_with_index{|item, i| idmap[item['itemID']] = i }
#
#  library['collections'] = [] unless collections
#
#  scrubhash = lambda{|hash|
#    hash.keys.each{|k|
#      case hash[k]
#        when Array, Hash
#          hash.delete(k) if hash[k].empty?
#        when String
#          hash.delete(k) if hash[k].strip == ''
#        when NilClass
#          hash.delete(k)
#      end
#    }
#  }
#
#  library['items'].each_with_index{|item, i|
#    item['itemID'] = i
#    item.delete('multi')
#    item.delete('accessDate')
#
#    item['creators'] ||= []
#    item['creators'].each{|creator|
#      creator.delete('creatorID')
#      creator.delete('multi')
#      scrubhash.call(creator)
#    }
#
#    # attachment order doesn't matter
#    item['attachments'] ||= []
#    item['attachments'].each{|att|
#      att.delete('path')
#      scrubhash.call(att)
#    }
#    item['attachments'].sort_by!{|att| %w{title url mimeType}.collect{|field| att[field]} }
#
#    item['note'] = Nokogiri::HTML(item['note']).inner_text.gsub(/[\s\n]+/, ' ').strip if item['note']
#    item.delete('__citekey__')
#    item.delete('__citekeys__')
#
#    scrubhash.call(item)
#  }
#
#  renum = lambda{|collection|
#    collection.delete('id')
#    # item order doesn't matter
#    collection['items'] = collection['items'].collect{|id| idmap[id]}.sort if collection['items']
#    collection['collections'].each{|sub| renum.call(sub) } if collection['collections']
#  }
#
#  renum.call({'collections' => library['collections']})
#end

TRANSLATORS = {}

def normalizeJSON(lib)
  itemIDs = {}

  lib.delete('config')
  if lib['config']
    lib['config'].delete('options')
    lib['config'].delete('preferences')
    lib['config'].delete('release')
  end

  lib.delete('keymanager')
  lib.delete('cache')
  lib['items'].each_with_index{|item, itemID|
    itemIDs[item['itemID']] = itemID
    item['itemID'] = itemID

    item.delete('dateAdded')
    item.delete('dateModified')
    item.delete('uniqueFields')
    item.delete('key')
    item.delete('citekey')
    item.delete('attachments')
    item.delete('collections')
    item.delete('__citekey__')
    item.delete('uri')

    item['notes'] = (item['notes'] || []).collect{|note| note.is_a?(String) ? note : note['note'] }.collect{|note| ReverseMarkdown.convert(note) }.sort

    item['note']  = ReverseMarkdown.convert(item['note']) if item['note']

    item['tags'] = (item['tags'] || []).collect{|tag| tag.is_a?(String) ? tag : tag['tag'] }.sort

    item.keys.each{|k|
      item.delete(k) if item[k].nil?
      item.delete(k) if (item[k].is_a?(Hash) || item[k].is_a?(Array)) && item[k].empty?
    }
  }

  if lib['collections']
    collections = lib['collections']
    while collections.values.find{|coll| !coll['path'] }
      collections.values.each{|coll|
        next if coll['path']

        if !coll['parent']
          coll['path'] = [ coll['name'] ]
        elsif collections[coll['parent']]['path']
          coll['path'] = collections[coll['parent']]['path'] + [ coll['name'] ]
        end
      }
    end
    collections.each_pair{|key, coll|
      coll['key'] = coll['path'].join(' ::: ')
      coll.delete('path')
      coll.delete('id')
    }
    collections.each_pair{|key, coll|
      coll['parent'] = collections[coll['parent']]['key'] if coll['parent']
      coll['collections'] = coll['collections'].collect{|key| collections[key]['key'] }
      coll['items'] = coll['items'].collect{|itemID| itemIDs[itemID] }
    }
    lib['collections'] = Hash[*(collections.values.collect{|coll| [coll['key'], coll] }.flatten)]
  end

  return lib
end

def serialize(obj)
  return JSON.neat_generate(obj, { wrap: 40, sort: true })
end
def compare(found, expected)
  size = 30
  if found.length < size || expected.length < size
    expect(serialize(found)).to eq(serialize(expected))
  else
    (0...[found.length, expected.length].max).step(size){|chunk|
      expect(serialize(found.slice(chunk, size))).to eq(serialize(expected.slice(chunk, size)))
    }
  end
end
#def compare(found, expected)
  #found['items'].zip(expected['items']).each{|f, e|
    #expect(JSON.neat_generate(f, { wrap: 40, sort: true }).to eq(JSON.neat_generate(e, { wrap: 40, sort: true }))
  #}
#end

def exportLibrary(displayOptions:, collection: nil, output: nil, translator:, expected: nil)
  throw "Auto-export needs a destination" if displayOptions['keepUpdated'] && !output
    
  if translator =~ /^id:(.+)$/
    translator = $1
  else
    translator = TRANSLATORS['byName'][translator]['translatorID']
  end

  found = execute(
    timeout: 600,
    args: { translatorID: translator, displayOptions: displayOptions, path: output, collection: collection || nil },
    script: 'return yield Zotero.BetterBibTeX.TestSupport.exportLibrary(args.translatorID, args.displayOptions, args.path, args.collection)'
  )

  return if expected == :ignore

  found = File.read(output) if output

  if expected =~ /\.csl\.json$/
    expected_type = :csl_json
  elsif expected =~ /\.json$/
    expected_type = :bbt_json
  elsif expected =~ /\.yml$/
    expected_type = :csl_yaml
  end

  expected = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', expected))
  expected = File.read(expected)

  case expected_type
    when :csl_json
      return compare(JSON.parse(found), JSON.parse(expected))

    when :csl_yaml
      return compare(YAML.load(found), YAML.load(expected))
      #found = sort_object(YAML.load(found)).to_yaml
      #expected = sort_object(YAML.load(expected)).to_yaml

    when :bbt_json
      found = normalizeJSON(JSON.parse(found))
      expected = normalizeJSON(JSON.parse(expected))

      if found['items'].length < 30 || expected['items'].length < 30
        return expect(serialize(found)).to eq(serialize(expected))
      else
        expect(serialize(found.merge({'items' => []}))).to eq(serialize(expected.merge({'items' => []})))
        return compare(found['items'], expected['items'])
      end
  end

  expect(found.strip).to eq(expected.strip)
end

module BBT
  system("npm run build") || raise("Build failed")
  TRANSLATORS.merge!(JSON.parse(File.read(File.join(File.dirname(__FILE__), '../../gen/translators.json'))))

  if OS.linux?
    if ENV['JURISM'] == 'true'
      profiles = File.expand_path('~/.jurism/jurism')
      zotero = File.expand_path('~/bin/jurism/jurism')
    else
      profiles = File.expand_path('~/.zotero/zotero')
      zotero = File.expand_path('~/bin/zotero/zotero')
    end
  elsif OS.mac?
    profiles = File.expand_path('~/Library/Application Support/Zotero')
    zotero = File.expand_path('/Applications/Zotero.app/Contents/MacOS/zotero')
  else
    raise OS.report
  end
  
  FileUtils.mkdir_p(profiles)
  profiles_ini = File.join(profiles, 'profiles.ini')
  File.open(profiles_ini, "w") {} unless File.file?(profiles_ini)
  profiles_ini = IniFile.load(profiles_ini)
  
  if !profiles_ini.has_section?('General')
    profiles_ini['General'] = { 'StartWithLastProfile' => 1 }
  end
  
  profile_name = 'BBTZ5TEST'
  profile_tgt = File.expand_path("~/.#{profile_name}")
  
  profile_id = nil
  profiles_ini.each{|section, param, val|
    profile_id = section if param == 'Name' && val ==  profile_name
  }
  if profile_id.nil?
    free = 0
    while true do
      profile_id = "Profile#{free}"
      break unless profiles_ini.has_section?(profile_id)
      free += 1
    end
  
    profiles_ini[profile_id]['Name'] = profile_name
  end
  profiles_ini[profile_id]['IsRelative'] = 0
  profiles_ini[profile_id]['Path'] = profile_tgt
  profiles_ini[profile_id]['Default'] = nil
  profiles_ini.write_compact
  
  fixtures = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures'))
  profile = Selenium::WebDriver::Firefox::Profile.new(File.join(fixtures, "profile/#{ENV['JURISM'] == 'true' ? 'jurism' : 'zotero'}"))
  #profile.log_file = File.expand_path(File.join(File.dirname(__FILE__), "#{ENV['LOGS'] || '.'}/firefox-console.log"))
  
  plugins = Dir[File.expand_path(File.join(File.dirname(__FILE__), '../../xpi/*.xpi'))]
  plugins += Dir[File.expand_path(File.join(File.dirname(__FILE__), '../../xpi/extra/*.xpi'))]
  plugins.each{|plugin|
    STDOUT.puts "Installing #{plugin}"
    profile.add_extension(plugin)
  }
  
  profile["browser.EULA.3.accepted"] = true
  profile["browser.EULA.override"] = true

  profile["browser.displayedE10SNotice"] = 4
  profile["browser.dom.window.dump.enabled"] = true
  profile["browser.laterrun.enabled"] = false
  profile["browser.link.open_external"] = 2
  profile["browser.link.open_newwindow"] = 2
  profile["browser.newtab.url"] = "about:blank"
  profile["browser.newtabpage.enabled"] = false
  profile["browser.offline"] = false
  profile["browser.reader.detectedFirstArticle"] = true
  profile["browser.safebrowsing.enabled"] = false
  profile["browser.safebrowsing.malware.enabled"] = false
  profile["browser.search.update"] = false
  profile["browser.selfsupport.url"] = ""
  profile["browser.sessionstore.resume_from_crash"] = false
  profile["browser.shell.checkDefaultBrowser"] = false
  profile["browser.startup.homepage"] = "about:blank"
  profile["browser.startup.page"] = 0
  profile["browser.tabs.warnOnClose"] = false
  profile["browser.tabs.warnOnOpen"] = false
  profile["browser.usedOnWindows10.introURL"] = "about:blank"
  profile["datareporting.healthreport.logging.consoleEnabled"] = false
  profile["extensions.logging.enabled"] = true
  profile["extensions.zotero.debug.log"] = true
  profile["extensions.zotero.debug.time"] = true
  profile["extensions.zotero.firstRunGuidance"] = false
  profile["datareporting.healthreport.service.firstRun"] = false
  profile["datareporting.healthreport.uploadEnabled"] = false
  profile["datareporting.policy.dataSubmissionPolicyAccepted"] = false
  profile["devtools.errorconsole.enabled"] = true
  profile["devtools.source-map.locations.enabled"] = true
  profile["dom.disable_open_during_load"] = false
  profile["dom.max_chrome_script_run_time"] = 30
  profile["dom.max_script_run_time"] = 30
  profile["dom.report_all_js_exceptions"] = true
  profile["extensions.autoDisableScopes"] = 10
  profile["extensions.blocklist.enabled"] = false
  profile["extensions.blocklist.pingCountVersion"] = -1

  if ENV['ZOTERO_LOCALE'] == 'fr'
    profile["intl.locale.matchOS"] = false
    profile["general.useragent.locale"] = 'fr'
    profile["intl.accept_languages"] = 'fr, fr-fr, en-us, en'
  end

  #profile['extensions.zotero.dataDir'] = data_tgt
  profile['extensions.zotero.debug.log'] = true
  profile['extensions.zotero.debug.store'] = true
  profile['extensions.zotero.debug.time'] = true
  profile['extensions.zotero.firstRun2'] = false
  profile['extensions.zotero.firstRunGuidance'] = false
  profile['extensions.zotero.reportTranslationFailure'] = false
  profile['extensions.zotero.translators.better-bibtex.testing'] = true
  profile['extensions.zotero.translators.better-bibtex.removeStock'] = true

  # speed up startup
  profile['extensions.zotero.automaticScraperUpdates'] = false

  profile['devtools.source-map.locations.enabled'] = true
  
  FileUtils.rm_rf(profile_tgt)
  FileUtils.cp_r(profile.layout_on_disk, profile_tgt)
  if ENV['ZOTERO_BIGLY'] == 'true'
    STDOUT.puts "Testing using bigly database!"
    FileUtils.cp(File.join(fixtures, "profile/#{ENV['JURISM'] == 'true' ? 'jurism' : 'zotero'}/zotero/zotero-bigly.sqlite"), File.join(profile_tgt, 'zotero', 'zotero.sqlite'))
  end

  logfile = File.expand_path(ENV['CIRCLE_ARTIFACTS'].to_s != '' ? File.join(ENV['CIRCLE_ARTIFACTS'], 'zotero.log') : '~/.BBTZ5TEST.log')
  pid = Process.fork{ system("#{zotero} -P BBTZ5TEST -ZoteroDebugText -datadir profile > #{logfile.shellescape} 2>&1") }

  at_exit {
    execute("""
      var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
      appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
    """)
    stopped = false
    1.upto(5){
      sleep(1)
      begin
        Process::kill 0, pid
      rescue Errno::ESRCH
        stopped = true
        break
        false
      end
    }
    Process.kill("HUP", pid) unless stopped
  } if (ENV['KILL'] || 'true') == 'true' || (ENV['HEADLESS'] || 'true') == 'true'

  puts Benchmark.measure {
    print "Starting Zotero."
    attempts = 0
    while true
      begin
        sleep(1)
        result = execute(timeout: 60, script: """
          if (!Zotero.BetterBibTeX.ready) {
            Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX not initialized')
            return false;
          }

          Zotero.debug('{better-bibtex:debug bridge}: startup: waiting for BetterBibTeX ready...')
          yield Zotero.BetterBibTeX.ready;
          Zotero.debug('{better-bibtex:debug bridge}: startup: BetterBibTeX ready!');
          return true;
        """)
        if result
          puts "Zotero Running"
          break
        end
      rescue Errno::ECONNREFUSED, Net::ReadTimeout, HTTPNotFoundError
        attempts += 1
        if attempts >= 60 * (ENV['ZOTERO_BIGLY'] == 'true' ? 100 : 1)
          raise "Could not connect to Zotero after #{attempts} attempts"
        else
          STDOUT.puts "#{attempts}: could not connect to Zotero, retrying..."
          STDOUT.flush
        end
      end
      print '.'
    end

    # test whether the existing references, if any, have gotten a cite key
    exportLibrary(translator: 'Better BibTeX', displayOptions: {}, expected: :ignore)
  }
end
