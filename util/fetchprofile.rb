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
  PROFILES_DIR = File.expand_path('~/.zotero/zotero')
elsif OS.mac?
  PROFILES_DIR = File.expand_path('~/Library/Application Support/Zotero')
else
  puts OS.report
  exit 1
end

PROFILES = IniFile.load(File.join(PROFILES_DIR, 'profiles.ini'))

PROFILE = 'BBTZ5TEMPLATE'
profile = PROFILES[PROFILES.sections.select{|name| PROFILES[name]['Name'] == PROFILE}[0]]
raise "Profile #{PROFILE} not found in #{File.join(PROFILES_DIR, 'profiles.ini')}" unless profile
puts profile.inspect
PROFILE_DIR = File.expand_path(profile['IsRelative'] == 1 ? File.join(PROFILES_DIR, profile['Path']) : profile['Path'])

DATA_DIR = File.expand_path('~/Zotero')

TEMPLATE_STASH = File.join(File.dirname(__FILE__), '../../test/fixtures/profile')
FileUtils.rm_rf(File.join(TEMPLATE_STASH, 'profile'))
FileUtils.cp_r(PROFILE_DIR, File.join(TEMPLATE_STASH, 'profile'))
FileUtils.rm_rf(File.join(TEMPLATE_STASH, 'data'))
FileUtils.cp_r(DATA_DIR, File.join(TEMPLATE_STASH, 'data'))
