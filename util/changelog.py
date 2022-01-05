#!/usr/bin/env python3

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

import subprocess
import re
import os, sys
import json
from github3 import login

gh = login(token=os.getenv('GITHUB_TOKEN'))
repo = gh.repository('retorquere', 'zotero-better-bibtex')

try:
  with open('.github/issues.json') as f:
    issues = json.load(f)
except FileNotFoundError:
  issues = {}
for issue in repo.issues(state='all'):
  if str(issue.number) in issues: break
  issues[str(issue.number)] = issue.title
  print(issue.number, issue.title)
with open('.github/issues.json', 'w') as f:
  json.dump(issues, f, indent='  ')

print('# Changelog')

for line in subprocess.check_output('git log --pretty=format:"%ad%x09%s" --date=short', shell=True, text=True).split('\n'):
  date, comment = line.split('\t')

  if re.match(r'^v?[0-9]+(\.[0-9]+)+$', comment):
    print(f'\n## [{comment.replace("v", "")}] - {date}')
  else:
    titles = [re.sub(r'[^0-9]', '', nr) for nr in re.findall(r'(?:#|gh-)[0-9]+', comment)]
    titles = ' '.join(['[' + issues[nr] + ']' for nr in titles if nr in issues])
    if len(titles) > 0: titles += ' '
    print(f' - {titles}{comment}')
