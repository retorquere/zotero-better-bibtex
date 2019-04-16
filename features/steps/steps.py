from behave import given, when, then, use_step_matcher
import urllib.request
import json
import zotero

@given('I set preference {pref} to {value}')
def step_impl(context, pref, value):
  context.preferences[pref] = value

@given(r'I import {references:d} reference{s?} from {source}')
def step_impl(context, references, s, source):
  assert zotero.import_file(context, source) == references

@then('an export using "{translator}" should match "{expected}"')
def step_impl(context, translator, output):
  zotero.export_library(
    translator = translator,
    expected = expected
  )
