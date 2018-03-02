#!/usr/bin/env python

import platform
import glob
import argparse
import re
import json
import os
import sys
import tempfile

if sys.version_info[0] >= 3:
  from urllib.request import urlopen
  from html.parser import HTMLParser
  from urllib.request import urlretrieve
else:
  from urllib2 import urlopen
  from HTMLParser import HTMLParser
  from urllib import urlretrieve
  input = raw_input

def zotero_latest():
  response = urlopen('https://www.zotero.org/download/').read()
  if type(response) is bytes: response = response.decode("utf-8")
  for line in response.split('\n'):
    if not '"standaloneVersions"' in line: continue
    line = re.sub(r'.*Downloads,', '', line)
    line = re.sub(r'\),', '', line)
    versions = json.loads(line)
    return versions['standaloneVersions']['linux-' + platform.machine()]

def jurism_latest():
  class Parser(HTMLParser):
    def handle_starttag(self, tag, attrs):
      if tag != 'a': return
      href = [attr[1] for attr in attrs if attr[0] == 'href']
      if len(href) == 0: return
      href = href[0]
      m = re.match(r'https://our.law.nagoya-u.ac.jp/download/client/Jurism-(.+)_linux-' + platform.machine() + '.tar.bz2', href)
      if m is None: return
      self.version = m.group(1)
  response = urlopen('https://juris-m.github.io/downloads/')
  parser = Parser()
  parser.feed(response.read())
  return parser.version

def destinationType(name):
  name = re.sub(r"[^a-z]", '', name.lower())

  if len(name) == 0: raise Exception('Missing destination')

  if name[0] in ['/', '.', '~']: return os.path.abspath(os.path.expanduser(name))
  if 'local'[:len(name)] == name: return 'local'
  if 'global'[:len(name)] == name: return 'global'
  raise Exception('Unexpected location "' + name + '", expected "local" or "global"')

class LocationAction(argparse.Action):
  def __call__(self, parser, namespace, values, option_string=None):
    try:
      setattr(namespace, self.dest, destinationType(values))
    except Exception as err:
      parser.error(err)

def clientType(name):
  name = re.sub(r"[^a-z]", '', name.lower())

  if len(name) == 0: raise Exception('Missing client name')
  if 'jurism'[:len(name)] == name: return 'jurism'
  if 'zotero'[:len(name)] == name: return 'zotero'
  raise Exception('Unexpected client type "' + name + '", expected "Zotero" or "Juris-M"')

class ClientAction(argparse.Action):
  def __call__(self, parser, namespace, values, option_string=None):
    try:
      setattr(namespace, self.dest, clientType(values))
    except Exception as err:
      parser.error(err)

installdir_local = os.path.expanduser('~/bin')
installdir_global = '/opt'

parser = argparse.ArgumentParser()
parser.add_argument('-c', '--client', action=ClientAction, help='select Zotero client to download and install, either Zotero or Juris-M')
parser.add_argument('-v', '--version', help='install the given version rather than the latest')
parser.add_argument('-d', '--destination', action=LocationAction, help="location to install, either 'local' (" + installdir_local + ") or 'global' (" + installdir_global + ')')
parser.add_argument('-r', '--replace', action='store_true', help='replace Zotero at selected install location if it exists there')
parser.add_argument('-p', '--picker', action='store_true', help='Start Zotero with the profile picker')
parser.add_argument('--datadir', action='store_true', help='Store zotero data in the profile. Use this if you expect to use multiple profiles.')
parser.add_argument('--cache', help='cache downloaded installer in this directory. Use this if you expect to re-install Zotero often')

args = parser.parse_args()

if args.client is None:
  args.client = clientType(input('Client to install (zotero or juris-m):'))

if args.destination is None:
  args.destination = destinationType(input('Location to install (local or global):'))

if args.cache is not None and not os.path.exists(args.cache):
  print(args.cache + ' does not exist')
  sys.exit(1)

if args.version == 'latest' or args.version is None:
  version = zotero_latest() if args.client == 'zotero' else jurism_latest()
  if args.version is None:
    args.version = input(args.client + ' version (' + version + '):')
    if args.version == '': args.version = version
  else:
    args.version = version

if args.destination is None:
  installdir = input('Installation directory: ')
  if installdir == '': raise Exception("Installation directory is mandatory")
  menudir = None
elif args.destination == 'local':
  installdir = os.path.join(installdir_local, args.client)
  menudir = os.path.expanduser('~/.local/share/applications')
else:
  installdir = installdir_global
  menudir = '/usr/share/applications'
  
if os.path.exists(installdir) and not args.replace: raise Exception('Installation directory "' + installdir + '"exists')

if args.client == 'zotero':
  if args.version == 'beta':
    args.url = "https://www.zotero.org/download/client/dl?channel=beta&platform=linux-" + platform.machine()
  else:
    args.url = "https://www.zotero.org/download/client/dl?channel=release&platform=linux-" + platform.machine() + '&version=' + args.version
else:
  args.url = 'https://our.law.nagoya-u.ac.jp/download/client/Jurism-' + args.version + '_linux-' + platform.machine() + '.tar.bz2'

tarball = args.client + '-' + platform.machine() + '-' + args.version + '.tar.bz2'

if args.cache is None:
  tarball = tempfile.NamedTemporaryFile().name
else:
  tarball = args.client + '-' + platform.machine() + '-' + args.version + '.tar.bz2'
  for junk in glob.glob(os.path.join(args.cache, args.client + '-*.tar.bz2')):
    if os.path.basename(junk) != tarball: os.remove(junk)
  tarball = os.path.join(args.cache, tarball)

if os.path.exists(tarball):
  print('Retaining ' + tarball)
else:
  print("Downloading " + args.client + " standalone " + args.version + ' for ' + platform.machine() + ' from ' + args.url)
  urlretrieve (args.url, tarball)

extracted = tempfile.mkdtemp()

def shellquote(s):
  return "'" + s.replace("'", "'\\''") + "'"
os.system('tar --strip 1 -xpf ' + shellquote(tarball) + ' -C ' + shellquote(extracted))

if os.path.exists(installdir): os.system('rm -rf ' + shellquote(installdir))
os.system('mkdir -p ' + shellquote(os.path.dirname(installdir)))
os.system('mv ' + shellquote(extracted) + ' ' + shellquote(installdir))

if not menudir is None:
  if not os.path.exists(menudir): os.system('mkdir -p ' + shellquote(menudir))
  with open(os.path.join(menudir, args.client + '.desktop'), 'w') as desktop:
    desktop.write("[Desktop Entry]\n")
    if args.client == 'zotero':
      desktop.write("Name=Zotero\n")
    else:
      desktop.write("Name=Juris-M\n")

    client = args.client
    if args.datadir:
      client = client + ' -datadir profile'
    if args.picker:
      client = client + ' -P'
    desktop.write("Comment=Open-source reference manager\n")
    desktop.write("Exec=" + installdir + '/' + client + "\n")
    desktop.write("Icon=" + installdir + "/chrome/icons/default/default48.png\n")
    desktop.write("Type=Application\n")
    desktop.write("StartupNotify=true")
