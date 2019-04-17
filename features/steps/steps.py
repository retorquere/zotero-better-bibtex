from behave import given, when, then, use_step_matcher
import urllib.request
import json
import zotero
import time
from hamcrest import assert_that, equal_to

@step('I set preference {pref} to {value}')
def step_impl(context, pref, value):
  context.preferences[pref] = context.preferences.parse(value)

@step(r'I import {references:d} references from "{source}"')
def step_impl(context, references, source):
  assert_that(zotero.import_file(context, source), equal_to(references))

@step(r'I import 1 reference from "{source}" into "{collection}"')
def step_impl(context, source, collection):
  assert_that(zotero.import_file(context, source, collection), equal_to(1))

@step(r'I import 1 reference from "{source}"')
def step_impl(context, source):
  assert_that(zotero.import_file(context, source), equal_to(1))

@given(u'I import 1 reference with 1 attachment from "{source}"')
def step_impl(context):
  assert_that(zotero.import_file(context, source), equal_to(1))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}" into a new collection')
def step_impl(context, references, attachments, source):
  assert_that(zotero.import_file(context, source, True), equal_to(references))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}"')
def step_impl(context, references, attachments, source):
  assert_that(zotero.import_file(context, source), equal_to(references))

@step('an export using "{translator}" should match "{expected}"')
def step_impl(context, translator, expected):
  zotero.export_library(
    displayOptions = context.displayOptions,
    translator = translator,
    expected = expected
  )

@when(u'I select the first item where {field} = "{value}"')
def step_impl(context, field, value):
  context.selected = zotero.execute('return await Zotero.BetterBibTeX.TestSupport.select(field, value)', field=field, value=value)
  assert context.selected is not None
  time.sleep(3)

@when(u'I remove the selected item')
def step_impl(context):
  zotero.execute('await Zotero.Items.trashTx([id])', id=context.selected)

@when(u'I pick "{title}", {label} {locator} for CAYW')
def step_impl(context, title, label, locator):
  picked = zotero.execute('return await Zotero.BetterBibTeX.TestSupport.find(title)', title=title)
  assert picked is not None
  context.picked.append({ 'id': picked, 'label': label, 'locator': locator })

@then(u'the picks for "{fmt}" should be "{expected}"')
def step_impl(context, fmt, expected):
  found = zotero.execute('return await Zotero.BetterBibTeX.TestSupport.pick(fmt, picks)', fmt=fmt, picks=context.picked)
  zotero.assert_equal_diff(expected.strip(), found.strip())

@when(u'I {change} the citation key')
def step_impl(context, change):
  assert change in ['pin', 'unpin', 'refresh']
  zotero.execute('await Zotero.BetterBibTeX.TestSupport.pinCiteKey(itemID, action)', itemID=context.selected, action=change)

@then(u'an export using "Better BibTeX" with the following export options should match "export/Better BibTeX.029.bibtex"')
def step_impl(context):
    raise NotImplementedError(u'STEP: Then an export using "Better BibTeX" with the following export options should match "export/Better BibTeX.029.bibtex"')

