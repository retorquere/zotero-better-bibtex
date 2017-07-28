TRANSLATORS = JSON.parse(File.read(File.join(File.dirname(__FILE__), '../../gen/translators.json')))
PREFERENCES = JSON.parse(File.read(File.join(File.dirname(__FILE__), '../../defaults/preferences/defaults.json')))

Before do |scenario|
  resetprefs = PREFERENCES.collect{|k, v|
    if k == 'debug' || k == 'testing'
      nil
    else
      "Zotero.Prefs.set(prefix + #{k.to_json}, #{v.to_json});"
    end
  }.compact.join("\n")

  execute("""
    var prefix = 'translators.better-bibtex.'
    #{resetprefs}
    Zotero.Prefs.set(prefix + 'debug', true);
    Zotero.Prefs.set(prefix + 'testing', true);
    var items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    yield Zotero.Items.erase(items);
    yield Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID);
    var items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, false, true, true)
    if (items.length != 0) throw new Error('library not empty after reset')
  """) unless scenario.source_tag_names.include?('@noreset')

  @displayOptions = {}
end

When /^I set preference ([^\s]+) to (.*)$/ do |pref, value|
  pref = 'translators.better-bibtex' + pref if pref[0] == '.'
  value = value.strip
  if value =~ /^(['"])([^\2]+)\2$/
    value = $2
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

When /^I import (\d+) references (?:with (\d+) attachments )?from (['"])([^\3]+)\3( into a new collection)?$/ do |references, attachments, quote, json, createNewCollection|
  source = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', json))

  references = Integer(references)
  attachments = attachments.nil? ? 0 : Integer(attachments)

  script = """
    // preferences from #{source}
    var prefix = 'translators.better-bibtex';
  """

  config = JSON.parse(File.read(source))['config'] || {}
  prefs = config['preferences'] || {}
  prefs.each_pair{|p, v|
    v = v.join(',') if v.is_a?(Array)
    script += """
      Zotero.Prefs.set(prefix + '.#{p}', #{v.to_json});
    """
  }
  execute(script)
  @displayOptions = config['options'] || {}

  imported = execute(
    timeout: 30,
    args: { filename: source, createNewCollection: !!createNewCollection },
    script: """
      Zotero.debug('importing ' + args.filename);
      var file = Components.classes['@mozilla.org/file/local;1'].createInstance(Components.interfaces.nsILocalFile);
      file.initWithPath(args.filename);

      var items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true);
      var before = items.length;

      Zotero.debug('{better-bibtex} starting import at ' + new Date());
      yield Zotero_File_Interface.importFile(file, args.createNewCollection);
      Zotero.debug('{better-bibtex} import finished at ' + new Date());

      var items = yield Zotero.Items.getAll(Zotero.Libraries.userLibraryID, true, false, true);
      var after = items.length;

      Zotero.debug('{better-bibtex} found ' + (after - before) + ' items');
      return (after - before);
    """
  )
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

Then /^a library export using (['"])([^\1]+)\1 should match (['"])([^\3]+)\3$/ do |q1, translator, q2, library|
  if translator =~ /^id:(.+)$/
    translator = $1
  else
    translator = TRANSLATORS['byName'][translator]['translatorID']
  end
  
  expected = File.expand_path(File.join(File.dirname(__FILE__), '../../test/fixtures', library))
  expected = File.read(expected)
  found = execute(
    args: { translatorID: translator, displayOptions: @displayOptions },
    script: """
      var translation = new Zotero.Promise(function (resolve, reject) {
        var translation = new Zotero.Translate.Export();
        translation.setLibraryID(Zotero.Libraries.userLibraryID);
        translation.setTranslator(args.translatorID)
        translation.setDisplayOptions(args.displayOptions);
        translation.setHandler('done', function(obj, success) {
          if (success && obj && obj.string) {
            resolve(obj.string);
          } else {
            reject('translation failed');
          }
        })
        translation.translate();
      })
      var lib = yield translation
      return lib
    """
  )

  expect(found.strip).to eq(expected.strip)
  # expect(normalize_library(expected)).to eq(normalize_library(found))
end
