#!/usr/bin/env python3

import urllib.request
import json
import sys

with open(sys.argv[2]) as f:
  req = urllib.request.Request('http://127.0.0.1:23119/debug-bridge/execute?password={sys.argv[1]}', data=f.read().encode('utf-8'), headers={'Content-type': 'text/plain'})
  r = urllib.request.urlopen(req).read().decode()
  print(json.loads(r))
