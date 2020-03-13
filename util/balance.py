#!/usr/bin/env python3

import os, sys
import json
from collections import defaultdict
from munch import Munch
import glob
import re

class Suite:
  def __init__(self, full=False):
    self.tags = set()
    self.tests = []
    self.failed = False
    self.full = full
    self.batch_prefix = 'test-cluster-'

  def duration(self):
    return sum(test.duration for test in self.tests)

  def split(self, n):
    batches = [ Suite() for i in range(0, n) ]
    for test in sorted(self.tests, key=lambda test: test.duration, reverse=True):
      if 'use.with_slow=true' in test.tags: continue

      sorted(batches, key=lambda batch: batch.duration() + test.duration)[0].tests.append(test)
      #print('##', [ batch.duration() for batch in batches ])

    for test in sorted(self.tests, key=lambda test: test.duration, reverse=True):
      if not 'use.with_slow=true' in test.tags: continue

      sorted(batches, key=lambda batch: batch.duration() + test.duration)[0].tests.append(test)
      #print('##', [ batch.duration() for batch in batches ])

    return batches

  def diff(self, soll=None):
    for test in sorted(self.tests, key=lambda test: test.location):
      ist = [tag for tag in test.tags if tag.startswith(self.batch_prefix)]
      if len(ist) == 0:
        ist = None
      elif len(ist) == 1:
        ist = ist[0]
      else:
        raise ValuError(json.dumps(ist))

      if 'use.with_slow=true' in test.tags:
        slow = 'slow: '
      else:
        slow = ''

      if ist == soll:
        pass
      elif ist and soll:
        print(f'{slow}remove', ist, 'and add', soll, ':', test.name, test.location)
      elif ist and soll is None:
        print(f'{slow}remove', ist, ':', test.name, test.location)
      elif ist is None and soll:
        print(f'{slow}add', soll, ':', test.name, test.location)
      else:
        raise ValueError(json.dumps({ 'ist': ist, 'soll': soll }))

builds = defaultdict(Suite)
for log in glob.glob(os.path.expanduser('~/pCloud Drive/travis/zotero=master=*.json')):
  print(log)
  if os.path.getsize(log) == 0 or not os.path.basename(log).startswith('zotero='):
    os.remove(log)
    continue
  buildid = os.path.splitext(os.path.basename(log))[0].split('=')[2].split('.')[0]
  build = builds[buildid]
  if build.failed: continue
  with open(log) as f:
    for feature in json.load(f, object_hook=Munch.fromDict):
      if not 'elements' in feature: continue
      if build.failed: break

      # remove failed retries that succeeded later
      passed = []
      for element in reversed(feature.elements):
        if element.type == 'background': continue
        if element.status == 'passed':
          passed.append(element.location)
        elif element.location in passed:
          element.status = 'retry'

      for element in feature.elements:
        if element.type == 'background' or element.status == 'retry': continue

        build.failed = build.failed or element.status == 'failed'
        if build.failed: break

        # steps after step.status = "failed" have no results
        element.duration = sum([step.result.duration for step in element.steps])
        element.name = re.sub(r' -- @[0-9]+\.[0-9]+ ', '', element.name)
        build.tests.append(element)
        for tag in element.tags: build.tags.add(tag)
  build.slow = 'use.with_slow=true' in build.tags

for key, build in list(builds.items()):
  if build.failed: del builds[key]

build = sorted(builds.keys(), key=lambda x: int(x))[-1]
print('Balancing for', build)
build = builds[build]
cluster1, cluster2 = build.split(2)
balance = {
  '1': [test.name for test in cluster1.tests],
  '2': [test.name for test in cluster2.tests],
}
with open('balance.json', 'w') as f:
  json.dump(balance, f, indent='  ')
