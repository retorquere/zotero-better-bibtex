from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry
import re

def before_feature(context, feature):
  for scenario in feature.walk_scenarios():
    retries = None
    for tag in scenario.effective_tags:
      r = tag.split('=', 1)
      if len(r) != 2 or r[0] != 'retries': continue

      r = r[1]
      try:
        r = int(r)
        if r == 0: raise ValueError(tag) # will be caught in the except
      except:
        raise ValueError(f'{r} is not a valid number of retries')

      if retries is None or r > retries: retries = r

    if not retries is None:
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
