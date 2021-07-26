#!/usr/bin/env python3

import shutil
import os

root = os.path.join(os.path.dirname(__file__), '..')

for f in ['unabbrev.json', 'strings.bib']:
  shutil.copyfile(os.path.join(root, f'node_modules/@retorquere/bibtex-parser/{f}'), os.path.join(root, f'build/resource/unabbrev/{f}'))
