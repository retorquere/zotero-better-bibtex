import steps.zotero as zotero
from munch import *
from behave import given, when, then, use_step_matcher
import behave
import urllib.request
import json
import time
import os
from hamcrest import assert_that, equal_to
from steps.utils import assert_equal_diff, expand_scenario_variables
import steps.citations as citations
import steps.utils as utils
import steps.zotero as zotero
import glob
import subprocess, shlex, shutil
import io
import zipfile
import html, re
import timeit
import platform

from contextlib import contextmanager

@contextmanager
def step_matcher(matcher):
    _matcher = behave.matchers.current_matcher
    use_step_matcher(matcher)
    yield
    behave.matchers.current_matcher = _matcher

import pathlib
for d in pathlib.Path(__file__).resolve().parents:
  if os.path.exists(os.path.join(d, 'behave.ini')):
    ROOT = d
    break

with step_matcher('re'):
  @step(u'I cap the (?P<memory>total memory|memory increase) use to (?P<value>[.0-9]+[MG]?)')
  def step_impl(context, memory, value):
    if value.endswith('M'):
      value = float(value[:-1])
    elif value.endswith('G'):
      value = float(value[:-1]) * 1024
    else:
      value = float(value) / (1024 * 1024)

    if memory == 'total memory':
      context.memory.total = value
    elif memory == 'memory increase':
      context.memory.increase = value
    else:
      raise AssertionError(f'unknown memory cap {json.dumps(memory)}')

@given(u'I set the temp directory to {value}')
def step_impl(context, value):
  context.tmpDir = os.path.join(ROOT, json.loads(value))
  if os.path.isdir(context.tmpDir):
    for f in glob.glob(os.path.join(context.tmpDir, '*')):
      os.remove(f)
  else:
    os.mkdir(context.tmpDir)

@when(u'I create preference override {value}')
def step_impl(context, value):
  override = json.loads(value)
  assert override.startswith('~/'), override
  override = os.path.join(context.tmpDir, override[2:])
  with open(override, 'w') as f:
    json.dump({'override': { 'preferences': {} }}, f)
  context.preferenceOverride = override

@when(u'I remove preference override {value}')
def step_impl(context, value):
  override = json.loads(value)
  assert override.startswith('~/'), override
  override = os.path.join(context.tmpDir, override[2:])
  assert override == context.preferenceOverride, [ override, context.preferenceOverride ]
  os.remove(override)

@step('I set preference override {pref} to {value}')
def step_impl(context, pref, value):
  assert pref.startswith('.'), pref
  pref = pref[1:]

  value = json.loads(value)
  # bit of a cheat...
  if pref.endswith('.postscript'):
    value = expand_scenario_variables(context, value)
  with open(context.preferenceOverride) as f:
    override = json.load(f)
  override['override']['preferences'][pref] = value
  with open(context.preferenceOverride, 'w') as f:
    json.dump(override, f)

@step('I set export option {option} to {value}')
def step_impl(context, option, value):
  value = json.loads(value)
  assert type(value) == bool
  context.displayOptions[option] = value

@step('I set preference {pref} to {value}')
def step_impl(context, pref, value):
  value = json.loads(value)
  # bit of a cheat...
  if pref.endswith('.postscript'):
    value = expand_scenario_variables(context, value)
  context.zotero.preferences[pref] = value

@step(r'I restart Zotero with "{db}" + "{source}"')
def step_impl(context, db, source):
  source = expand_scenario_variables(context, source)
  context.imported = source

  with open(os.path.join(ROOT, 'test', 'fixtures', source)) as f:
    data = json.load(f)
    items = data['items']
    #references = sum([ 1 + len(item.get('attachments', [])) + len(item.get('notes', [])) for item in items ])
    references = len(items)

  context.zotero.restart(timeout=context.timeout, db=db)
  assert_that(context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.librarySize()'), equal_to(references))

  # import preferences
  context.zotero.import_file(context, source, items=False)

  # check import
  export_library(context, expected = source)

@step(r'I restart Zotero with "{db}"')
def step_impl(context, db):
  context.zotero.restart(timeout=context.timeout, db=db)

@step(r'I restart Zotero with profile "{profile}"')
def step_impl(context, profile):
  context.zotero.restart(timeout=context.timeout, profile=profile)

@step(r'I restart Zotero')
def step_impl(context):
  context.zotero.restart(timeout=context.timeout)

@step(r'I apply the preferences from "{source}"')
def step_impl(context, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source, items=False), equal_to(0))

@step('I compile "{source}" to "{target}" it should match "{baseline}" with {n} citations')
def step_impl(context, source, target, baseline, n):
  source = os.path.join('test/fixtures', expand_scenario_variables(context, source))
  baseline = os.path.join('test/fixtures', expand_scenario_variables(context, baseline))
  n = int(n)

  target = expand_scenario_variables(context, target)
  assert target.startswith('~/'), target
  target = os.path.join(context.tmpDir, target[2:])

  lua = 'site/content/exporting/zotero.lua'
  client = context.config.userdata.get('client', 'zotero')

  result = subprocess.run(
    f'pandoc -s --metadata=zotero_client:{client} --lua-filter={shlex.quote(lua)} -o {shlex.quote(target)} {shlex.quote(source)}',
    shell=True,
    check=True,
    stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True
  )
  utils.print(result.stdout)

  match pathlib.Path(baseline).suffix:
    case '.odt':
      assert_equal_diff(citations.odt(baseline, n), citations.odt(target, n))
    case '.docx':
      assert_equal_diff(citations.docx(baseline, n), citations.docx(target, n))
    case _:
      raise AssertionError(f'Unexpected file extension on {baseline}')

@step(r'I install "{source}" in the better bibtex directory as "{target}"')
def step_impl(context, source, target):
  source = expand_scenario_variables(context, source)
  shutil.copyfile(os.path.join('test/fixtures', source), os.path.join(context.zotero.profile.path, 'zotero/better-bibtex', target))

@step(r'I import {references:d} references from "{source}"')
def step_impl(context, references, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source), equal_to(references))

@step(r'I import 1 reference from "{source}" into "{collection}"')
def step_impl(context, source, collection):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source, collection), equal_to(1))

@step(r'I import 1 reference from "{source}"')
def step_impl(context, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source), equal_to(1))

@given(u'I import 1 reference with 1 attachment from "{source}"')
def step_impl(context, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source), equal_to(1))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}" into a new collection')
def step_impl(context, references, attachments, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source, True), equal_to(references))

@step(r'I import {references:d} references from "{source}" into a new collection')
def step_impl(context, references, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source, True), equal_to(references))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}"')
def step_impl(context, references, attachments, source):
  source = expand_scenario_variables(context, source)
  context.imported = source
  assert_that(context.zotero.import_file(context, source), equal_to(references))

@step(r'I export the library {n:d} times using "{translator}"')
def step_impl(context, n, translator):
  timeit.timeit(lambda: export_library(context, translator = translator), number=n)

def export_library(context, translator='BetterBibTeX JSON', collection=None, expected=None, output=None, displayOption=None, timeout=None, resetCache=False):
  if expected is not None:
    expected = expand_scenario_variables(context, expected)
  displayOptions = { **context.displayOptions }
  if displayOption: displayOptions[displayOption] = True
  if output:
    assert output.startswith('~/'), output
    output = os.path.join(context.tmpDir, output[2:])

  start = time.time()
  context.zotero.export_library(
    displayOptions = displayOptions,
    translator = translator,
    output = output,
    expected = expected,
    resetCache = resetCache,
    collection = collection
  )
  runtime = time.time() - start

  if timeout is not None:
    assert(runtime < timeout), f'Export runtime of {runtime} exceeded set maximum of {timeout}'

@then(u'a quick-copy using "{translator}" should match {path}')
def step_impl(context, translator, path):
  context.zotero.quick_copy(translator=translator, expected=expand_scenario_variables(context, json.loads(path)), itemIDs=context.selected)

@then(u'an export to "{output}" using "{translator}" should match {path}')
def step_impl(context, output, translator, path):
  export_library(context,
    translator=translator,
    expected=json.loads(path),
    output=output
  )

@step(u'an auto-export to "{output}" using "{translator}" should match {expected}')
def step_impl(context, translator, output, expected):
  export_library(context,
    translator=translator,
    expected=json.loads(expected),
    output=output,
    displayOption='keepUpdated',
    resetCache = True
  )

@then(u'an auto-export of "{collection}" to "{output}" using "{translator}" should match {expected}')
def step_impl(context, translator, collection, output, expected):
  export_library(context,
    displayOption = 'keepUpdated',
    translator = translator,
    collection = collection,
    output = output,
    expected = json.loads(expected),
    resetCache = True
  )

@step('an export using "{translator}" should match "{expected}", but take no more than {seconds:d} seconds')
def step_impl(context, translator, expected, seconds):
  export_library(context,
    translator = translator,
    expected = expected,
    timeout = seconds
  )

def parse_json(text):
  try:
    json.loads(text)
    return True
  except:
    return False
@step('an export using "{translator}" with {displayOption} on should match {expected}')
def step_impl(context, translator, displayOption, expected):
  assert parse_json(expected), expected

  export_library(context,
    displayOption = displayOption,
    translator = translator,
    expected = json.loads(expected)
  )

@step('an export using "{translator}" should match "{expected}"')
def step_impl(context, translator, expected):
  export_library(context,
    translator = translator,
    expected = expected
  )

@step('the library should match "{expected}"')
def step_impl(context, expected):
  export_library(context, expected = expected)

@step(u'I select the item with a field that {mode} "{value}"')
def step_impl(context, mode, value):
  context.selected += context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.find({[mode]: value})', mode=mode, value=value)
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.select(ids)', ids=context.selected)
  time.sleep(3)

@step(u'I select {n} items with a field that {mode} "{value}"')
def step_impl(context, n, mode, value):
  context.selected += context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.find({[mode]: value}, n)', mode=mode, value=value, n=int(n))
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.select(ids)', ids=context.selected)
  time.sleep(3)

@when(u'I remove all items from "{collection}"')
def step_impl(context, collection):
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.clearCollection(path)', path=collection)

@when(u'I remove the selected item')
def step_impl(context):
  assert len(context.selected) == 1
  context.zotero.execute('await Zotero.Items.trashTx([id])', id=context.selected[0])

@step(u'I remove all items')
def step_impl(context):
  context.zotero.execute('''
    await Zotero.Items.trashTx(await Zotero.Items.getAll(await Zotero.Libraries.userLibraryID, false, false, true))
    await Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)
  ''')

@when(u'I remove the selected items')
def step_impl(context):
  assert len(context.selected) > 0
  context.zotero.execute('await Zotero.Items.trashTx(ids)', ids=context.selected)

@when(u'I merge the selected items')
def step_impl(context):
  assert len(context.selected) > 1
  context.zotero.execute('''
    try {
      return await Zotero.BetterBibTeX.TestSupport.merge(selected)
    } catch (err) {
      Zotero.debug('oops on merge')
      Zotero.debug(`${err}`)
      Zotero.debug(err.stack)
      throw err
    }
  ''', selected=context.selected)

@when(u'I empty the trash')
def step_impl(context):
  context.zotero.execute('await Zotero.Items.emptyTrash(Zotero.Libraries.userLibraryID)')

@when(u'I pick "{title}" for CAYW')
def step_impl(context, title):
  pick = zotero.Pick(id = context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.find({contains: title})', title=title))
  assert pick['id'] is not None

  pick[context.table.headings[0]] = context.table.headings[1]
  for row in context.table:
    pick[row[0]] = row[1]
  context.picked.append(dict(pick))

@then(u'the picks for "{fmt}" should be "{expected}"')
def step_impl(context, fmt, expected):
  found = context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.pick(fmt, picks)', fmt=fmt, picks=context.picked)
  assert_equal_diff(expected, found)

@when(u'I {change} the citation key')
def step_impl(context, change):
  assert change in ['pin', 'unpin', 'refresh']
  assert len(context.selected) == 1
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(itemID, action)', itemID=context.selected[0], action=change)

@when(u'I {change} all citation keys')
def step_impl(context, change):
  assert change in ['pin', 'unpin', 'refresh']
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(null, action)', action=change)

@when(u'I pin the citation key to "{citekey}"')
def step_impl(context, citekey):
  assert len(context.selected) == 1
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(id, "pin", citekey)', id=context.selected[0], citekey=citekey)

@then(u'"{found}" should match "{expected}"')
def step_impl(context, expected, found):
  expected = expand_scenario_variables(context, expected)
  if expected.startswith('~/'):
    expected = os.path.join(context.tmpDir, expected[2:])
  else:
    expected = os.path.join(ROOT, 'test/fixtures', expected)
  with open(expected) as f:
    expected = f.read()

  if found.startswith('~/'):
    found = os.path.join(context.tmpDir, found[2:])
  else:
    found = os.path.join(ROOT, 'test/fixtures', found)
  with open(found) as f:
    found = f.read()

  assert_equal_diff(expected, found)

@step(u'I wait {seconds:d} seconds')
def step_impl(context, seconds):
  time.sleep(seconds)

@step(u'I wait until Zotero is idle')
def step_impl(context):
  while not context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.isIdle()'):
    time.sleep(5)

@step(u'I wait at most {seconds:d} seconds until all auto-exports are done')
def step_impl(context, seconds):
  printed = False
  timeout = True
  for n in range(seconds):
    if not context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.autoExportRunning()'):
      timeout = False
      break
    time.sleep(1)
    utils.print('.', end='')
    printed = True
  if printed: utils.print('')
  assert (not timeout), 'Auto-export timed out'

@step(u'I remove "{path}"')
def step_impl(context, path):
  os.remove(path)

@step(u'I reset the cache')
def step_impl(context):
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.resetCache()')

@step(u'I copy date-added/date-modified for the selected items from the extra field')
def step_impl(context):
  context.zotero.execute('Zotero.getActiveZoteroPane().BetterBibTeX.patchDates()')

@step('I change {param} to {value} on the auto-export')
def step_impl(context, param, value):
  value = json.loads(value)
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.editAutoExport(field, value)', field=param, value=value)

@step('I change its {field} field to {value}')
def step_impl(context, field, value):
  assert len(context.selected) == 1
  context.zotero.execute('''
    const items = await Zotero.Items.getAsync([id])
    const item = items[0]
    await item.loadAllData()
    item.setField(field, value)
    await item.saveTx()
  ''', id=context.selected[0], field=json.loads(field), value=json.loads(value))

@step('I {action} extension {xpi}')
def step_impl(context, action, xpi):
  if action == 'install':
    xpis = glob.glob(xpi)
    assert len(xpis) > 0, f'{xpi} not found'
    assert len(xpis) == 1, f'multiple candidates for {xpi}'
    context.zotero.execute('await Zotero.DebugBridge.install(xpi)', xpi=os.path.abspath(xpis[0]))
  elif action in ['enable', 'disable']:
    context.zotero.execute('await Zotero.DebugBridge[action](addon)', action=action, addon=xpi)
  else:
    raise ValueError(f'Unsupported extension action {action}')

#@step('save a screenshot to {file}')
#def step_impl(context, file):
#  if platform.system() == 'Linux':
#    import autopy
#    autopy.bitmap.capture_screen().save(file)
