#!/usr/bin/env python3

import urllib.request
import json

with open(sys.argv[1]) as f:
  req = urllib.request.Request('http://127.0.0.1:23119/debug-bridge/execute', data=f.read().encode('utf-8'), headers={'Content-type': 'text/plain'})
  r = urllib.request.urlopen(req).read().decode()
  print(json.loads(r))
