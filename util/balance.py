#!/usr/bin/env python3

import os
import sys
import json
import argparse
import glob
from munch import Munch
import re
from ortools.linear_solver import pywraplp
import math
from pathlib import Path

parser = argparse.ArgumentParser()
parser.add_argument('-b', '--bins', required=True)
parser.add_argument('-d', '--durations', required=True)
parser.add_argument('-s', '--slow', default=False, action='store_true')
parser.add_argument('--beta')
args = parser.parse_args()

def publish(var, value):
  value = json.dumps(value)
  print(f"set-output name={var}::{value}")
  print(f"::set-output name={var}::{value}")

class NoTestError(Exception):
  pass
class FailedError(Exception):
  pass
class Tests:
  def __init__(self):
    self.tests = []

  def load(self, timings):
    with open(timings) as f:
      timings = json.load(f, object_hook=Munch.fromDict)

    tests = {}

    for feature in timings:
      if not 'elements' in feature: continue

      for test in feature.elements:
        if test.type == 'background': continue

        # for retries, the last successful iteration (if any) will overwrite the failed iterations
        name = re.sub(r' -- @[0-9]+\.[0-9]+ ', '', test.name)
        tests[name] = Munch(
          name = name,
          duration = sum([step.result.duration for step in test.steps if 'result' in step and 'duration' in step.result]),
          failed = (test.status == 'failed'),
          slow = 'use.with_slow=true' in test.tags or 'slow' in test.tags
        )
    if len(tests) == 0: raise NoTestError()
    if any(1 for test in tests.values() if test.failed): raise FailedError()

    self.tests += tests.values()

  def balance(self):
    tests = [test for test in self.tests if not test.slow or args.slow]
    self.duration = sum([test.duration for test in tests])
    solver = pywraplp.Solver.CreateSolver('SCIP')

    data = Munch(
      weights = [test.duration for test in tests],
      tests = list(range(len(tests))),
      bins = list(range(len(tests))),
      bin_capacity = math.ceil(max([test.duration for test in tests]))
    )
    # https://developers.google.com/optimization/bin/bin_packing
    # x[i, j] = 1 if item i is packed in bin j.
    x = {
      (i, j): solver.IntVar(0, 1, f'x_{i}_{j}')
      for i in data.tests
      for j in data.bins
    }
    # y[j] = 1 if bin j is used.
    y = {
      j: solver.IntVar(0, 1, 'y[%i]' % j)
      for j in data.bins
    }
    # constraints
    # Each item must be in exactly one bin.
    for i in data.tests:
      solver.Add(sum(x[i, j] for j in data.bins) == 1)
    # The amount packed in each bin cannot exceed its capacity.
    for j in data.bins:
      solver.Add(sum(x[(i, j)] * data.weights[i] for i in data.tests) <= y[j] * data.bin_capacity)
    # Objective: minimize the number of bins used.
    solver.Minimize(solver.Sum([y[j] for j in data.bins]))

    solution = solver.Solve()
    if solution != pywraplp.Solver.OPTIMAL:
      raise ValueError('No optimal solution')
    bins = {}
    for j in data.bins:
      if y[j].solution_value() == 1:
        bin_tests = []
        bin_weight = 0
        for i in data.tests:
          if x[i, j].solution_value() > 0:
            bin_tests.append(tests[i])
            bin_weight += data.weights[i]
        if bin_weight > 0:
          bins[j] = bin_tests
    self.bins = sorted(bins.values(), key=lambda cluster: sum([test.duration for test in cluster]))
    print('Time: ', math.ceil(solver.WallTime()/ 1000), 'seconds')
    print('Bins:', [sum([test.duration for test in cluster]) for cluster in self.bins])

    Path(os.path.dirname(args.bins)).mkdir(parents=True, exist_ok=True)
    with open(args.bins, 'w') as f:
      json.dump([[test.name for test in cluster] for cluster in self.bins], f, indent='  ')

Tests = Tests()
Tests.load(args.durations)
Tests.balance()
publish('bins', list(range(len(Tests.bins))))

clients = ['zotero', 'jurism']
if args.beta == 'true':
  clients += [client + '-beta' for client in clients]
  print('### REMOVING jurism-beta ###')
  clients = [client for client in clients if client != 'jurism-beta']
publish('clients', clients)
