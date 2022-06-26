#!/usr/bin/env python3

import os, sys
import json
import glob

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('-o', '--output', required=True)
parser.add_argument('durations', nargs='+')
args = parser.parse_args()

durations = []
for job in args.durations:
  print('adding', job)
  with open(job) as f:
    durations = durations | json.load(f)

with open(args.output, 'w') as f:
  json.dump(durations), f, indent='  ')
