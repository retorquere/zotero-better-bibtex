from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry
import re
from contextlib import contextmanager

@contextmanager
def integer_tag(tag):
    name = tag
    value = None

    if '=' in tag:
      s = tag.split('=', 1)
      name = s[0]
      try:
        value = int(s[1])
      except:
        raise ValueError(f'{tag} must specify a valid integer')

    yield (name, value)

def before_feature(context, feature):
  for scenario in feature.walk_scenarios():
    retries = 0
    for tag in scenario.effective_tags:
      with integer_tag(tag) as (tag, value):
        if tag == 'retry':
          retries = max(retries, 1)
        elif tag == 'retries':
          value = value or 0
          if value == 0: raise ValueError(f'{value} is not a valid number of retries')
          retries = max(retries, value)

    if retries > 0:
      patch_scenario_with_autoretry(scenario, max_attempts=retries + 1)

def before_all(context):
  context.zotero = Zotero(context.config.userdata)
  # test whether the existing references, if any, have gotten a cite key
  context.zotero.export_library(translator = 'Better BibTeX')

def before_scenario(context, scenario):
  context.zotero.reset()
  context.displayOptions = {}
  context.selected = []
  context.imported = None
  context.picked = []
  context.max_export_time = None
  context.zotero.timeout = 60
  for tag in scenario.effective_tags:
    with integer_tag(tag) as (tag, value):
      if tag == 'nightly':
        context.zotero.timeout = max(context.zotero.timeout, 300)
      elif tag == 'timeout':
        value = value or 0
        if value == 0: raise ValueError(f'{value} is not a valid timeout')
        context.zotero.timeout = max(context.zotero.timeout, value)
