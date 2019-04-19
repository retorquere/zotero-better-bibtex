#!/usr/bin/env python3

from dotenv import load_dotenv, find_dotenv
load_dotenv(find_dotenv())

import os
import sys
import glob
import json

from github3 import login

prefix = f'travis-{os.environ["TRAVIS_BUILD_ID"]}-'

gh = login(token=os.getenv('GITHUB_TOKEN'))
repo = repo = gh.repository("retorquere", "zotero-better-bibtex")
release = repo.release_from_tag('builds')

if sys.argv[1] == 'stash':
  for xpi in glob.glob('xpi/*.xpi'):
    print(f'Uploading {xpi}')
    with open(xpi, 'rb') as asset:
      release.upload_asset(asset=asset, name=prefix+os.path.basename(xpi), content_type='application/x-xpinstall')

elif sys.argv[1] == 'fetch':
  for xpi in release.assets():
    if not xpi.name.startswith(prefix): continue

    print(f'Downloading {xpi.name}')
    with open(os.path.join('xpi', xpi.name[len(prefix):]), 'wb') as f:
      xpi.download(f)

elif sys.argv[1] == 'pop':
  for xpi in release.assets():
    if not xpi.name.startswith(prefix): continue

    print(f'Removing {xpi.name}')
    xpi.delete()

else:
  print(f'Unexpected action {json.dumps(sys.argv[1])}')
  sys.exit(1)
#for asset in repo.get_release(id='builds').get_assets():
#  print(asset.name)
