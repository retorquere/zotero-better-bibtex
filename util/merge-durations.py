#!/usr/bin/env python3

import os, sys
import json
import glob
from datetime import timedelta

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('-o', '--output', required=True)
parser.add_argument('-c', '--client', required=True)
parser.add_argument('-w', '--worker', action='store_true')
parser.add_argument('durations', nargs='+')
args = parser.parse_args()

durations = {}
for job in sorted(args.durations):
  dur, client, bin, worker = os.path.basename(job).replace('.json', '').split('--')
  if worker == 'worker':
    key = f'{client}-worker'
  else:
    key = client
  if key not in durations:
    durations[key] = {}
  with open(job) as f:
    durations[key] = durations[key] | json.load(f)

for key, dur in durations.items():
  print(key, timedelta(seconds=sum([test['seconds'] for test in dur.values()])))

if args.worker:
  key = f'{args.client}-worker'
else:
  key = args.client
with open(args.output, 'w') as f:
  json.dump(durations[key], f, indent='  ')
