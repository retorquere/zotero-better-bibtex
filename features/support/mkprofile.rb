#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'

if OS.linux?
  profiles_dir = File.expand_path('~/.zotero/zotero/')
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

profiles = IniFile.load(File.join(profiles_dir, 'profiles.ini'))

profiles['General']['StartWithLastProfile'] = 0

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

FileUtils.rm_rf(profile_dir)
FileUtils.rm_rf(data_dir)

FileUtils.cp_r(File.join(File.dirname(__FILE__), '../../test/fixtures/profile/profile'), profile_dir)
FileUtils.cp_r(File.join(File.dirname(__FILE__), '../../test/fixtures/profile/data'), data_dir)

File.open(File.join(profile_dir, 'prefs.js'), 'w'){|prefs|
  File.readlines(File.join(File.dirname(__FILE__), '../../test/fixtures/profile/profile/prefs.js')).each{|pref|
    if pref.start_with?('user_pref("extensions.zotero.dataDir",')
      prefs.puts("user_pref(\"extensions.zotero.dataDir\", #{data_dir.inspect});")
    else
      prefs.puts(pref)
    end
  }
}
