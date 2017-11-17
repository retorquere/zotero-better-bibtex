require 'fileutils'
require 'neatjson'

Before do |scenario|
  execute(
    timeout: 120,
    script: 'yield Zotero.BetterBibTeX.TestSupport.reset()'
  ) unless scenario.source_tag_names.include?('@noreset')
  @displayOptions = {}
  @selected = nil
  @picked = []
  @explicitprefs = {}
end

def preferenceValue(value)
  value.strip!
  return true if value == 'true'
  return false if value == 'false'
  return Integer(value) if value =~ /^[0-9]+$/
  return value[1..-2] if value =~ /^'[^']+'$/
  return value[1..-2] if value =~ /^"[^"]+"$/
  return value
end
def setPreferences(prefs)
  args = { prefs: {} }
  prefs.each_pair{|pref, value|
    @explicitprefs[pref] = true
    pref = "translators.better-bibtex#{pref}" if pref[0] == '.'
    value = preferenceValue(value)
    value = open(File.expand_path(File.join('test/fixtures', value))).read if pref == 'translators.better-bibtex.postscript'
    args[:prefs][pref] = value
  }

  execute(
    args: args,
    script: """
      for (var pref in args.prefs) {
        Zotero.Prefs.set(pref, args.prefs[pref]);
      }
    """
  )
end
When(/^I set the following preferences:$/) do |table|
  setPreferences(table.rows_hash)
end
When /^I set preference ([^\s]+) to (.*)$/ do |pref, value|
  prefs = {}
  prefs[pref] = value
  setPreferences(prefs)
end

When /^I import (\d+) references? (?:with (\d+) attachments? )?from "([^"]+)"(?: into (a new collection|"[^"]+"))?$/ do |references, attachments, source, collection|
  if !collection
    # pass
  elsif collection[0] == '"'
    collection = collection[1...-1]
  else
    collection = :new
  end

  source = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', source))

  if source =~ /\.json$/i
    config = JSON.parse(File.read(source))['config'] || {}
    preferences = config['preferences'] || {}
    @displayOptions = config['options'] || {}

    preferences.keys.each{|pref|
      preferences.delete(pref) if @explicitprefs[".#{pref}"]
    }
    preferences.delete('testing')
  else
    @displayOptions = {}
    preferences = nil
  end

  references = Integer(references)
  attachments = attachments.nil? ? 0 : Integer(attachments)

  imported = nil
  Dir.mktmpdir{|dir|
    if collection.is_a?(String)
      orig = source
      source = File.expand_path(File.join(dir, collection))
      FileUtils.cp(orig, source)
    end
    imported = execute(
      timeout: 240,
      args: { filename: source, preferences: preferences, createNewCollection: !!collection },
      script: 'return yield Zotero.BetterBibTeX.TestSupport.importFile(args.filename, args.createNewCollection, args.preferences)'
    )
  }
  expect(imported).to eq(Integer(references))
end

Then /^the library should have (\d+) references/ do |n|
  library = execute("""
      var items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true);
      return items.length;
    """
  )
  expect(library).to eq(Integer(n))
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
#def normalize_library(library, nocollections=true)
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
#  STDOUT.puts library.class.to_s
#  STDOUT.puts library['items'].class.to_s
#  library['items'].sort_by!{|item|
#    fields.collect{|field| item[field].to_s }
#  }
#
#  idmap = {}
#  library['items'].each_with_index{|item, i| idmap[item['itemID']] = i }
#
#  library['collections'] = [] if nocollections
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
Then /^an (auto-)?export (?:of "([^"]*)" )?(?:to "([^"]+)" )?using "([^"]+)" should match "([^"]+)"$/ do |auto, collection, target, translator, library|
  exportLibrary(
    displayOptions: @displayOptions.merge({'keepUpdated' => !!auto}),
    translator: translator,
    collection: collection || nil,
    output: target || nil,
    expected: library
  )
end
Then /^an export using "([^"]+)" with the following export options should match "([^"]+)"$/ do |translator, library, table|
  exportLibrary(
    translator: translator,
    displayOptions: @displayOptions.merge(table.rows_hash),
    expected: library
  )
end
Then /^"([^"]+)" should match "([^"]+)"$/ do |found, expected|
  expected = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', expected)) unless expected[0] == '/'
  expected = File.read(expected)

  found = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', found)) unless found[0] == '/'
  found = File.read(found)

  expect(found.strip).to eq(expected.strip)
end

When(/^I select the first item where ([^\s]+) = "([^"]+)"$/) do |attribute, value|
  @selected = execute(
    args: { attribute: attribute, value: value },
    script: 'return yield Zotero.BetterBibTeX.TestSupport.select(args.attribute, args.value)'
  )
  expect(@selected).not_to be(nil)
  sleep 3
end

When(/^I pick "([^"]+)" for CAYW:$/) do |title, table|
  picked = execute(
    args: { title: title },
    script: 'return yield Zotero.BetterBibTeX.TestSupport.find(args.title)'
  )
  expect(picked).not_to be(nil)

  @picked << table.rows_hash.merge({id: picked})
end

Then("the picks for {string} should be {string}") do |format, expected|
  found = execute(
    args: { format: format, picked: @picked },
    script: 'return yield Zotero.BetterBibTeX.TestSupport.pick(args.format, args.picked)'
  )
  expect(found.strip).to eq(expected)
end

When(/^I remove the selected item$/) do
  execute(
    args: {id: @selected},
    script: 'yield Zotero.Items.trashTx([args.id])'
  )
end

When(/^I (pin|unpin|refresh) (the|all) citation key(s)?$/) do |action, which, multiple|
  raise "'all' must have 'keys'" if which == 'all' && multiple != 's'
  raise "'the' must have 'key'" if which == 'the' && multiple == 's'
  execute(
    args: { itemID: which == 'the' ? @selected : nil, action: action },
    script: 'yield Zotero.BetterBibTeX.TestSupport.pinCiteKey(args.itemID, args.action)'
  )
end

When /The following preferences have been set:/ do |table|
  args = { prefs: {} }
  table.rows_hash.each_pair{|pref, value|
    pref = "translators.better-bibtex#{pref}" if pref[0] == '.'
    value = preferenceValue(value)
    value = open(File.expand_path(File.join('test/fixtures', value))).read if pref == 'translators.better-bibtex.postscript'
    args[:prefs][pref] = value
  }
  found = execute({
    args: args,
    script: %|
      var errors = [];

      for (var pref in args.prefs) {
        var expected = args.prefs[pref];
        try {
          var found = Zorero.Prefs.get(pref);
          if (found !== expected) {
            errors.push(pref + ": expected " + (JSON.stringify(expected)) + ", found " + (JSON.stringify(found)));
          }
        } catch (error) {
          errors.push(pref + " not set");
        }
      }

      return errors.join("\\n");
    |
  })

  expect(found).to eq('')
end

When(/^I wait (\d+) seconds?$/) do |delay|
  sleep(Integer(delay))
end

