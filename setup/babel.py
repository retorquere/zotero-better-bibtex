#!/usr/bin/env python3

from pathlib import Path
from configparser import RawConfigParser
from collections import OrderedDict
import itertools
import json
from collections import defaultdict

class Trie:
  def __init__(self):
    self.letters={}

  def addString(self,s):
    letters=self.letters
    for c in s:
      if(c not in letters):
        letters[c]={"freq":1}
      else:
        letters[c]["freq"]+=1
      letters=letters[c]
    letters["*"]=True #marks the end of word
    
  def generateUniquePrefix(self,s):
    prefix=[]
    letters=self.letters
    for c in s:
      prefix.append(c)
      if(letters[c]["freq"]==1):
        break
      letters=letters[c]
      
    return "".join(prefix)

  @classmethod
  def prefix(cls, A):
    t=Trie()
    for s in A:
      t.addString(s)
    ans=[]
    for s in A:
      prefix=t.generateUniquePrefix(s)
      ans.append(prefix)
    return {k: next(v for v in A if v.startswith(k)) for k in ans}

# biblatex language ids
prefered = {
  'usenglish', # override

  'basque',
  'bulgarian',
  'catalan',
  'croatian',
  'czech',
  'danish',
  'dutch',
  'english',
  'ukenglish',
  'canadian',
  'australian',
  'newzealand',
  'estonian',
  'finnish',
  'french',
  'german',
  'austrian',
  'swissgerman',
  'ngerman',
  'naustrian',
  'nswissgerman',
  'greek',
  'hungarian',
  'icelandic',
  'italian',
  'latvian',
  'lithuanian',
  'marathi',
  'norsk',
  'nynorsk',
  'polish',
  'brazil',
  'portuges',
  'romanian',
  'russian',
  'serbian',
  'serbianc',
  'slovak',
  'slovenian',
  'spanish',
  'swedish',
  'turkish',
  'ukrainian',
}

class MultiOrderedDict(OrderedDict):
  def __setitem__(self, key, value):
    if isinstance(value, list) and key in self:
      self[key].extend(value)
    else:
      #super(MultiOrderedDict, self).__setitem__(key, value)
      super().__setitem__(key, value) # in Python 3

languages = defaultdict(list)
alts = defaultdict(list)

for path in Path('babel/locale').rglob('*.ini'):
  locale = RawConfigParser(dict_type=MultiOrderedDict, strict=False)
  locale.read(str(path))
  names = [n for n in sorted(locale['identification'].keys()) if n.startswith('name.babel')]
  names = list(itertools.chain.from_iterable([locale['identification'][n].split(' ') for n in names]))
  pref = prefered
  if path.name.startswith('babel-de'):
    new = set([n for n in prefered if n.startswith('n')])
    if path.name.endswith('-1901.ini'):
      pref = prefered - new
    elif path.name.endswith('-1996.ini'):
      pref = new
    elif len(new.intersection(set(names))) == 1:
      pref = new
  pref = pref.intersection(set(names))
  assert len(pref) <= 1, (path.name, pref)

  if len(pref) == 0 and len(names) > 0:
    name = names[0]
  elif len(pref) == 1:
    name = list(pref)[0]
  else:
    name = None

  if not name:
    print(path.name, 'has no name')
    continue

  locale = locale['identification']
  name = name.lower()

  for lst, key in [(languages, 'tag.bcp47'), (alts, 'name.local'), (alts, 'name.english')]:
    if not key in locale: continue
    key = locale[key].lower()
    lst[key] = sorted(list(set(lst[key] + [name])))

# prefixes
for short, long in Trie.prefix(list(languages.keys())).items():
  if not short in languages:
    languages[short] = languages[long]

# merge alts, but not at the cost of mains
for key, names in alts.items():
  if key in languages:
    continue
  
  if len(names) > 1:
    shortest = sorted(names)[0]
    if all(n.startswith(shortest) for n in names):
      names = [shortest]

  if len(names) > 1:
    print(key, ': cannot choose between alts', names)
  else:
    languages[key] = [names[0]]

for tag, names in languages.items():
  names = sorted(names)
  if len(names) > 1:
    print(tag, ': ignoring', names[1:], 'in favor of', names[0])
  languages[tag] = names[0]

for tag, name in list(languages.items()):
  if '-' not in tag and len(tag) == 2:
    tagtag = '-'.join([tag, tag])
    if tagtag not in languages:
      languages[tagtag] = languages[tag]

for name in list(languages.values()):
  if name not in languages:
    languages[name] = name

for key, names in alts.items():
  if key not in languages:
    languages[key] = names[0]

with open('gen/language.json', 'w') as f:
  json.dump(languages, f, indent='  ')
