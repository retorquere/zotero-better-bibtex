from steps.zotero import Zotero
from behave.contrib.scenario_autoretry import patch_scenario_with_autoretry
from behave.tag_matcher import ActiveTagMatcher, setup_active_tag_values
from behave.model import ScenarioOutline
import functools
import re
from contextlib import contextmanager
import urllib.request
from munch import *
import os
import steps.utils as utils
import sys
import json
import time
import math
from pathlib import Path

active_tag_value_provider = {
  'client': 'zotero',
  'slow': 'false',
  'beta': 'false',
}
active_tag_matcher = ActiveTagMatcher(active_tag_value_provider)

def patch_scenario_with_softfail(scenario):
  """Monkey-patches :func:`~behave.model.Scenario.run()` to soft-fail a
  scenario that fails.

  This is helpful when the test infrastructure (server/network environment)
  is unreliable (which should be a rare case).

  :param scenario:    Scenario or ScenarioOutline to patch.
  """
  def scenario_run_with_softfail(scenario_run, *args, **kwargs):
    if not scenario_run(*args, **kwargs):
      return False # -- NOT-FAILED = PASSED
    # -- SCENARIO FAILED:
    print("SOFT-FAIL")
    return False

  if isinstance(scenario, ScenarioOutline):
    scenario_outline = scenario
    for scenario in scenario_outline.scenarios:
      scenario_run = scenario.run
      scenario.run = functools.partial(scenario_run_with_softfail, scenario_run)
  else:
    scenario_run = scenario.run
    scenario.run = functools.partial(scenario_run_with_softfail, scenario_run)

def before_feature(context, feature):
  if lme:= context.config.userdata.get('log_memory_every'):
    context.zotero.execute('Zotero.BetterBibTeX.TestSupport.startTimedMemoryLog(msecs)', msecs=int(lme))
  if active_tag_matcher.should_exclude_with(feature.tags):
    feature.skip(reason="DISABLED ACTIVE-TAG")

  for scenario in feature.walk_scenarios():
    retries = 0
    optional = False
    for tag in scenario.effective_tags:
      if tag.startswith('optional'):
        optional = True
      if tag.startswith('retries='):
        retries = int(tag.split('=')[1])

    if retries > 0:
      patch_scenario_with_autoretry(scenario, max_attempts=retries + 1)
    if optional:
      patch_scenario_with_softfail(scenario)

class TestBin:
  def __init__(self):
    self.bin = None
    self.tests = None
    self.durations = {}

  def load(self, context):
    if not 'bin' in context.config.userdata:
      return

    self.bin = int(context.config.userdata['bin'])

    assert 'bins' in context.config.userdata

    with open(context.config.userdata['bins']) as f:
      self.tests = {
        test: i
        for i, _bin in enumerate(json.load(f))
        for test in _bin
      }

  def nameof(self, scenario):
    return re.sub(r' -- @[0-9]+\.[0-9]+ ', '', scenario.name)

  def save(self, context):
    if durations := context.config.userdata.get('durations'):
      Path(os.path.dirname(durations)).mkdir(parents=True, exist_ok=True)
      with open(durations, 'w') as f:
        durations = { test: { 'seconds': max(duration.stop - duration.start, 1), 'slow': duration.slow } for test, duration in self.durations.items() }
        json.dump(durations, f, indent='  ')

  def start(self, scenario):
    self.durations[self.nameof(scenario)] = Munch(
      start=math.floor(time.time()),
      stop=None,
      slow=any([True for tag in scenario.effective_tags if tag == 'use.with_slow=true'])
    )
  def stop(self, scenario):
    test = self.nameof(scenario)
    if test in self.durations:
      self.durations[test].stop = math.ceil(time.time())

  def test_here(self, scenario):
    return self.bin is None or self.tests.get(self.nameof(scenario), 0) == self.bin

  def test_in(self, scenario):
    return self.tests.get(self.nameof(scenario), 0)
TestBin = TestBin()

def before_all(context):
  TestBin.load(context)
  context.memory = Munch(total=None, increase=None)
  context.zotero = Zotero(context.config.userdata)
  setup_active_tag_values(active_tag_value_provider, context.config.userdata)
  # test whether the existing references, if any, have gotten a cite key
  if not 'import' in context.config.userdata:
    context.zotero.export_library(translator = 'Better BibTeX')

def after_all(context):
  TestBin.save(context)

def before_scenario(context, scenario):
  if active_tag_matcher.should_exclude_with(scenario.effective_tags):
    #scenario.skip(f"DISABLED ACTIVE-TAG {str(active_tag_value_provider)}")
    scenario.skip()
    return
  if not TestBin.test_here(scenario):
    #scenario.skip(f'TESTED IN BIN {TestBin.test_in(scenario)}')
    scenario.skip()
    return
  if 'test' in context.config.userdata and not any(test in scenario.name.lower() for test in context.config.userdata['test'].lower().split(',')):
    #scenario.skip(f"ONLY TESTING SCENARIOS WITH {context.config.userdata['test']}")
    scenario.skip()
    return
  if 'inspireHEP' in context.config.userdata and context.config.userdata['inspireHEP'] != 'true' and 'inspire' in scenario.name.lower():
    scenario.skip('skipping inspire-HEP')
    scenario.skip()
    return

  TestBin.start(scenario)
  context.zotero.reset(scenario.name)
  context.displayOptions = {
    # set export option to the --worker option passed to behave
    'worker': context.zotero.worker,
  }
  context.selected = []
  context.imported = None
  context.picked = []

  context.timeout = 90
  # jurism is just generally slower
  if context.config.userdata.get('client') == 'jurism': context.timeout *= 3
  for tag in scenario.effective_tags:
    if tag == 'use.with_slow=true':
      context.timeout = max(context.timeout, 300)
    elif tag.startswith('timeout='):
      context.timeout = max(context.timeout, int(tag.split('=')[1]))
  context.zotero.config.timeout = context.timeout

def after_scenario(context, scenario):
  if context.memory.increase or context.memory.total:
    memory = Munch.fromDict(context.zotero.execute('return Zotero.BetterBibTeX.TestSupport.memoryState("behave cap")'))
    if context.memory.increase and memory.delta > context.memory.increase:
      raise AssertionError(f'Memory increase cap of {context.memory.increase}MB exceeded by {memory.delta - context.memory.increase}MB')
    if context.memory.total and memory.resident > context.memory.total:
      raise AssertionError(f'Total memory cap of {context.memory.total}MB exceeded by {memory.resident - context.memory.total}MB')
  TestBin.stop(scenario)
