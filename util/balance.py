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

db = sqlite3.connect(':memory:')
db.execute('CREATE TABLE tests(build, job, name, duration, state, PRIMARY KEY(build, name))')

restart = False
for log in sorted(glob.glob(os.path.expanduser('~/pCloud Drive/travis/*.json'))):
  print(log)
  if os.path.getsize(log) == 0 or not os.path.basename(log).startswith('zotero=master='):
    os.remove(log)
    continue

  job = os.path.splitext(os.path.basename(log))[0].split('=')
  if len(job) != 4 or job[3] != 'push':
    os.remove(log)
    continue
  build, job = job[2].split('.')
  has_tests = False
  with open(log) as f:
    for feature in json.load(f, object_hook=Munch.fromDict):
      if not 'elements' in feature: continue

      for test in feature.elements:
        if test.type == 'background': continue

        has_tests = True
        #print(json.dumps(test, indent='  '))
        if test.status == 'failed' or (not 'use.with_slow=true' in test.tags and not 'slow' in test.tags):
          status = test.status
        else:
          status = 'slow'

        db.execute('INSERT OR REPLACE INTO tests(build, job, name, duration, state) VALUES (?, ?, ?, ?, ?)', [
          build,
          job,
          re.sub(r' -- @[0-9]+\.[0-9]+ ', '', test.name),
          sum([step.result.duration for step in test.steps if 'result' in step and 'duration' in step.result]),
          status,
        ])
  if not has_tests:
    print('-', log)
    os.remove(log)
    restart = True

for build, n in db.execute('WITH builds AS (SELECT DISTINCT build, job FROM tests) SELECT build, count(*) FROM builds GROUP BY build HAVING COUNT(*) <> 2'):
  for log in glob.glob(os.path.expanduser(f'~/pCloud Drive/travis/*{build}*.json')):
    print('-', log)
    os.remove(log)
    restart = True

for build, state in db.execute("SELECT DISTINCT build, state FROM tests WHERE state = 'failed'"):
  for log in glob.glob(os.path.expanduser(f'~/pCloud Drive/travis/*{build}*.json')):
    print('-', log)
    os.remove(log)
    restart = True

sql = '''
  WITH
  last AS (SELECT MAX(build) as build FROM tests),
  last_tests AS (SELECT name, state, tests.build as build, name || ' ## ' || state AS test_state FROM tests JOIN last ON tests.build = last.build)

  SELECT DISTINCT tests.build as build
  FROM tests
  JOIN last_tests ON tests.name = last_tests.name
  WHERE tests.name || ' ## ' || tests.state NOT IN (SELECT test_state FROM last_tests)
'''
for (build,) in db.execute(sql):
  for log in glob.glob(os.path.expanduser(f'~/pCloud Drive/travis/*{build}*.json')):
    print('-', log)
    os.remove(log)
    restart = True

if restart:
  print('please restart')
  sys.exit(1)

db.execute('CREATE TABLE durations(name, duration, state)')
db.execute('''
  WITH
  last AS (SELECT MAX(build) as build FROM tests),
  names AS (SELECT name FROM tests JOIN last ON tests.build = last.build)

  INSERT INTO durations (name, duration, state)
  SELECT name, AVG(duration) as duration, MAX(state) as state
  FROM tests
  WHERE name IN (SELECT name FROM names)
  GROUP BY name
''')

def balance(slow=False):
  sql = 'SELECT name, duration FROM durations'
  if not slow: sql += " WHERE state <> 'slow'"

  tests, durations = zip(*db.execute(sql))

  solver = pywrapknapsack_solver.KnapsackSolver(pywrapknapsack_solver.KnapsackSolver.KNAPSACK_MULTIDIMENSION_BRANCH_AND_BOUND_SOLVER, 'KnapsackExample')
  solver.Init([1 for n in durations], [durations], [int(sum(durations)/2)])
  #solver.Init(durations, [durations], [int(sum(durations)/2)])
  computed_value = solver.Solve()

  clusters = {'1': [], '2': []}
  for cluster in clusters.keys():
    clusters[cluster] = sorted([test for i, test in enumerate(tests) if solver.BestSolutionContains(i) == (cluster == '1')])
  print('slow' if slow else 'fast')
  for cluster in clusters.keys():
    print(' ', cluster, sum([dur for i, dur in enumerate(durations) if solver.BestSolutionContains(i) == (cluster == '1')]))
  return clusters

with open('balance.json', 'w') as f:
  json.dump({
    'slow': balance(True),
    'fast': balance(False),
  }, f, indent = '  ')
