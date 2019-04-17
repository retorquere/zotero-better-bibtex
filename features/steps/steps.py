from behave import given, when, then, use_step_matcher
import urllib.request
import json
import zotero
from hamcrest import assert_that, equal_to

@step('I set preference {pref} to {value}')
def step_impl(context, pref, value):
  context.preferences[pref] = value

@step(r'I import {references:d} references from "{source}"')
def step_impl(context, references, source):
  assert_that(zotero.import_file(context, source), equal_to(references))

@step(r'I import {references:d} references with {attachments:d} attachments from "{source}" into a new collection')
def step_impl(context, references, attachments, source):
  assert_that(zotero.import_file(context, source, True), equal_to(references))

@then('an export using "{translator}" should match "{expected}"')
def step_impl(context, translator, expected):
  zotero.export_library(
    displayOptions = context.displayOptions,
    translator = translator,
    expected = expected
  )
