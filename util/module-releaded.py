#!/usr/bin/env python3

import os

reload = {
  'content/BetterBibTeX.ts': True,
}

with open(os.path.expanduser('~/.BBTZ5TEST.log')) as log:
  for line in log.readlines():
    if line.strip() == '': continue
    if 'BBT: loading ' not in line: continue
    line = line.split('BBT: loading ')[1].strip()

    if not line in reload:
      reload[line] = False
    elif reload[line]:
      continue

    raise ValueError(line)
