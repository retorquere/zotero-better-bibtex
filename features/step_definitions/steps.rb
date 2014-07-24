require 'headless'
require 'selenium-webdriver'
require 'json'
require 'pp'
require 'fileutils'

Before do
  $headless ||= false
  unless $headless
    $headless = Headless.new
    $headless.start

    extensions = {
      zotero: Dir[File.expand_path(File.join(File.dirname(__FILE__), '..', '..', 'tmp', 'zotero-*.xpi'))].first,
      bbt: Dir['zotero-better-*.xpi'].first
    }

    profile = Selenium::WebDriver::Firefox::Profile.new
    extensions.values.each{|xpi|
      profile.add_extension(xpi)
    }
    profile['extensions.zotero.httpServer.enabled'] = true;
    profile['extensions.zotero.debug.store'] = true;
    profile['extensions.zotero.debug.log'] = true;

    profile['browser.download.dir'] = "/tmp/webdriver-downloads"
    profile['browser.download.folderList'] = 2
    profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
    profile['pdfjs.disabled'] = true

    # prevent 'Hi there noob!' popup
    FileUtils.cp_r('features/zotero', profile.layout_on_disk)

    BROWSER = Selenium::WebDriver.for :firefox, :profile => profile
    ZOTERO = JSONRPCClient.new('http://localhost:23119/better-bibtex/debug')
  end

  ZOTERO.reset
end
at_exit do
  $headless.destroy
end


Before('@import') do
  @testKind = 'import'
end
Before('@export') do
  @testKind = 'export'
end

Given /^that ([^\s]+) is set to (.*)$/ do |pref, value|
  if value =~ /^['"](.*)['"]$/
    ZOTERO.setCharPref(pref, $1)
  elsif ['false', 'true'].include?(value.downcase)
    ZOTERO.setBoolPref(pref, value.downcase == 'true')
  elsif value.downcase == 'null'
    ZOTERO.setCharPref(pref, nil)
  else
    ZOTERO.setIntPref(pref, Integer(value))
  end
end

When /^I import '([^']+)'$/ do |filename|
  bib = File.expand_path(File.join(File.dirname(__FILE__), '..', 'import', filename))
  ZOTERO.import(bib)
  sleep 2
  #puts ZOTERO.log
  #puts browserLog
end

Then /^the library should match '([^']+)'$/ do |filename|
  expected = File.expand_path(File.join(File.dirname(__FILE__), '..', @testKind, filename))

  case File.extname(expected)
    when '.json'
      expected = JSON.parse(open(expected).read)
      expected = expected['items'] if expected.is_a?(Hash) && expected['items']
      expected.each{|item|
        item['attachments'].each{|a| a.delete('path')} if item['attachments']
      }
      expected.normalize!

      found = ZOTERO.getAll
      found.each{|item|
        item.delete('id')
        item['attachments'].each{|a| a.delete('path')} if item['attachments']
      }
      found.normalize!

      expect(found).to eq(expected)
    else
      throw "Unexpected #{@testkind} match file #{filename}"
  end
end

When(/^I export the library using '([^']+)'$/) do |translator|
  @export = ZOTERO.export(translator)
end

When(/^I set export option useJournalAbbreviation to true$/) do
  pending # express the regexp above with the code you wish you had
  end

When(/^I set (preference|export option) ([^\s]+) to (.*)$/) do |setting, name, value|
  value.strip!
  value = case value
            when 'true', 'false' then (value == 'true')
            when /^'.*'$/ then value.gsub(/^'|'$/, '')
            else Integer(value)
          end

  case setting
    when 'preference'
      case value.class
        when String
          ZOTERO.setCharPref(name, value)
        when Integer
          ZOTERO.setIntPref(name, value)
        else
          ZOTERO.setBoolPref(name, value)
      end

    else
      ZOTERO.setExportOption(name, value)
  end
end

Then(/^the output should match '([^']+)'$/) do |filename|
  expected = File.expand_path(File.join(File.dirname(__FILE__), '..', @testKind, filename))
  expect(@export).to eq(open(expected).read)
end


Then /^sleep ([0-9]+) seconds$/ do |secs|
  puts "sleeping #{secs} seconds"
  sleep Integer(secs)
  puts "proceeding"
end

Then /^show the (browser|Zotero) log$/ do |kind|
  puts ZOTERO.log if kind == 'Zotero'
  puts browserLog if kind == 'browser'
end
