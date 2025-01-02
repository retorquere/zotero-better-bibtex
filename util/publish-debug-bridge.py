#!/usr/bin/env python3

import subprocess
import requests
from github import Github
import zipfile
import tempfile
import os
import re
import json

DBB = 'test/fixtures/debug-bridge'

version = subprocess.run(['git', 'rev-list', '--count', 'HEAD', '--', DBB], stdout=subprocess.PIPE).stdout.decode('utf-8').strip()
version += '.0'
released = f'debug-bridge-{version}.xpi'

github = Github(os.environ.get('GITHUB_TOKEN'))
repo = github.get_repo('retorquere/zotero-better-bibtex')
release = repo.get_release('debug-bridge')

xpis = [ asset for asset in release.get_assets() if asset.name.startswith('debug-bridge-') ]

for asset in xpis:
  if asset.name != released:
    print('removing', asset.name)
    asset.delete_asset()

if not any(asset.name == released for asset in xpis):
  print('building', released)
  with tempfile.TemporaryDirectory() as temp_dir:
    path = os.path.join(temp_dir, released)
    with zipfile.ZipFile(path, 'w', zipfile.ZIP_DEFLATED) as _xpi:
      for root, _, files in os.walk(DBB):
        for file in files:
          filepath = os.path.join(root, file)
          zippath = os.path.relpath(filepath, os.path.dirname(filepath))
          if filepath.endswith('.html') or filepath.endswith('.md'):
            continue

          print(' ', zippath)
          if file == 'install.rdf':
            with open(filepath, 'r') as f:
              content = re.sub(r'<em:version>(.*?)</em:version>', f'<em:version>{version}</em:version>', f.read())
              _xpi.writestr(zippath, content.encode('utf-8'))
          elif file == 'manifest.json':
            with open(filepath, 'r') as f:
              content = json.load(f)
              content['version'] = version
              _xpi.writestr(zippath, json.dumps(content, indent=2).encode('utf-8'))
          else:
            _xpi.write(filepath, zippath)

    print('adding', released)
    release.upload_asset(path=path, name=released, content_type='application/x-xpinstall')
