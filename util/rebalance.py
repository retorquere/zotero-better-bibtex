#!/usr/bin/env python3

import os
import sys
import json
from munch import Munch
import re
from ortools.algorithms import pywrapknapsack_solver

ref, output = sys.argv[1:]
if not ref.startswith('refs/heads/'):
  print(ref, 'is not a branch')
  sys.exit(0)
branch = ref.split('/')[-1]

print('rebalance', branch, '=>', output)

for job in [1, 2]:
  job = f'logs/behave-zotero-{job}-{branch}.json'
  if not os.path.exists(job):
    print('not found:', job)
    sys.exit(0)

class RunningAverage():
  def __init__(self, average=None, n=0):
    self.average = average
    self.n = n

  def __call__(self, new_value):
    self.n += 1
    if self.n == 1:
      self.average = new_value
    else:
      # https://math.stackexchange.com/questions/106700/incremental-averageing
      self.average = self.average + ((new_value - self.average) / self.n)

  def __float__(self):
    return self.average

  def __repr__(self):
    return "average: " + str(self.average)

class NoTestError(Exception):
  pass
class FailedError(Exception):
  pass

class Log:
  def __init__(self):
    self.tests = []

  def load(self, timings):
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
          # convert to msecs here or too much gets rounded down to 0
          duration=sum([step.result.duration * 1000 for step in test.steps if 'result' in step and 'duration' in step.result]), # msecs
          status=status
        )
    if len(tests) == 0: raise NoTestError()
    if any(1 for test in tests.values() if test.status == 'failed'): raise FailedError()

    for name, test in tests.items():
      self.tests.append(Munch(test=name, msecs=test.duration, status=status))

log = Log()
try:
  for job in [1, 2]:
    with open(f'logs/behave-zotero-{job}-{branch}.json') as f:
      log.load(json.load(f, object_hook=Munch.fromDict))
  print(len(log.tests), 'tests')
  with open(output) as f:
    history = json.load(f, object_hook=Munch.fromDict)

  balance = Munch.fromDict({
    duration: { test.test: { 'msecs': test.msecs, 'runs': 1 } for test in log.tests },
    runs: history.runs + 1,
  })

  for name, test in list(balance.duration.items()):
    if h:= history.duration.get(name):
      if type(h) in (float, int):
        h = Munch(msecs=h, runs=history.runs)
      else:
        h.runs += history.runs
      avg = RunningAverage(h.msecs, h.runs)
      avg(test.msecs)
      # round to 10 msecs to prevent flutter
      balance.duration[name] = Munch(msecs=round(float(avg) / 10) * 10, runs = h.runs + 1)
    balance.duration[name].runs -= history.runs
    if balance.runs == 0: balance.duration[name] = balance.duration[name].msecs

  for status in ['slow', 'fast']:
    tests = [test for test in log.tests if status in [ 'slow', test.status] ]
    if status == 'slow':
      solver = pywrapknapsack_solver.KnapsackSolver.KNAPSACK_MULTIDIMENSION_BRANCH_AND_BOUND_SOLVER
    else:
      solver = pywrapknapsack_solver.KnapsackSolver.KNAPSACK_MULTIDIMENSION_CBC_MIP_SOLVER
    durations = [test.msecs for test in tests]

    solver = pywrapknapsack_solver.KnapsackSolver(solver, 'TestBalancer')
    solver.Init([1 for n in durations], [durations], [int(sum(durations)/2)])
    solver.Solve()

    balance[status] = {}
    for i in [1, 2]:
      balance[status][i] = [ test.test for t, test in enumerate(tests) if solver.BestSolutionContains(t) == (i == 1) ]
    print(status, len(tests), 'tests,', { k: len(t) for k, t in balance[status].items()})
except FileNotFoundError:
  print('logs incomplete')
  sys.exit()
except NoTestError:
  print('missing tests')
  sys.exit()
except FailedError:
  print('some tests failed')
  sys.exit()

print('writing', output)
#with open(output, 'w') as f:
  json.dump(balance, f, indent='  ', sort_keys=True)
print(f"::set-output name=balance::{output}")
