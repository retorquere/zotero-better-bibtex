#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'
require 'selenium/webdriver'

if OS.linux?
  profiles_dir = File.expand_path('~/.zotero/zotero')
elsif OS.mac?
  profiles_dir = File.expand_path('~/Library/Application Support/Zotero')
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

profiles['General']['StartWithLastProfile'] = 1

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

fixtures = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures/profile'))
profile = Selenium::WebDriver::Firefox::Profile.new(File.join(fixtures, 'profile'))
profile.log_file = File.expand_path(File.join(File.dirname(__FILE__), "#{ENV['LOGS'] || '.'}/firefox-console.log"))

puts "Installing plugins..."
profile.add_extension('/home/emile/Downloads/mozrepl-1.1.2-fx.xpi')

profile['extensions.zotero.dataDir'] = data_dir
profile['extensions.checkCompatibility.5.0'] = false

FileUtils.rm_rf(profile_dir)
FileUtils.cp_r(profile.layout_on_disk, profile_dir)
FileUtils.rm_rf(data_dir)
FileUtils.cp_r(File.join(fixtures, 'data'), data_dir)
puts profile_dir
