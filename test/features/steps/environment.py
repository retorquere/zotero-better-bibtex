from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry
from behave.tag_matcher import ActiveTagMatcher, setup_active_tag_values
import re
from contextlib import contextmanager
import urllib.request
from munch import *
import os
import steps.utils as utils
import sys
import json

active_tag_value_provider = {
  'client': 'zotero',
  'slow': 'false',
}
active_tag_matcher = ActiveTagMatcher(active_tag_value_provider)

@contextmanager
def before_feature(context, feature):
  if active_tag_matcher.should_exclude_with(feature.tags):
    feature.skip(reason="DISABLED ACTIVE-TAG")

  for scenario in feature.walk_scenarios():
    retries = 0
    for tag in scenario.effective_tags:
      if tag.startswith('retries='):
        retries = int(tag.split('=')[1])

    if retries > 0:
      patch_scenario_with_autoretry(scenario, max_attempts=retries + 1)

def before_all(context):
  context.zotero = Zotero(context.config.userdata)
  setup_active_tag_values(active_tag_value_provider, context.config.userdata)
  # test whether the existing references, if any, have gotten a cite key
  context.zotero.export_library(translator = 'Better BibTeX')

try:
  with open(os.path.join(os.path.dirname(__file__), '../../../test/balance.json')) as f:
    balance = json.load(f)
except FileNotFoundError:
  balance = None

def before_scenario(context, scenario):
  if active_tag_matcher.should_exclude_with(scenario.effective_tags):
    scenario.skip(f"DISABLED ACTIVE-TAG {str(active_tag_value_provider)}")
    return
  if balance is not None and 'bin' in context.config.userdata:
    if re.sub(r' -- @[0-9]+\.[0-9]+ ', '', scenario.name) in balance['slow' if active_tag_value_provider['slow'] == 'true' else 'fast']['1']:
      test_bin = '1'
    else:
      test_bin = '2'
    if context.config.userdata['bin'] != test_bin:
      scenario.skip(f'TESTED IN BIN {test_bin}')
      return
  if 'test' in context.config.userdata and not context.config.userdata['test'] in scenario.name:
    scenario.skip(f"ONLY TESTING SCENARIOS WITH {context.config.userdata['test']}")

  context.zotero.reset()
  context.displayOptions = {}
  context.selected = []
  context.imported = None
  context.picked = []

  context.timeout = 60
  # jurism is just generally slower
  if context.config.userdata.get('client') == 'jurism': context.timeout *= 2
  for tag in scenario.effective_tags:
    if tag == 'use.with_slow=true':
      context.timeout = max(context.timeout, 300)
    elif tag.startswith('timeout='):
      context.timeout = max(context.timeout, int(tag.split('=')[1]))
  context.zotero.config.timeout = context.timeout
