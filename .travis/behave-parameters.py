#!/usr/bin/env python3

import os
import shlex

nightly = os.environ.get('TRAVIS_EVENT_TYPE', '') == 'cron' or os.environ.get('TRAVIS_TAG', '') != '' or '#nightly' in os.environ.get('TRAVIS_COMMIT_MESSAGE', '')

print(f'--define zotero={shlex.quote(os.environ["ZOTERO"])}', end=' ')
if nightly:
  tags = os.environ['TAGS']
  print(f'--define timeout=300', end=' ')
else:
  tags = os.environ['TAGS'] + ' and not @nightly'
print(f'--tags={shlex.quote(tags)}')
