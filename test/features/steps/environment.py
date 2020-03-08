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

active_tag_value_provider = {
  'client': 'zotero',
  'slow': 'true',
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

def before_scenario(context, scenario):
  if active_tag_matcher.should_exclude_with(scenario.effective_tags):
    scenario.skip("DISABLED ACTIVE-TAG")
    return

  context.zotero.reset()
  context.displayOptions = {}
  context.selected = []
  context.imported = None
  context.picked = []

  context.timeout = 60
  for tag in scenario.effective_tags:
    if tag == 'use.with_slow=true':
      context.timeout = max(context.timeout, 300)
    elif tag.startswith('timeout='):
      context.timeout = max(context.timeout, int(tag.split('=')[1]))
  context.zotero.config.timeout = context.timeout
