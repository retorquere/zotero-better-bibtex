from behave import given, when, then, use_step_matcher
import urllib.request
import json

def execute(script, **args):
  for var, value in args.items():
    script = f'const {var} = {json.dumps(value)};\n' + script

  req = urllib.request.Request('http://127.0.0.1:23119/debug-bridge/execute', data=script.encode('utf-8'), headers={'Content-type': 'text/plain'})
  return json.loads(urllib.request.urlopen(req).read().decode())

class Preferences
  def __init__(self):
    self.pref = {}

  def __getitem__(self, key):
    return self.pref[key]

  def __setitem__(self, key, value):
    value = self.parse(value)

    if key[0] == '.': key = f'translators.better-bibtex{key}'

    if pref == 'translators.better-bibtex.postscript':
      with open(path.join('test/fixtures', value)) as f:
        value = f.read()

    self.pref[key] = value
    execute('Zotero.Prefs.set(pref, value)', pref=key, value=value)

  def parse(self, value):
    value = value.trim()

    if value in 'true', 'false': return value == 'true'

    try:
      return int(value)
    except:
      pass

    if len(value) >= 2:
      if value[0] == '"' && value[-1] == '"': return json.loads(value)
      if value[0] == "'" && value[-1] == "'": return value[1:-1]

    return value

TRANSLATORS = {}

def exportLibrary(displayOptions, translator, collection = None, output = None, expected = None)
  assert not displayOptions.get('keepUpdated', False) or output # Auto-export needs a destination

  if translator.startswith('id:'):
    translator = translators[len('id:'):]
  else
    translator = TRANSLATORS['byName'][translator]['translatorID']
  end

  found = execute(
    timeout: 600,
    args: { translatorID: translator, displayOptions: displayOptions, path: output, collection: collection || nil },
    script: 'return await Zotero.BetterBibTeX.TestSupport.exportLibrary(args.translatorID, args.displayOptions, args.path, args.collection)'
  )

  return if expected == :ignore

  found = File.read(output) if output
  expected, ext = expand_expected(expected)
  expected = File.read(expected)

  case ext
    when '.csl.json'
      return compare(JSON.parse(found), JSON.parse(expected))

    when '.csl.yml'
      #return compare(YAML.load(found), YAML.load(expected))
      expect(sort_yaml(found)).to eq(sort_yaml(expected))
      return

    when '.json'
      open('exported.json', 'w'){|f| f.puts(found) }

      found = normalizeJSON(JSON.parse(found))
      expected = normalizeJSON(JSON.parse(expected))

      if found['items'].length < 30 || expected['items'].length < 30
        return expect(serialize(found)).to eq(serialize(expected))
      else
        expect(serialize(found.merge({'items' => []}))).to eq(serialize(expected.merge({'items' => []})))
        return compare(found['items'], expected['items'])
      end

    else
      open('exported.txt', 'w'){|f| f.puts(found) }
  end

  expect(found.strip).to eq(expected.strip)
end

  if displayOptions.get('keepUpdated', False) and not output raise ValueError('Auto-export needs a destination')

  if translator =~ /^id:(.+)$/
    translator = $1
  else
    translator = TRANSLATORS['byName'][translator]['translatorID']
  end

  found = execute(
    timeout: 600,
    args: { translatorID: translator, displayOptions: displayOptions, path: output, collection: collection || nil },
    script: 'return await Zotero.BetterBibTeX.TestSupport.exportLibrary(args.translatorID, args.displayOptions, args.path, args.collection)'
  )

  return if expected == :ignore

  found = File.read(output) if output
  expected, ext = expand_expected(expected)
  expected = File.read(expected)

  case ext
    when '.csl.json'
      return compare(JSON.parse(found), JSON.parse(expected))

    when '.csl.yml'
      #return compare(YAML.load(found), YAML.load(expected))
      expect(sort_yaml(found)).to eq(sort_yaml(expected))
      return

    when '.json'
      open('exported.json', 'w'){|f| f.puts(found) }

      found = normalizeJSON(JSON.parse(found))
      expected = normalizeJSON(JSON.parse(expected))

      if found['items'].length < 30 || expected['items'].length < 30
        return expect(serialize(found)).to eq(serialize(expected))
      else
        expect(serialize(found.merge({'items' => []}))).to eq(serialize(expected.merge({'items' => []})))
        return compare(found['items'], expected['items'])
      end

    else
      open('exported.txt', 'w'){|f| f.puts(found) }
  end

  expect(found.strip).to eq(expected.strip)
end

use_step_matcher('re')

@given(u'I set preference (?P<pref>.+) to (?P<value>.+)')
def step_impl(context, pref, value):
  context.preferences[pref] = value

@given(r'I import (?P<references>\d+) references? (?:with (?P<attachments>\d+) attachments? )?from "(?P<source>[^"]+)"(?: into (?P<collection>a new collection|"[^"]+"))?')
def step_impl(context, references, attachments, source, collection):
  if not collection:
    collection = False
  elif collection[0] == '"':
    collection = collection[1:-1]
  else:
    collection = True

  fixtures = path.join(path.dirname(__file__), '../../test/fixtures')
  source = path.join(fixtures, source)

  if source.endswith('.json'):
    with open(source) as f:
      config = json.load(f).get('config', {})
    preferences = config.get('preferences', {})
    context.displayOptions = config.get('options', {})

    for pref in context.preferences.keys():
      del preferences[pref]

    del preferences['testing']
  else:
    context.displayOptions = {}
    preferences = None

  references = int(references)
  attachments = 0 if attachments is None else int(attachments)

  with tempfile.TemporaryDirectory() as d:
    if type(collection) is str:
      orig = source
      source = path.join(d, collection))
      shutil.cp(orig, source)

    if '.bib' in source:
      copy = false
      bib = ''
      with open(source) as f:
        for line in f.readlines():
          if line.lower().startswith('@comment{jabref-meta: filedirectory:'):
            bib += f"@Comment{{jabref-meta: fileDirectory:{path.join(path.dirname(source), 'attachments')};}}\n"
            copy = true
          else:
            bib += line
      if copy
        source += '_'
        with open(source, 'w') as out:
          out.write(bib)

    imported = execute('return await Zotero.BetterBibTeX.TestSupport.importFile(filename, createNewCollection, preferences)',
      filename = source,
      preferences = preferences,
      createNewCollection = (collection != False)
    )

    assert imported == references

@then('an (?P<auto>auto-)?export (?:of "?P<collection>([^"]*)" )?(?:to "(?P<target>[^"]+)" )?using "(?P<translator>[^"]+)" should match "(?P<output>[^"]+)"')
def step_impl(context, auto, collection, target, translator, library):
  exportLibrary(
    displayOptions = { **context.displayOptions, 'keepUpdated': auto is not None },
    translator = translator,
    collection = collection,
    output = target,
    expected = output
  )

@then(u'an export using "Better BibLaTeX" should match "export/Protect math sections #1148.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Protect math sections #1148.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Error exporting duplicate eprinttype #1128.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Error exporting duplicate eprinttype #1128.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Do not use more than three initials in case of authshort key #1079.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Do not use more than three initials in case of authshort key #1079.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/ADS exports dates like 1993-00-00 #1066.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/ADS exports dates like 1993-00-00 #1066.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/BBT export of square brackets in date #245 -- xref should not be escaped #246.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BBT export of square brackets in date #245 -- xref should not be escaped #246.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/date ranges #747+#746.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/date ranges #747+#746.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/BibLaTeX Patent author handling, type #1060.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BibLaTeX Patent author handling, type #1060.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/BetterBibLaTeX; Software field company is mapped to publisher instead of organization #1054.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BetterBibLaTeX; Software field company is mapped to publisher instead of organization #1054.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Don\'t title-case sup-subscripts #1037.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Don\'t title-case sup-subscripts #1037.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Japanese rendered as Chinese in Citekey #979.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Japanese rendered as Chinese in Citekey #979.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Dates incorrect when Zotero date field includes times #934.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Dates incorrect when Zotero date field includes times #934.biblatex"')


@then(u'an export using "Better BibLaTeX" should match "export/Juris-M missing multi-lingual fields #482.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Juris-M missing multi-lingual fields #482.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/biblatex export of Presentation; Use type and venue fields #644.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/biblatex export of Presentation; Use type and venue fields #644.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Month showing up in year field on export #889.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Month showing up in year field on export #889.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/urldate when only DOI is exported #869.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/urldate when only DOI is exported #869.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Citations have month and day next to year #868.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Citations have month and day next to year #868.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Thin space in author name #859.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Thin space in author name #859.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Multiple locations and-or publishers and BibLaTeX export #689.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Multiple locations and-or publishers and BibLaTeX export #689.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Treat dash-connected words as a single word for citekey generation #619.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Treat dash-connected words as a single word for citekey generation #619.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/customized fields with curly brackets are not exported correctly anymore #775.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/customized fields with curly brackets are not exported correctly anymore #775.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/EDTF dates in BibLaTeX #590.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/EDTF dates in BibLaTeX #590.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.stable-keys.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.stable-keys.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/remove the field if the override is empty #303.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/remove the field if the override is empty #303.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Extra semicolon in biblatexadata causes export failure #133.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Extra semicolon in biblatexadata causes export failure #133.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Spaces not stripped from citation keys #294.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Spaces not stripped from citation keys #294.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Abbreviations in key generated for Conference Proceedings #548.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Abbreviations in key generated for Conference Proceedings #548.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/@jurisdiction; map court,authority to institution #326.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/@jurisdiction; map court,authority to institution #326.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Normalize date ranges in citekeys #356.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Normalize date ranges in citekeys #356.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/CSL status = biblatex pubstate #573.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/CSL status = biblatex pubstate #573.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Math parts in title #113.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Math parts in title #113.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/map csl-json variables #293.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/map csl-json variables #293.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Fields in Extra should override defaults.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Fields in Extra should override defaults.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/BibLaTeX; export CSL override \'issued\' to date or year #351.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BibLaTeX; export CSL override \'issued\' to date or year #351.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/csquotes #302.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/csquotes #302.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Oriental dates trip up date parser #389.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Oriental dates trip up date parser #389.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Non-ascii in dates is not matched by date parser #376.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Non-ascii in dates is not matched by date parser #376.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/transliteration for citekey #580.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/transliteration for citekey #580.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Title case of latex greek text on biblatex export #564.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Title case of latex greek text on biblatex export #564.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/pre not working in Extra field #559.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/pre not working in Extra field #559.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/@legislation; map code,container-title to journaltitle #327.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/@legislation; map code,container-title to journaltitle #327.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Be robust against misconfigured journal abbreviator #127.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Be robust against misconfigured journal abbreviator #127.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.001.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.001.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.002.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.002.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.003.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.003.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.004.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.004.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.005.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.005.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.006.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.006.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.007.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.007.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.009.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.009.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/BibTeX variable support for journal titles. #309.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BibTeX variable support for journal titles. #309.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Book converted to mvbook #288.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Book converted to mvbook #288.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Book sections have book title for journal in citekey #409.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Book sections have book title for journal in citekey #409.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/BraceBalancer.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/BraceBalancer.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Colon in bibtex key #405.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Colon in bibtex key #405.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Colon not allowed in citation key format #268.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Colon not allowed in citation key format #268.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Date parses incorrectly with year 1000 when source Zotero field is in datetime format. #515.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Date parses incorrectly with year 1000 when source Zotero field is in datetime format. #515.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Dollar sign in title not properly escaped #485.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Dollar sign in title not properly escaped #485.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Export error for items without publicationTitle and Preserve BibTeX variables enabled #201.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Export error for items without publicationTitle and Preserve BibTeX variables enabled #201.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Export mapping for reporter field #219.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Export mapping for reporter field #219.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Text that legally contains the text of HTML entities such as &nbsp; triggers an overzealous decoding second-guesser #253.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/auth leaves punctuation in citation key #310.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/auth leaves punctuation in citation key #310.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/condense in cite key format not working #308.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/condense in cite key format not working #308.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/italics in title - capitalization #541.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/italics in title - capitalization #541.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/CSL title, volume-title, container-title=BL title, booktitle, maintitle #381.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/CSL title, volume-title, container-title=BL title, booktitle, maintitle #381.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.019.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.019.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Ignore HTML tags when generating citation key #264.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Ignore HTML tags when generating citation key #264.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Export Forthcoming as Forthcoming.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Export Forthcoming as Forthcoming.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/CSL variables only recognized when in lowercase #408.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/CSL variables only recognized when in lowercase #408.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/date and year are switched #406.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/date and year are switched #406.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Do not caps-protect literal lists #391.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Do not caps-protect literal lists #391.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/biblatex; Language tag xx is exported, xx-XX is not #380.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/biblatex; Language tag xx is exported, xx-XX is not #380.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/markup small-caps, superscript, italics #301.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/markup small-caps, superscript, italics #301.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/don\'t escape entry key fields for #296.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/don\'t escape entry key fields for #296.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/typo stature-statute (zotero item type) #284.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/typo stature-statute (zotero item type) #284.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/bookSection is always converted to @inbook, never @incollection #282.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/bookSection is always converted to @inbook, never @incollection #282.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/referencetype= does not work #278.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/referencetype= does not work #278.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/References with multiple notes fail to export #174.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/References with multiple notes fail to export #174.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibTeX does not use biblatex fields eprint and eprinttype #170.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibTeX does not use biblatex fields eprint and eprinttype #170.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Capitalisation in techreport titles #160.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Capitalisation in techreport titles #160.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/German Umlaut separated by brackets #146.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/German Umlaut separated by brackets #146.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/HTML Fragment separator escaped in url #140 #147.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/HTML Fragment separator escaped in url #140 #147.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Export Newspaper Article misses section field #132.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Export Newspaper Article misses section field #132.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Exporting of single-field author lacks braces #130.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Exporting of single-field author lacks braces #130.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Hang on non-file attachment export #112 - URL export broken #114.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Hang on non-file attachment export #112 - URL export broken #114.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/DOI with underscores in extra field #108.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/DOI with underscores in extra field #108.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/underscores in URL fields should not be escaped #104.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/underscores in URL fields should not be escaped #104.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Shortjournal does not get exported to biblatex format #102 - biblatexcitekey #105.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.023.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.023.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.022.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.022.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.021.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.021.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.020.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.020.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.017.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.017.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.016.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.016.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.015.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.015.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.014.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.014.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.013.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.013.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.012.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.012.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.011.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.011.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Better BibLaTeX.010.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Better BibLaTeX.010.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Malformed HTML.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Malformed HTML.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Allow explicit field override.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Allow explicit field override.biblatex"')



@then(u'an export using "Better BibTeX" should match "export/citekey firstpage-lastpage #1147.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/citekey firstpage-lastpage #1147.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Error exporting with custom Extra field #1118.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Error exporting with custom Extra field #1118.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/No space between author first and last name because last char of first name is translated to a latex command #1091.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/No space between author first and last name because last char of first name is translated to a latex command #1091.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/date not always parsed properly into month and year with PubMed #1112.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/date not always parsed properly into month and year with PubMed #1112.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/error on exporting note with pre tags; duplicate field howpublished #1092.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/error on exporting note with pre tags; duplicate field howpublished #1092.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/No booktitle field when exporting references from conference proceedings #1069.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/No booktitle field when exporting references from conference proceedings #1069.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/braces after textemdash followed by unicode #980.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/braces after textemdash followed by unicode #980.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/BetterBibtex export fails for missing last name #978.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/BetterBibtex export fails for missing last name #978.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Export unicode as plain text fails for Vietnamese characters #977.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Export unicode as plain text fails for Vietnamese characters #977.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Hyphenated last names not escaped properly (or at all) in BibTeX #976.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Hyphenated last names not escaped properly (or at all) in BibTeX #976.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Better BibTeX does not export collections #901.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Better BibTeX does not export collections #901.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/[authN_M] citation key syntax has off-by-one error #899.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/[authN_M] citation key syntax has off-by-one error #899.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/creating a key with [authForeIni] and [authN] not working properly #892.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/creating a key with [authForeIni] and [authN] not working properly #892.bibtex"')


@then(u'an export using "Better BibTeX" should match "export/date ranges #747+#746.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/date ranges #747+#746.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/bibtex export of phdthesis does not case-protect -type- #435.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/bibtex export of phdthesis does not case-protect -type- #435.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Empty bibtex clause in extra gobbles whatever follows #99.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Empty bibtex clause in extra gobbles whatever follows #99.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Braces around author last name when exporting BibTeX #565.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Braces around author last name when exporting BibTeX #565.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/veryshorttitle and compound words #551.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/veryshorttitle and compound words #551.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/titles are title-cased in .bib file #558.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/titles are title-cased in .bib file #558.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Missing JabRef pattern; authEtAl #554.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Missing JabRef pattern; authEtAl #554.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Missing JabRef pattern; authorsN+initials #553.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Missing JabRef pattern; authorsN+initials #553.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/custom fields should be exported as-is #441.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/custom fields should be exported as-is #441.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Replicate Zotero key algorithm #439.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Replicate Zotero key algorithm #439.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/preserve BibTeX Variables does not check for null values while escaping #337.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/preserve BibTeX Variables does not check for null values while escaping #337.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Underscores break capital-preservation #300.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Underscores break capital-preservation #300.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Numbers confuse capital-preservation #295.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Numbers confuse capital-preservation #295.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Export C as {v C}, not v{C} #152.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Export C as {v C}, not v{C} #152.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/capital delta breaks .bib output #141.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/capital delta breaks .bib output #141.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Export of item to Better Bibtex fails for auth3_1 #98.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Export of item to Better Bibtex fails for auth3_1 #98.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Better BibTeX.027.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Better BibTeX.027.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Better BibTeX.026.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Better BibTeX.026.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Better BibTeX.018.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Better BibTeX.018.bibtex"')



@when(u'I set preference .DOIandURL to both')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .DOIandURL to both')


@when(u'I set preference .jabrefFormat to 3')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .jabrefFormat to 3')


@then(u'an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.groups3.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.groups3.biblatex"')


@then(u'I set preference .jabrefFormat to 4')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I set preference .jabrefFormat to 4')


@then(u'an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.default.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.default.biblatex"')


@then(u'I set preference .DOIandURL to doi')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I set preference .DOIandURL to doi')


@then(u'an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-DOI.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-DOI.biblatex"')


@then(u'I set preference .DOIandURL to url')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then I set preference .DOIandURL to url')


@then(u'an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-url.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Omit URL export when DOI present. #131.prefer-url.biblatex"')



@when(u'I set preference .relaxAuthors to true')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .relaxAuthors to true')


@then(u'an export using "Better BibTeX" should match "export/BibTeX name escaping has a million inconsistencies #438.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/BibTeX name escaping has a million inconsistencies #438.bibtex"')


@given(u'I set preference .sorted to true')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .sorted to true')


@when(u'I set preference .citekeyFormat to [auth.etal][shortyear:prefix,.][0][Title:fold:nopunct:skipwords:select,1,1:abbr:lower:alphanum:prefix,.]')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .citekeyFormat to [auth.etal][shortyear:prefix,.][0][Title:fold:nopunct:skipwords:select,1,1:abbr:lower:alphanum:prefix,.]')



@when(u'I set preference .citekeyFormat to [auth:lower]_[veryshorttitle:lower]_[year]')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .citekeyFormat to [auth:lower]_[veryshorttitle:lower]_[year]')


@then(u'an export using "Better BibLaTeX" should match "export/Citekey generation failure #708.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Citekey generation failure #708.biblatex"')



@when(u'I select the first item where publicationTitle = "Genetics"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I select the first item where publicationTitle = "Genetics"')


@when(u'I remove the selected item')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I remove the selected item')



@then(u'an export using "Better BibLaTeX" should match "export/Bibtex key regenerating issue when trashing items #117.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Bibtex key regenerating issue when trashing items #117.biblatex"')



@given(u'I set preference .bibtexURL to "off"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .bibtexURL to "off"')


@then(u'an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.off.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.off.bibtex"')


@when(u'I set preference .bibtexURL to "note"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .bibtexURL to "note"')


@then(u'an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.note.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.note.bibtex"')


@when(u'I set preference .bibtexURL to "url"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .bibtexURL to "url"')


@then(u'an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.url.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/BibTeX; URL missing in bibtex for Book Section #412.url.bibtex"')



@when(u'I pick "6 The time it takes: temporalities of planning" for CAYW')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I pick "6 The time it takes: temporalities of planning" for CAYW')


@when(u'I pick "A bicycle made for two? The integration of scientific techniques into archaeological interpretation" for CAYW')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I pick "A bicycle made for two? The integration of scientific techniques into archaeological interpretation" for CAYW')


@then(u'the picks for "pandoc" should be "@bentley_academic_2011, p. 1; @pollard_bicycle_2007, ch. 1"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then the picks for "pandoc" should be "@bentley_academic_2011, p. 1; @pollard_bicycle_2007, ch. 1"')


@then(u'the picks for "mmd" should be "[#bentley_academic_2011][][#pollard_bicycle_2007][]"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then the picks for "mmd" should be "[#bentley_academic_2011][][#pollard_bicycle_2007][]"')


@then(u'the picks for "latex" should be "\cite[1]{bentley_academic_2011}\cite[ch. 1]{pollard_bicycle_2007}"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then the picks for "latex" should be "\cite[1]{bentley_academic_2011}\cite[ch. 1]{pollard_bicycle_2007}"')


@then(u'the picks for "asciidoctor-bibtex" should be "cite:[bentley_academic_2011(1), pollard_bicycle_2007(ch. 1)]"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then the picks for "asciidoctor-bibtex" should be "cite:[bentley_academic_2011(1), pollard_bicycle_2007(ch. 1)]"')



@then(u'an export using "Better BibLaTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/thesis zotero entries always create @phdthesis bibtex entries #307.bibtex"')



@then(u'an export using "Better BibLaTeX" should match "export/bibtex; url export does not survive underscores #402.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/bibtex; url export does not survive underscores #402.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/bibtex; url export does not survive underscores #402.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/bibtex; url export does not survive underscores #402.bibtex"')



@when(u'I unpin the citation key')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I unpin the citation key')


@when(u'I refresh the citation key')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I refresh the citation key')


@then(u'an export using "Better BibLaTeX" should match "export/two ISSN number are freezing browser #110.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/two ISSN number are freezing browser #110.biblatex"')



@then(u'an export using "Better BibTeX" should match "export/Square brackets in Publication field (85).bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Square brackets in Publication field (85).bibtex"')


@when(u'I set preference .citekeyFormat to [auth+initials][year]')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .citekeyFormat to [auth+initials][year]')



@then(u'an export using "Better BibTeX" should match "export/Include first name initial(s) in cite key generation pattern (86).bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Include first name initial(s) in cite key generation pattern (86).bibtex"')



@then(u'an export using "Better CSL JSON" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.json"')


@then(u'an export using "Better CSL YAML" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.yml"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL YAML" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.csl.yml"')


@then(u'an export using "Better BibLaTeX" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Season ranges should be exported as pseudo-months (13-16, or 21-24) #860.biblatex"')



@then(u'an export using "Better CSL YAML" should match "export/CSL YAML export of date with original publication date in [brackets] #922.csl.yml"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL YAML" should match "export/CSL YAML export of date with original publication date in [brackets] #922.csl.yml"')



@then(u'an export using "Better CSL JSON" should match "export/Quotes around last names should be removed from citekeys #856.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/Quotes around last names should be removed from citekeys #856.csl.json"')



@then(u'an export using "Better CSL JSON" should match "export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/BBT CSL JSON; Do not use shortTitle and journalAbbreviation #372.csl.json"')



@then(u'an export using "Better BibLaTeX" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.biblatex"')


@then(u'an export using "Better CSL JSON" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/Export of creator-type fields from embedded CSL variables #365 uppercase DOI #825.csl.json"')



@then(u'an export using "Better BibLaTeX" should match "export/Setting the item type via the cheater syntax #587.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Setting the item type via the cheater syntax #587.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/Setting the item type via the cheater syntax #587.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Setting the item type via the cheater syntax #587.bibtex"')


@then(u'an export using "Better CSL JSON" should match "export/Setting the item type via the cheater syntax #587.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/Setting the item type via the cheater syntax #587.csl.json"')



@when(u'an export using "Better CSL JSON" should match "export/Date export to Better CSL-JSON #360 #811.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When an export using "Better CSL JSON" should match "export/Date export to Better CSL-JSON #360 #811.csl.json"')


@when(u'an export using "Better BibLaTeX" should match "export/Date export to Better CSL-JSON #360 #811.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When an export using "Better BibLaTeX" should match "export/Date export to Better CSL-JSON #360 #811.biblatex"')



@when(u'I set preference .quickCopyMode to "pandoc"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .quickCopyMode to "pandoc"')


@then(u'an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.pandoc"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.pandoc"')


@when(u'I set preference .quickCopyMode to "latex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .quickCopyMode to "latex"')


@then(u'an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.latex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX Citation Key Quick Copy" should match "export/Pandoc Citation.latex"')


@then(u'an export using "Better CSL JSON" should match "export/Pandoc Citation.csl.json"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL JSON" should match "export/Pandoc Citation.csl.json"')


@then(u'an export using "Better CSL YAML" should match "export/Pandoc Citation.csl.yml"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better CSL YAML" should match "export/Pandoc Citation.csl.yml"')


@given(u'I set the following preferences')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set the following preferences')



@then(u'an export using "Better BibTeX" with the following export options should match "export/Better BibTeX.029.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" with the following export options should match "export/Better BibTeX.029.bibtex"')



@then(u'an export using "Better BibTeX" with the following export options should match "export/Journal abbreviations exported in bibtex (81).bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" with the following export options should match "export/Journal abbreviations exported in bibtex (81).bibtex"')



@given(u'I set preference .postscript to "export/Export web page to misc type with notes and howpublished custom fields #329.js"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .postscript to "export/Export web page to misc type with notes and howpublished custom fields #329.js"')


@then(u'an export using "Better BibTeX" should match "export/Export web page to misc type with notes and howpublished custom fields #329.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Export web page to misc type with notes and howpublished custom fields #329.bibtex"')



@then(u'an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043.bibtex"')


@when(u'I set preference .postscript to "export/Detect and protect LaTeX math formulas.js"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .postscript to "export/Detect and protect LaTeX math formulas.js"')


@then(u'an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043-mathmode.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Unbalanced vphantom escapes #1043-mathmode.bibtex"')



@then(u'an export using "Better BibLaTeX" should match "export/arXiv identifiers in BibLaTeX export #460.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/arXiv identifiers in BibLaTeX export #460.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/arXiv identifiers in BibLaTeX export #460.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/arXiv identifiers in BibLaTeX export #460.bibtex"')



@then(u'an export using "Better BibLaTeX" should match "export/Ignoring upper cases in German titles #456.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Ignoring upper cases in German titles #456.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/Ignoring upper cases in German titles #456.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Ignoring upper cases in German titles #456.bibtex"')



@then(u'an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-fold.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-fold.biblatex"')


@when(u'I set preference .citekeyFold to false')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .citekeyFold to false')


@when(u'I refresh all citation keys')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I refresh all citation keys')


@then(u'an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-nofold.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Diacritics stripped from keys regardless of ascii or fold filters #266-nofold.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biblatex"')


@then(u'an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.bibtex"')


@when(u'I set preference .bibtexParticleNoOp to true')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .bibtexParticleNoOp to true')


@then(u'an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.noopsort.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" should match "export/Do not caps-protect name fields #384 #565 #566.noopsort.bibtex"')


@when(u'I set preference .biblatexExtendedNameFormat to true')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .biblatexExtendedNameFormat to true')


@then(u'an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biber26.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Do not caps-protect name fields #384 #565 #566.biber26.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/Capitalize all title-fields for language en #383.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Capitalize all title-fields for language en #383.biblatex"')



@given(u'I set preference .parseParticles to true')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .parseParticles to true')


@then(u'an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.on.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.on.biblatex"')


@when(u'I set preference .parseParticles to false')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I set preference .parseParticles to false')


@then(u'an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.off.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/Sorting and optional particle handling #411.off.biblatex"')



@given(u'I set preference .autoExport to immediate')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .autoExport to immediate')


@given(u'I set preference .jabrefFormat to 3')
def step_impl(context):
    raise NotImplementedError(u'STEP: Given I set preference .jabrefFormat to 3')


@then(u'an auto-export to "/tmp/autoexport.bib" using "Better BibLaTeX" should match "export/autoexport.before.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an auto-export to "/tmp/autoexport.bib" using "Better BibLaTeX" should match "export/autoexport.before.biblatex"')


@then(u'an auto-export of "/autoexport" to "/tmp/autoexport.coll.bib" using "Better BibLaTeX" should match "export/autoexport.before.coll.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an auto-export of "/autoexport" to "/tmp/autoexport.coll.bib" using "Better BibLaTeX" should match "export/autoexport.before.coll.biblatex"')


@when(u'I select the first item where publisher = "IEEE"')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I select the first item where publisher = "IEEE"')


@when(u'I wait 5 seconds')
def step_impl(context):
    raise NotImplementedError(u'STEP: When I wait 5 seconds')


@then(u'"/tmp/autoexport.bib" should match "export/autoexport.after.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then "/tmp/autoexport.bib" should match "export/autoexport.after.biblatex"')


@then(u'"/tmp/autoexport.coll.bib" should match "export/autoexport.after.coll.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then "/tmp/autoexport.coll.bib" should match "export/autoexport.after.coll.biblatex"')



@then(u'an export using "Better BibLaTeX" should match "export/(non-)dropping particle handling #313.biblatex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibLaTeX" should match "export/(non-)dropping particle handling #313.biblatex"')
