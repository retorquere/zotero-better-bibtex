#!/usr/bin/env ruby

require 'os'
require 'inifile'
require 'yaml'
require 'fileutils'
require 'selenium/webdriver'
require 'httparty'
require 'shellwords'
require 'benchmark'

$zotero = ARGV[0].nil? || ARGV[0].downcase != 'j' ? 'zotero' : 'jurism'

puts "Getting #{$zotero}"

if OS.linux?
  PROFILES_DIR = File.expand_path("~/.#{$zotero}/zotero")
elsif OS.mac?
  PROFILES_DIR = File.expand_path('~/Library/Application Support/Zotero')
else
  puts OS.report
  exit 1
end

puts PROFILES_DIR
PROFILES = IniFile.load(File.join(PROFILES_DIR, 'profiles.ini'))

PROFILE = 'BBTZ5TEMPLATE'
profile = PROFILES[PROFILES.sections.select{|name| PROFILES[name]['Name'] == PROFILE}[0]]
raise "Profile #{PROFILE} not found in #{File.join(PROFILES_DIR, 'profiles.ini')}" unless profile
puts profile.inspect
PROFILE_DIR = File.expand_path(profile['IsRelative'] == 1 ? File.join(PROFILES_DIR, profile['Path']) : profile['Path'])

dataDir = nil
useDataDir = false
IO.readlines(File.join(PROFILE_DIR, 'prefs.js')).each{|pref|
  if pref =~ /^user_pref\("extensions.zotero.dataDir", "([^"]+)"\);$/
    dataDir = $1
  end

  if pref =~ /^user_pref\("extensions.zotero.useDataDir", true\);$/
    useDataDir = true
  end
}

TEMPLATE_STASH = File.expand_path(File.join(File.dirname(__FILE__), "../test/fixtures/profile/fetched-#{$zotero}"))

puts "#{PROFILE_DIR} => #{TEMPLATE_STASH}"

FileUtils.rm_rf(TEMPLATE_STASH)
FileUtils.cp_r(PROFILE_DIR, TEMPLATE_STASH)
FileUtils.cp_r(dataDir, File.join(TEMPLATE_STASH, $zotero)) if useDataDir

puts "WARNING: #{$zotero} uses dataDir" if dataDir
