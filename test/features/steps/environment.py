from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry
import re
from contextlib import contextmanager
import urllib.request
from munch import *
import os
from steps.utils import ROOT

@contextmanager
def value_tag(tag):
    name = tag
    value = None

    if '=' in tag:
      s = tag.split('=', 1)
      name = s[0]
      try:
        value = int(s[1])
      except:
        raise ValueError(f'{tag} must specify a valid integer')
    elif ':' in tag:
      s = tag.split(':', 1)
      name = s[0]
      value = s[1]
      if len(value) == 0: raise ValueError(f'{tag} must specify a valid string')

    yield (name, value)

def before_feature(context, feature):
  for scenario in feature.walk_scenarios():
    retries = 0
    for tag in scenario.effective_tags:
      with value_tag(tag) as (tag, value):
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
  context.displayOptions = {}
  context.selected = []
  context.imported = None
  context.picked = []
  context.max_export_time = None

  timeout = 60
  db = None
  for tag in scenario.effective_tags:
    with value_tag(tag) as (tag, value):
      if tag == 'nightly':
        timeout = max(timeout, 300)
      elif tag == 'timeout':
        value = value or 0
        assert value > 0, f'{value} is not a valid timeout'
        timeout = max(timeout, value)

      elif tag == 'db':
        db = value
        assert db, f'{value} is not a valid db tag'

  if db:
    d = os.path.join(ROOT, 'test', 'db', db)
    if not os.path.exists(d): os.makedirs(d)
    zotero = os.path.join(d, 'zotero.sqlite')
    if not os.path.exists(zotero):
      urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{db}.zotero.sqlite', zotero)
    bbt = os.path.join(d, 'better-bibtex.sqlite')
    if not os.path.exists(bbt):
      urllib.request.urlretrieve(f'https://github.com/retorquere/zotero-better-bibtex/releases/download/test-database/{db}.better-bibtex.sqlite', bbt)

    context.zotero.shutdown()
    context.zotero = Zotero(context.config.userdata, db=Munch(zotero=zotero, bbt=bbt))
  else:
    context.zotero.reset()

  context.zotero.timeout = timeout
