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
import threading

import pathlib
for d in pathlib.Path(__file__).resolve().parents:
  if os.path.exists(os.path.join(d, 'behave.ini')):
    ROOT = d
    break

def print(txt, end='\n'):
  sys.stdout.write(txt + end)
  sys.stdout.flush()

class benchmark(object):
  def __init__(self,name):
    self.name = name

  def __enter__(self):
    self.started = time.time()
    return self

  def __exit__(self,ty,val,tb):
    print("%s : %.2fs" % (self.name, self.elapsed))
    return False

  @property
  def elapsed(self):
    return time.time() - self.started

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


class PostLog(object):
  def __init__(self):
    self.logfile = os.environ.get('TRAVIS_JOB_NUMBER', 'travis')

    self.thread = threading.Thread(target=self.run, args=())
    self.thread.daemon = True
    self.thread.start()

  def run(self):
    print(f'Submitting {self.logfile}')
    with open(os.path.expanduser('~/.BBTZ5TEST.log'), 'rb') as f:
      req = urllib.request.Request(f'http://better-bibtex-travis-logs.s3.amazonaws.com/travis/{self.logfile}.log', data=f.read(), method='PUT')
      req.add_header('x-amz-storage-class', 'STANDARD')
      req.add_header('x-amz-acl', 'bucket-owner-full-control')
      req.add_header('Content-Type', 'text/plain')
      urllib.request.urlopen(req)
    print(f'{self.logfile} submitted')

  def join(self):
    self.thread.join()
