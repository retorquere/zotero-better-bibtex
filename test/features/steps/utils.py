import re
from bs4 import BeautifulSoup
from markdownify import markdownify as md
import difflib
import json
import os
import platform
import psutil
import subprocess
import sys
import time
import urllib.request
import psutil
import shlex
from collections import UserDict
import copy
import unicodedata

import warnings
warnings.filterwarnings("ignore", category=UserWarning, module='bs4', message='.*looks like a URL.*')

import pathlib
for d in pathlib.Path(__file__).resolve().parents:
  if os.path.exists(os.path.join(d, 'behave.ini')):
    ROOT = d
    break

def print(txt, end='\n'):
  sys.stdout.write(str(txt) + end)
  sys.stdout.flush()

class HashableDict(dict):
  def __hash__(self):
    # lower case before hash?
    return str(hash(json.dumps(self, sort_keys=True)))

class benchmark(object):
  def __init__(self,name):
    self.name = name

  def __enter__(self):
    self.started = time.time()
    return self

  def __exit__(self,ty,val,tb):
    print('{} {:.2f}s'.format(self.name, self.elapsed))
    return False

  @property
  def elapsed(self):
    return time.time() - self.started

def assert_equal_diff(expected, found):
  expected = unicodedata.normalize('NFD', expected)
  found = unicodedata.normalize('NFD', found)
  assert found in [
    re.sub(r'\s+$', '\n', expected.lstrip()),
    expected.strip(),
  ], '\n' + '\n'.join(difflib.unified_diff(expected.split('\n'), found.split('\n'), fromfile='expected', tofile='found', lineterm=''))

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

def clean_html(html):
  return BeautifulSoup(html, 'html.parser').prettify()

def html2md(html):
  if '<' in html: html = md(BeautifulSoup(html, 'lxml').prettify())
  return html.strip()

def serialize(obj):
  return json.dumps(obj, indent=2, ensure_ascii=True, sort_keys=True)

def running(id):
  if type(id) == int:
    try:
      os.kill(id, 0)
      return False
    except OSError:
      return True

  if platform.system() == 'Darwin':
    try:
      count = int(subprocess.check_output(['osascript', '-e', 'tell application "System Events"', '-e', f'count (every process whose name is "{id}")', '-e', 'end tell']).strip())
    except subprocess.CalledProcessError as err:
      print(err.output)
      if err.output.decode('utf-8') == 'Application isn’t running.': return False
      raise

  else:
    count = 0
    for proc in psutil.process_iter():
      try:
        # Check if process name contains the given name string.
        if id.lower() in proc.name().lower():
          count += 1
          print(f'{id} is running, name = {proc.name()}, pid = {proc.pid}')
      except (psutil.NoSuchProcess, psutil.AccessDenied, psutil.ZombieProcess):
        pass

  return count > 0

def nested_dict_iter(nested, root = []):
  for key, value in nested.items():
    if isinstance(value, dict):
      for inner_key, inner_value in nested_dict_iter(value, root + [key]):
        yield inner_key, inner_value
    else:
      yield '.'.join(root) + '.' + key, value

