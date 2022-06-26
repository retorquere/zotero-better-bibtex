#!/usr/bin/env python3

import os, sys
import json
import glob

import argparse
parser = argparse.ArgumentParser()
parser.add_argument('-o', '--output', required=True)
parser.add_argument('logs', nargs='+')
args = parser.parse_args()

logs = []
for job in args.logs:
  with open(job) as f:
    logs += json.load(f)

with open(args.output, 'w') as f:
  json.dump(sorted(set(logs)), f, indent='  ')
