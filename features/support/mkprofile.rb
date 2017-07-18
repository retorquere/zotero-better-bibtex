#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'
require 'selenium/webdriver'
require 'httparty'
require 'shellwords'
require 'benchmark'

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

module BBT
  if OS.linux?
    profiles = File.expand_path('~/.zotero/zotero')
    zotero = File.expand_path('~/bin/zotero/zotero')
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
  else
    profiles_ini['General']['StartWithLastProfile'] = 1
  end
  
  profile_name = 'BBTZ5TEST'
  profile_tgt = File.expand_path("~/.#{profile_name}.profile")
  data_tgt = File.expand_path("~/.#{profile_name}.data")
  
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
  profile = Selenium::WebDriver::Firefox::Profile.new(File.join(fixtures, 'profile/profile'))
  #profile.log_file = File.expand_path(File.join(File.dirname(__FILE__), "#{ENV['LOGS'] || '.'}/firefox-console.log"))
  
  system("npm run build") || raise("Build failed")
  plugins = File.expand_path(File.join(File.dirname(__FILE__), '../../xpi/*.xpi'))
  Dir[plugins].each{|plugin|
    puts "Installing #{plugin}"
    profile.add_extension(plugin)
  }
  
  profile['extensions.checkCompatibility.5.0'] = false
  profile['extensions.zotero.dataDir'] = data_tgt
  profile['extensions.zotero.debug.log'] = true
  profile['extensions.zotero.debug.store'] = true
  profile['extensions.zotero.debug.time'] = true
  profile['extensions.zotero.firstRun2'] = false
  profile['extensions.zotero.firstRunGuidance'] = false
  profile['extensions.zotero.reportTranslationFailure'] = false
  
  FileUtils.rm_rf(profile_tgt)
  FileUtils.cp_r(profile.layout_on_disk, profile_tgt)
  FileUtils.rm_rf(data_tgt)
  FileUtils.cp_r(File.join(fixtures, 'profile/data'), data_tgt)
  
  pid = Process.fork{ system("#{zotero} -P BBTZ5TEST -ZoteroDebugText > #{File.expand_path('~/.BBTZ5TEST.log').shellescape} 2>&1") }
  
  puts Benchmark.measure {
    print "Starting Zotero."
    attempts = 0
    while true
      begin
        sleep(1)
        result = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", headers: { 'Content-Type' => 'text/plain' }, body: """
          Zotero.debug('{better-bibtex:debug bridge}: waiting for Zotero ready...');
          yield Zotero.Schema.schemaUpdatePromise;
          Zotero.debug('{better-bibtex:debug bridge}: Zotero ready');
          yield Zotero.BetterBibTeX.ready;
          Zotero.debug('{better-bibtex:debug bridge}: BetterBibTeX ready');
          return true;
        """)
        if result.body.to_s.strip == 'true'
          puts "Zotero Running"
          break
        end
      rescue Errno::ECONNREFUSED => e
        print '.'
        attempts += 1
        raise "Could not connect to Zotero after #{attempts} attempts" if attempts >= 60
      end
    end
  }

  at_exit {
    result = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", timeout: 10, headers: { 'Content-Type' => 'text/plain' }, body: """
      var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
      appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
    """)
    sleep(5)
    Process.kill("HUP", pid)
  } unless ENV['KEEP_ZOTERO_RUNNING'] == 'true'

  result = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", timeout: 10, headers: { 'Content-Type' => 'text/plain' }, body: """
    var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
    var filename = #{File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures/export/(non-)dropping particle handling #313.json')).to_json};
    file.initWithPath(filename);
    yield Zotero_File_Interface.importFile(file, false);
    return filename;
  """)
  puts result
end
