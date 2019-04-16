from behave import given, when, then, use_step_matcher
import urllib.request
import json
import zotero

def execute(script, **args):
  for var, value in args.items():
    script = f'const {var} = {json.dumps(value)};\n' + script

  req = urllib.request.Request('http://127.0.0.1:23119/debug-bridge/execute', data=script.encode('utf-8'), headers={'Content-type': 'text/plain'})
  return json.loads(urllib.request.urlopen(req).read().decode())

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
      source = os.path.join(d, collection)
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
      if copy:
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
  zotero.export_library(
    displayOptions = { **context.displayOptions, 'keepUpdated': auto is not None },
    translator = translator,
    collection = collection,
    output = target,
    expected = output
  )

