from behave import given, when, then, use_step_matcher
import urllib.request
import json
import zotero
import time
import os
from hamcrest import assert_that, equal_to
from steps.utils import assert_equal_diff, expand_scenario_variables

import pathlib
for d in pathlib.Path(__file__).resolve().parents:
  if os.path.exists(os.path.join(d, 'behave.ini')):
    ROOT = d
    break

@step('I set preference {pref} to {value}')
def step_impl(context, pref, value):
  # bit of a cheat...
  if pref.endswith('.postscript':
    pref = expand_scenario_variables(context, pref)
  context.zotero.preferences[pref] = context.zotero.preferences.parse(value)

@step(r'I import {references:d} references from "{source}"')
def step_impl(context, references, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source), equal_to(references))

@step(r'I import 1 reference from "{source}" into "{collection}"')
def step_impl(context, source, collection):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source, collection), equal_to(1))

@step(r'I import 1 reference from "{source}"')
def step_impl(context, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source), equal_to(1))

@given(u'I import 1 reference with 1 attachment from "{source}"')
def step_impl(context, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source), equal_to(1))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}" into a new collection')
def step_impl(context, references, attachments, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source, True), equal_to(references))

@step(r'I import {references:d} references from "{source}" into a new collection')
def step_impl(context, references, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source, True), equal_to(references))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}"')
def step_impl(context, references, attachments, source):
  source = expand_scenario_variables(context, source)
  assert_that(context.zotero.import_file(context, source), equal_to(references))

@step(u'an auto-export to "{output}" using "{translator}" should match "{expected}"')
def step_impl(context, translator, output, expected):
  expected = expand_scenario_variables(context, expected)
  context.zotero.export_library(
    displayOptions = { **context.displayOptions, 'keepUpdated': True},
    translator = translator,
    output = output,
    expected = expected,
    resetCache = True
  )

@then(u'an auto-export of "{collection}" to "{output}" using "{translator}" should match "{expected}"')
def step_impl(context, translator, collection, output, expected):
  expected = expand_scenario_variables(context, expected)
  context.zotero.export_library(
    displayOptions = { **context.displayOptions, 'keepUpdated': True},
    translator = translator,
    collection = collection,
    output = output,
    expected = expected,
    resetCache = True
  )

@step('an export using "{translator}" with {displayOption} on should match "{expected}"')
def step_impl(context, translator, displayOption, expected):
  expected = expand_scenario_variables(context, expected)
  context.zotero.export_library(
    displayOptions = { **context.displayOptions, displayOption: True},
    translator = translator,
    expected = expected
  )

@step('an export using "{translator}" should match "{expected}"')
def step_impl(context, translator, expected):
  expected = expand_scenario_variables(context, expected)
  context.zotero.export_library(
    displayOptions = context.displayOptions,
    translator = translator,
    expected = expected
  )

@step('the library should match "{expected}"')
def step_impl(context, expected):
  expected = expand_scenario_variables(context, expected)
  context.zotero.export_library(
    displayOptions = context.displayOptions,
    translator = 'BetterBibTeX JSON',
    expected = expected
  )

@when(u'I select the first item where {field} = "{value}"')
def step_impl(context, field, value):
  context.selected = context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.select(field, value)', field=field, value=value)
  assert context.selected is not None
  time.sleep(3)

@when(u'I remove the selected item')
def step_impl(context):
  context.zotero.execute('await Zotero.Items.trashTx([id])', id=context.selected)

@when(u'I pick "{title}", {label} {locator} for CAYW')
def step_impl(context, title, label, locator):
  picked = context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.find(title)', title=title)
  assert picked is not None
  context.picked.append({ 'id': picked, 'label': label, 'locator': locator })

@then(u'the picks for "{fmt}" should be "{expected}"')
def step_impl(context, fmt, expected):
  found = context.zotero.execute('return await Zotero.BetterBibTeX.TestSupport.pick(fmt, picks)', fmt=fmt, picks=context.picked)
  assert_equal_diff(expected.strip(), found.strip())

@when(u'I {change} the citation key')
def step_impl(context, change):
  assert change in ['pin', 'unpin', 'refresh']
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(itemID, action)', itemID=context.selected, action=change)

@when(u'I {change} all citation keys')
def step_impl(context, change):
  assert change in ['pin', 'unpin', 'refresh']
  context.zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(null, action)', action=change)

@then(u'"{found}" should match "{expected}"')
def step_impl(context, expected, found):
  expected = expand_scenario_variables(context, expected)
  if expected[0] != '/': expected = os.path.join(ROOT, 'test/fixtures', expected)
  with open(expected) as f:
    expected = f.read()

  if found[0] != '/': found = os.path.join(ROOT, 'test/fixtures', found)
  with open(found) as f:
    found = f.read()

  assert_equal_diff(expected.strip(), found.strip())

@when(u'I wait {seconds:d} seconds')
def step_impl(context, seconds):
  time.sleep(seconds)

