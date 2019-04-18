#!/usr/bin/env python3

import configparser
import os

nightly = os.environ.get('TRAVIS_EVENT_TYPE', '') == 'cron' or os.environ.get('TRAVIS_TAG', '') != '' or '#nightly' in os.environ.get('TRAVIS_COMMIT_MESSAGE', '')

behave = configparser.RawConfigParser()

behave.add_section('behave')
tags = os.environ['CLUSTER']
if not nightly:
  tags += ' and not @nightly'
behave.set('behave', 'default_tags', tags)

behave.add_section('behave.userdata')
behave.set('behave.userdata', 'zotero', os.environ['ZOTERO'])
if nightly: behave.set('behave.userdata', 'timeout', 300)

with open('behave.ini', 'w') as f:
  behave.write(f, space_around_delimiters=False)
