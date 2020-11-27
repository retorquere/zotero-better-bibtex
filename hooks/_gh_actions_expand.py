#!/usr/bin/env python3

# Copyright © 2020 Elijah Shaw-Rutschman

# Permission is hereby granted, free of charge, to any person obtaining a copy
# of this software and associated documentation files (the “Software”), to deal
# in the Software without restriction, including without limitation the rights
# to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
# copies of the Software, and to permit persons to whom the Software is
# furnished to do so, subject to the following conditions:
#
# The above copyright notice and this permission notice shall be included in all
# copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
# IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
# FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
# AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
# LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
# OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
# SOFTWARE.


"""
Interpolates aliases in YAML.
Reads YAML from standard input, writes YAML to standard output. Comments and
formatting are retained.
This is useful if, for instance, you want to use aliases with a platform
that does not support them, such as Github Actions. You can define your anchors
in a top-level _anchors section, and that section will be omitted from the
output. The script can either be run manually prior to committing your changes,
or can be automated via a git hook.
Example input:
  _anchors:
    checkout_repo: &checkout_repo
      name: Checkout repo
      uses: actions/checkout@v2
      with:
        fetch-depth: 1
        submodules: recursive
    install_pip_requirements: &install_pip_requirements
      name: Install pip requirements
      run: |
        pip install -r requirements.txt
  name: Build
  on:
  push:
    branches: [ '*' ]
    tags: [ '*' ]
  jobs:
    build:
      name: Build
      runs-on: ubuntu-latest
      steps:
        - *checkout_repo
        - *install_pip_requirements
The output would be:
  name: Build
  on: null
  push:
    branches: ['*']
    tags: ['*']
  jobs:
    build:
      name: Build
      runs-on: ubuntu-latest
      steps:
      - name: Checkout repo
        uses: actions/checkout@v2
        with:
          fetch-depth: 1
          submodules: recursive
      - name: Install pip requirements
        run: |
          pip install -r requirements.txt
"""

import os
import sys
from glob import glob
from ruamel import yaml
import subprocess
import json


class InterpolatingDumper(yaml.RoundTripDumper):
  def ignore_aliases(self, data):
    # Always interpolate aliases
    return True

def interpolate_aliases(in_stream, out_stream):
  data = yaml.load(in_stream, Loader=yaml.RoundTripLoader)
  if '_anchors' in data:
    # Remove top-level _anchors section
    del data['_anchors']
  out_stream.write(yaml.round_trip_dump(data, Dumper=InterpolatingDumper, width=5000))

def run(cmd):
  print('$ ' + ' '.join(cmd))
  result = subprocess.run(cmd, stdout=subprocess.PIPE).stdout.decode('utf-8')
  print(result)
  return result

for change in run('git diff --cached --name-status'.split(' ')).split('\n'):
  if change.strip() == '': continue
  if change[0] == 'R':
    status, path, new = change.split("\t")
    status = status[0]
  else:
    status, path = change.split("\t")

  if os.path.dirname(path) != '.github/workflows/src': continue

  src = path
  tgt = os.path.join(os.path.dirname(os.path.dirname(src)), os.path.basename(src))

  action = None
  if status in ['M', 'A']:
    action = ['git', 'add', tgt]
  elif status == 'D':
    action = 'rm'
    if os.path.exists(tgt): action = ['git', 'rm', tgt]
  elif status == 'R':
    old_tgt = tgt
    src = new
    tgt = os.path.join(os.path.dirname(os.path.dirname(src)), os.path.basename(src))
    if os.path.exists(tgt): os.remove(tgt)
    if os.path.exists(old_tgt): run(['git', 'mv', old_tgt, tgt])
    action = ['git', 'add', tgt]

  assert tgt != src
  print(src, '=>', tgt)
  with open(src) as in_stream, open(tgt, 'w') as out_stream:
    interpolate_aliases(in_stream, out_stream)
  if action:
    run(action)
