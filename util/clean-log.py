#!/usr/bin/env python3

import fileinput, os

for line in fileinput.input(files=(os.path.expanduser('~/.BBTZ5TEST.log'),), encoding='utf-8', inplace=True):
  if "Syntax Error: Couldn't read xref table" in line:
    continue
  elif "Syntax Error: Couldn't find trailer dictionary" in line:
    continue
  elif "pdfinfo returned exit status 1" in line:
    continue
  elif "pdftotext returned exit status 1" in line:
    continue
  elif 'has reached its Zotero File Storage quota' in line:
    continue
  else:
    print(line, end='')
