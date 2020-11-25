#!/usr/bin/env python3

import os, sys
import json
from collections import defaultdict
from munch import Munch
import glob
import re
import math
import sqlite3
from ortools.algorithms import pywrapknapsack_solver
import argparse

parser = argparse.ArgumentParser()
parser.add_argument('-v', '--verbose', action='store_true')
args = parser.parse_args()

db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE tests(build, name, duration, state)')
db.execute('CREATE TABLE last(name, state)')

class NoTestError(Exception):
  pass
class FailedError(Exception):
  pass
class Log:
  def __init__(self, build, timings):
    self.verified = False
    self.id = build

    tests = {}

    for feature in timings:
      if not 'elements' in feature: continue

      for test in feature.elements:
        if test.type == 'background': continue

        if test.status == 'failed':
          status = test.status
        elif not 'use.with_slow=true' in test.tags and not 'slow' in test.tags:
          status = 'fast'
        else:
          status = 'slow'

        # for retries, the last successful iteration (if any) will overwrite the failed iterations
        tests[re.sub(r' -- @[0-9]+\.[0-9]+ ', '', test.name)] = Munch(
          duration=sum([step.result.duration * 1000 for step in test.steps if 'result' in step and 'duration' in step.result]), # msecs
          status=status
        )
    if len(tests) == 0: raise NoTestError()
    if any(1 for test in tests.values() if test.status == 'failed'): raise FailedError()

    db.execute('DELETE FROM last')
    for name, test in tests.items():
      db.execute('INSERT INTO tests(build, name, duration, state) VALUES (?, ?, ?, ?)', [ build, name, test.duration, test.status ])
      db.execute('INSERT INTO last(name, state) VALUES (?, ?)', [ name, test.status ])
    db.commit()

class Logs:
  @staticmethod
  def clean(log, reason):
    if not os.path.exists(log): return
    print('removing', log, reason)
    os.remove(log)

  @staticmethod
  def build_id(log):
    if os.path.getsize(log) == 0:
      Logs.clean(log, 'empty')
      return False

    try:
      return int(re.match(r'zotero=master=([0-9]+).[23]=push.json$', os.path.basename(log)).group(1))
    except:
      try:
        return int(re.match(r'zotero=v[0-9]+\.[0-9]+\.[0-9]+=([0-9]+).[23]=push.json$', os.path.basename(log)).group(1))
      except:
        Logs.clean(log, 'not zotero-master')
    return False

  @staticmethod
  def builds():
    return sorted(list(set([ Logs.build_id(log) for log in glob.glob(os.path.expanduser('~/pCloud Drive/timing/*.json')) if Logs.build_id(log) ])))

  @staticmethod
  def load(build_id):
    logs = [os.path.expanduser(f'~/pCloud Drive/timing/zotero=master={build_id}.{n}=push.json') for n in [2, 3]]

    try:
      timings = []
      for log in logs:
        with open(log) as f:
          timings = timings + json.load(f, object_hook=Munch.fromDict)
      return Log(build_id, timings)
    except FileNotFoundError:
      [Logs.clean(log, 'not paired') for log in logs]
      return False
    except NoTestError:
      [Logs.clean(log, 'no tests') for log in logs]
      return False
    except FailedError:
      [Logs.clean(log, 'failed') for log in logs]
      return False

builds = [ Logs.load(build) for build in Logs.builds() ]
builds = { build.id: build for build in builds if build }
db.execute('DELETE FROM tests WHERE NOT EXISTS (SELECT 1 FROM last WHERE tests.name = last.name AND tests.state = last.state)')
for (build,) in db.execute('SELECT DISTINCT build FROM tests'):
  builds[build].verified = True
for build in builds.values():
  if not build.verified:
    for log in glob.glob(os.path.expanduser(f'~/pCloud Drive/timing/zotero=master={build.id}.*=push.json')):
      Logs.clean(log, 'no tests remaining')

def balance(state):
  assert state in ['fast', 'slow']

  tests, durations, samples = zip(*db.execute("SELECT name, AVG(duration) as duration, COUNT(*) as n FROM tests WHERE state in ('fast', ?) GROUP BY name", (state,)))
  if 0 in durations: raise ValueError('zero-length test')
  total = sum(durations)
  print('solving', len(tests), state, 'for', total)

  if state == 'slow':
    solver = pywrapknapsack_solver.KnapsackSolver.KNAPSACK_MULTIDIMENSION_BRANCH_AND_BOUND_SOLVER
  else:
    solver = pywrapknapsack_solver.KnapsackSolver.KNAPSACK_MULTIDIMENSION_CBC_MIP_SOLVER
  solver = pywrapknapsack_solver.KnapsackSolver(solver, 'TestBalancer')
  solver.Init([1 for n in durations], [durations], [int(total/2)])
  solver.Solve()

  return sorted([{ 'test': tests[i], 'msecs': durations[i], 'n': samples[i], 'cluster': 1 if solver.BestSolutionContains(i) else 2} for i in range(len(tests))], key=lambda x: x['test'])

  clusters = {'1': [], '2': []}
  clustertime = {'1': [], '2': []}
  for cluster in clusters.keys():
    indexes = sorted([i for i in range(len(tests)) if solver.BestSolutionContains(i) == (cluster == '1')], key=lambda x: tests[x])
    clusters[cluster] = [test for i, test in enumerate(tests) if i in indexes]
    clustertime[cluster] = [dur / factor for i, dur in enumerate(durations) if i in indexes]

  for cluster in clusters.keys():
    print(' ', cluster, sum(clustertime[cluster]), len(clustertime[cluster]), sum(clustertime[cluster]) / len(clustertime[cluster]))
  return clusters

with open('balance.json', 'w') as f:
  json.dump({
    'slow': balance('slow'),
    'fast': balance('fast'),
  }, f, indent = '  ')
