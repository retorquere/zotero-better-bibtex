#!/usr/bin/env python3

import sys, os, types
ROOT = os.path.abspath(os.path.dirname(os.path.realpath(__file__)))
sys.path.insert(0, os.path.join(ROOT, 'test/features'))
from steps.zotero import install_proxies

profile = types.SimpleNamespace(path=os.path.expanduser(f'~/.BBTZ5TEST'))

install_proxies([os.path.join(ROOT, path) for path in ['test/fixtures/debug-bridge', 'build']], profile.path)
