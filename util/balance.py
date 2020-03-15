#!/usr/bin/env python3

import os, sys
import json
from collections import defaultdict
from munch import Munch
import glob
import re
import math

class Suite:
  def __init__(self, full=False):
    self.tags = set()
    self.tests = []
    self.failed = False
    self.full = full
    self.batch_prefix = 'test-cluster-'
    self.jobs = set()

  def add(self, job):
    self.jobs.add(job)

  def duration(self):
    return sum(test.duration for test in self.tests)

  def split(self, n):
    batches = [ Suite() for i in range(0, n) ]
    tests = sorted(self.tests, key=lambda test: (test.duration, test.name), reverse=True)

    for test in tests:
      if 'use.with_slow=true' in test.tags: continue

      sorted(batches, key=lambda batch: batch.duration() + test.duration)[0].tests.append(test)

    for test in tests:
      if not 'use.with_slow=true' in test.tags: continue

      sorted(batches, key=lambda batch: batch.duration() + test.duration)[0].tests.append(test)

    return batches

builds = defaultdict(Suite)
for log in sorted(glob.glob(os.path.expanduser('~/pCloud Drive/travis/zotero=master=*.json'))):
  print(log)
  if os.path.getsize(log) == 0 or not os.path.basename(log).startswith('zotero='):
    os.remove(log)
    continue
  jobid = os.path.splitext(os.path.basename(log))[0].split('=')[2]
  buildid = jobid.split('.')[0]
  build = builds[buildid]
  build.add(jobid)
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
        element.duration = math.ceil(sum([step.result.duration for step in element.steps]))
        element.name = re.sub(r' -- @[0-9]+\.[0-9]+ ', '', element.name)
        build.tests.append(element)
        for tag in element.tags: build.tags.add(tag)
  build.slow = 'use.with_slow=true' in build.tags

for key, build in list(builds.items()):
  if build.failed or len(build.jobs) != 2: del builds[key]

build = sorted(builds.keys(), key=lambda x: int(x))[-1]
print('Balancing for', build)
build = builds[build]
cluster1, cluster2 = build.split(2)
balance = {
  '1': sorted([test.name for test in cluster1.tests]),
  '2': sorted([test.name for test in cluster2.tests]),
}
with open('balance.json', 'w') as f:
  json.dump(balance, f, indent='  ')
