require 'fileutils'

TRANSLATORS = JSON.parse(File.read(File.join(File.dirname(__FILE__), '../../gen/translators.json')))

Before do |scenario|
  execute('yield Zotero.BetterBibTeX.TestSupport.reset()') unless scenario.source_tag_names.include?('@noreset')
  @displayOptions = {}
  @selected = nil
end

When /^I set preference ([^\s]+) to (.*)$/ do |pref, value|
  pref = 'translators.better-bibtex' + pref if pref[0] == '.'
  value = value.strip
  if value =~ /^"([^"]*)"$/
    value = $1
  elsif value =~ /^[0-9]+$/
    value = Integer(value)
  elsif value == 'true' || value == 'false'
    value = (value == 'true')
  end
  execute(
    args: {pref: pref, value: value},
    script: "Zotero.Prefs.set(args.pref, args.value);"
  )
end

When /^I import (\d+) references? (?:with (\d+) attachments? )?from "([^"]+)"(?: into (a new collection|"([^"]+)"))?$/ do |references, attachments, source, createNewCollection, collectionName|
  source = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', source))

  if source =~ /\.json$/i
    config = JSON.parse(File.read(source))['config'] || {}
    preferences = config['preferences'] || {}
    @displayOptions = config['options'] || {}
  else
    @displayOptions = {}
    preferences = nil
  end

  references = Integer(references)
  attachments = attachments.nil? ? 0 : Integer(attachments)

  imported = nil
  Dir.mktmpdir{|dir|
    createNewCollection = !!(createNewCollection || collectionName)
    if collectionName
      orig = source
      source = File.expand_path(File.join(dir, collectionName))
      FileUtils.cp(orig, source)
    end
    imported = execute(
      timeout: 60,
      args: { filename: source, preferences: preferences, createNewCollection: createNewCollection },
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

Then /^a library export using "([^"]+)" should match "([^"]+)"$/ do |translator, library|
  if translator =~ /^id:(.+)$/
    translator = $1
  else
    translator = TRANSLATORS['byName'][translator]['translatorID']
  end
  
  expected = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', library))
  expected = File.read(expected)
  found = execute(
    args: { translatorID: translator, displayOptions: @displayOptions },
    script: 'return yield Zotero.BetterBibTeX.TestSupport.exportLibrary(args.translatorID, args.displayOptions)'
  )

  expect(found.strip).to eq(expected.strip)
  # expect(normalize_library(expected)).to eq(normalize_library(found))
end

When(/^I select the first item where ([^\s]+) = "([^"]+)"$/) do |attribute, value|
	@selected = execute(
		args: { attribute: attribute, value: value },
		script: 'return yield Zotero.BetterBibTeX.TestSupport.select(args.attribute, args.value)'
  )
	expect(@selected).not_to be(nil)
  sleep 3
end

When(/^I remove the selected item$/) do
	execute(
	  args: {id: @selected},
	  script: 'yield Zotero.Items.trashTx([args.id])'
	)
end

When(/^I (pin|unpin|refresh) the citation key?$/) do |action|
	sleep 3
	execute(
		args: { itemID: @selected, action: action },
		script: 'yield Zotero.BetterBibTeX.TestSupport.pinCiteKey(args.itemID, args.action)'
  )
  sleep 3
end
