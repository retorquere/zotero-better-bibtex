require 'headless'
require 'selenium-webdriver'
require 'json'
require 'pp'

Before do
  $headless ||= false
  unless $headless
    $headless = Headless.new
    $headless.start

    profile = Selenium::WebDriver::Firefox::Profile.new('/home/emile/zotero/zotero-better-bibtex/test/profile')
    profile.add_extension('zotero-better-bibtex-0.5.47-stable-keys.xpi')
    profile['extensions.zotero.httpServer.enabled'] = true;
    profile['extensions.zotero.debug.store'] = true;
    profile['extensions.zotero.debug.log'] = true;

    profile['browser.download.dir'] = "/tmp/webdriver-downloads"
    profile['browser.download.folderList'] = 2
    profile['browser.helperApps.neverAsk.saveToDisk'] = "application/pdf"
    profile['pdfjs.disabled'] = true

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

  if File.extname(expected) == '.json'
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
    #puts ZOTERO.log
    #puts browserLog
  end
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
