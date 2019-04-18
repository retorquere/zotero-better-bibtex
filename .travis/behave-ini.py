#!/usr/bin/env python3

import configparser
import os
import io
import shutil

nightly = os.environ.get('TRAVIS_EVENT_TYPE', '') == 'cron' or os.environ.get('TRAVIS_TAG', '') != '' or '#nightly' in os.environ.get('TRAVIS_COMMIT_MESSAGE', '')

behave = configparser.RawConfigParser()
behave.add_section('behave')
behave.add_section('behave.userdata')

if nightly:
  behave.set('behave', 'default_tags', os.environ['TAGS'])
  behave.set('behave.userdata', 'timeout', 300)
else:
  behave.set('behave', 'default_tags', os.environ['TAGS'] + ' and not @nightly')

behave.set('behave.userdata', 'xvfb', shutil.which('xvfb-run'))
behave.set('behave.userdata', 'zotero', os.environ['ZOTERO'])

with open('setup.cfg', 'w') as f:
  behave.write(f, space_around_delimiters=False)

f = io.StringIO()
behave.write(f, space_around_delimiters=False)
print(f.getvalue())
