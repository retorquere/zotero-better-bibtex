#!/usr/bin/env python3

import os

options = f'--tags="{os.environ["TAGS"]}'
if os.environ.get('TRAVIS_EVENT_TYPE', '') == 'cron' or os.environ.get('TRAVIS_TAG', '') != '' or '#nightly' in os.environ.get('TRAVIS_COMMIT_MESSAGE', ''):
  options += '" --define timeout=300'
else:
  options += ' and not @nightly"'
print(options)
