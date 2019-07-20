import platform
import subprocess
import os
import time
import psutil
import json
import difflib
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

def expand_scenario_variables(context, filename, star=True):
  scenario = None
  if hasattr(context, 'scenario') and context.scenario.keyword == 'Scenario': # exclude outlines
    scenario = context.scenario.name
  elif hasattr(context, 'imported') and context.imported:
    scenario = os.path.splitext(os.path.basename(context.imported))[0]
  if scenario:
    filename = filename.replace('((scenario))', scenario)
    if star: filename = filename.replace('*', scenario)
  return filename

def html2md(html):
  html = BeautifulSoup(html, features='lxml').prettify()
  return md(html).strip()

def serialize(obj):
  return json.dumps(obj, indent=2, sort_keys=True)

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
