from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry

def before_feature(context, feature):
  for scenario in feature.walk_scenarios():
    if "flaky" in scenario.effective_tags:
      patch_scenario_with_autoretry(scenario, max_attempts=10)

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
