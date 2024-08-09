#!/usr/bin/env python3

import os
import sys
import json
import argparse
import glob
from munch import Munch
import re
import binpacking
import math
from pathlib import Path
import datetime

# TODO: only upload slow stats
# TODO: allow non-optimal solutions

parser = argparse.ArgumentParser()
parser.add_argument('-b', '--bins', required=True)
parser.add_argument('-d', '--durations', required=True)
parser.add_argument('-m', '--minutes', type=int, required=True) # one hour of test time becomes 6 builds
parser.add_argument(      '--beta', default=False, action='store_true')
parser.add_argument(      '--legacy', default=False, action='store_true')
parser.add_argument('-s', '--slow', default=False, action='store_true')
args = parser.parse_args()

def publish(var, value):
  with open(os.environ['GITHUB_ENV'], 'a') as f:
    print(f"{var}={value}")
    print(f"{var}={value}", file=f)

class Tests:
  def __init__(self):
    with open(args.durations) as f:
      try:
        tests = json.load(f, object_hook=Munch.fromDict)
      except json.decoder.JSONDecodeError:
        tests = {}
      for name, test in tests.items():
        test.name = name
      self.tests = tests.values()

  def balance(self):
    tests = [test for test in self.tests if not test.slow or args.slow]
    # self.seconds = sum([test.seconds for test in tests])
    data = Munch(
      weights = [],
      bytime = {},
      byname = {},
      bin_capacity = args.minutes * 60
    )
    for test in tests:
      data.weights.append(test.seconds)
      if test.name in data.byname: raise ValueError(test.name)
      data.byname[test.name] = test
      if test.seconds not in data.bytime:
        data.bytime[test.seconds] = []
      data.bytime[test.seconds].append(test)

    print('Total test time:', str(datetime.timedelta(seconds=sum(data.weights))))
    print('Bin capacity:', data.bin_capacity, 'seconds')

    try:
      bins = binpacking.to_constant_volume(data.weights, args.minutes * 60)
      self.bins = [
        [ data.bytime[weight].pop().name for weight in bin ]
        for bin in bins
      ]
    except:
      self.bins = [ tests ]

    print([
      (bin, sum([data.byname[test].seconds for test in tests]))
      for bin, tests in enumerate(self.bins)
    ])

    Path(os.path.dirname(args.bins)).mkdir(parents=True, exist_ok=True)
    with open(args.bins, 'w') as f:
      print('Saving test bins to', args.bins)
      json.dump(self.bins, f, indent='  ')

Tests = Tests()
Tests.balance()
publish('bin_ids', json.dumps(list(range(max(len(Tests.bins), 1)))))
publish('bins', args.bins)

clients = [ 'zotero', 'zotero6', 'zotero-beta' ]
publish('clients', json.dumps(clients))
