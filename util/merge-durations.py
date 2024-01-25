#!/usr/bin/env python3

import os, sys
import json
import glob
from datetime import timedelta

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('-o', '--output', required=True)
parser.add_argument('-c', '--client', required=True)
parser.add_argument('durations', nargs='+')
args = parser.parse_args()

durations = {}
for job in sorted(args.durations):
  print(os.path.basename(job))
  durations = durations | json.load(f)

for key, dur in durations.items():
  print(key, timedelta(seconds=sum([test['seconds'] for test in dur.values()])))

directory = os.path.dirname(args.output)
if not os.path.exists(directory): os.makedirs(directory)

with open(args.output, 'w') as f:
  json.dump(durations[key], f, indent='  ')
