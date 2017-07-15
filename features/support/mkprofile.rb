#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'
require 'selenium/webdriver'
require 'httparty'
require 'shellwords'
require 'benchmark'

if OS.linux?
  profiles_dir = File.expand_path('~/.zotero/zotero')
  zotero_bin = File.expand_path('~/bin/zotero/zotero')
elsif OS.mac?
  profiles_dir = File.expand_path('~/Library/Application Support/Zotero')
  zotero_bin = File.expand_path('/Applications/Zotero.app/Contents/MacOS/zotero')
else
  puts OS.report
  exit 1
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

FileUtils.mkdir_p(profiles_dir)
profiles = File.join(profiles_dir, 'profiles.ini')
File.open(profiles, "w") {} unless File.file?(profiles)
profiles = IniFile.load(profiles)

if !profiles.has_section?('General')
  profiles['General'] = { 'StartWithLastProfile' => 1 }
else
  profiles['General']['StartWithLastProfile'] = 1
end

profile_name = 'BBTZ5TEST'
profile_dir = File.expand_path("~/.#{profile_name}.profile")
data_dir = File.expand_path("~/.#{profile_name}.data")

profile = nil
profiles.each{|section, param, val|
  profile = section if param == 'Name' && val ==  profile_name
}
if profile.nil?
  free = 0
  while true do
    profile = "Profile#{free}"
    break unless profiles.has_section?(profile)
    free += 1
  end

  profiles[profile]['Name'] = profile_name
end
profiles[profile]['IsRelative'] = 0
profiles[profile]['Path'] = profile_dir
profiles[profile]['Default'] = nil

profiles.each_section do |section|
  puts section
  puts profiles[section].to_yaml
end

profiles.write_compact

fixtures = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures'))
profile = Selenium::WebDriver::Firefox::Profile.new(File.join(fixtures, 'profile/profile'))
profile.log_file = File.expand_path(File.join(File.dirname(__FILE__), "#{ENV['LOGS'] || '.'}/firefox-console.log"))

puts "Installing plugins..."
plugins = File.expand_path(File.join(File.dirname(__FILE__), '../../xpi/*.xpi'))
Dir[plugins].each{|plugin| profile.add_extension(plugin) }

profile['extensions.zotero.dataDir'] = data_dir
#profile['extensions.checkCompatibility.5.0'] = false

profile['extensions.checkCompatibility.5.0'] = false
profile['extensions.zotero.dataDir'] = data_dir
profile['extensions.zotero.debug.log'] = true
profile['extensions.zotero.debug.store'] = true
profile['extensions.zotero.debug.time'] = true
profile['extensions.zotero.firstRun2'] = false
profile['extensions.zotero.firstRunGuidance'] = false
profile['extensions.zotero.reportTranslationFailure'] = false

FileUtils.rm_rf(profile_dir)
FileUtils.cp_r(profile.layout_on_disk, profile_dir)
FileUtils.rm_rf(data_dir)
FileUtils.cp_r(File.join(fixtures, 'profile/data'), data_dir)
puts profile_dir

#job1 = fork do
  #exec "#{zotero_bin} -P BBTZ5TEST -ZoteroDebugText -ZoteroSkipBundledFiles > #{File.expand_path('~/.BBTZ5TEST.log').shellescape} 2>&1"
#end
#Process.detach(job1)
pid = Process.fork{ system("#{zotero_bin} -P BBTZ5TEST -ZoteroDebugText -ZoteroSkipBundledFiles > #{File.expand_path('~/.BBTZ5TEST.log').shellescape} 2>&1") }
at_exit { Process.kill("HUP", pid) }

puts Benchmark.measure {
  attempts = 0
  while true
    begin
      sleep(1)
      result = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", headers: { 'Content-Type' => 'text/plain' }, body: """
        Zotero.debug('BBT: waiting for Zotero ready...');
        yield Zotero.Schema.schemaUpdatePromise;
        Zotero.debug('BBT: Zotero ready');
        return true;
      """)
      puts result
      break
    rescue Errno::ECONNREFUSED => e
      print '.'
      attempts += 1
      raise "Could not connect to Zotero after #{attempts} attempts" if attempts >= 60
    end
  end
}

result = HTTParty.post("http://127.0.0.1:23119/debug-bridge/execute", headers: { 'Content-Type' => 'text/plain' }, body: """
  var appStartup = Components.classes['@mozilla.org/toolkit/app-startup;1'].getService(Components.interfaces.nsIAppStartup);
  appStartup.quit(Components.interfaces.nsIAppStartup.eAttemptQuit);
""")
puts result
