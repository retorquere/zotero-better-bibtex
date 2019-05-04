import platform
import subprocess
import os
import time
import psutil
import json
from markdownify import markdownify as md
from bs4 import BeautifulSoup

import pathlib
for d in pathlib.Path(__file__).resolve().parents:
  if os.path.exists(os.path.join(d, 'behave.ini')):
    ROOT = d
    break

class benchmark(object):
  def __init__(self,name):
    self.name = name
  def __enter__(self):
    self.start = time.time()
  def __exit__(self,ty,val,tb):
    end = time.time()
    print("%s : %0.3f seconds" % (self.name, end-self.start))
    return False

def assert_equal_diff(expected, found):
  assert expected == found, '\n' + '\n'.join(difflib.unified_diff(expected.split('\n'), found.split('\n'), fromfile='expected', tofile='found', lineterm=''))

def html2md(html):
  html = BeautifulSoup(html).prettify()
  return md(html).strip()

def serialize(obj):
  return json.dumps(obj, indent=2, sort_keys=True)

def un_multi(obj):
  if type(obj) == dict:
    obj.pop('multi', None)
    for v in obj.values():
      un_multi(v)
  elif type(obj) == list:
    for v in obj:
      un_multi(v)

def strip_obj(data):
  if type(data) == list:
    stripped = [strip_obj(e) for e in data]
    return [e for e in stripped if e not in ['', u'', {}, None, []]]

  if type(data) == dict:
    stripped = {k: strip_obj(v) for (k, v) in data.items()}
    return {k: v for (k, v) in stripped.items() if v not in ['', u'', {}, None, []]}

  return data

def compare(expected, found):
  size = 30
  if len(expected) < size or len(found) < size:
    assert_equal_diff(serialize(expected), serialize(found))
  else:
    for start in range(0, max(len(expected), len(found)), size):
      assert_equal_diff(serialize(expected[start:start + size]), serialize(found[start:start + size]))

def running(id):
  if type(id) == int:
    try:
      os.kill(id, 0)
      return False
    except OSError:
      return True

  if platform.system() == 'Darwin':
    count = int(subprocess.check_output(['osascript', '-e', 'tell application "System Events"', '-e', f'count (every process whose name is "{id}")', '-e', 'end tell']).strip())
    return count > 0

  for proc in psutil.process_iter():
    try:
      # Check if process name contains the given name string.
      if id.lower() in proc.name().lower():
        return True
    except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
      pass

  return False

def nested_dict_iter(nested, root = []):
  for key, value in nested.items():
    if isinstance(value, dict):
      for inner_key, inner_value in nested_dict_iter(value, root + [key]):
        yield inner_key, inner_value
    else:
      yield '.'.join(root) + '.' + key, value
