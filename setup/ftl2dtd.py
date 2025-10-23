#!/usr/bin/env python3

from fluent.syntax import parse
from fluent.syntax.ast import BaseNode
from fluent.syntax import ast
# from fluent.runtime import FluentLocalization, FluentResourceLoader
from fluent.runtime import FluentBundle, FluentResource

import javaproperties

from pathlib import Path
from html import escape
import os
import json

params = {
  "entries": "{entries}",
  "error": "{error}",
  "limit": "{limit}",
  "n": "{n}",
  "path": "{path}",
  "preference": "{preference}",
  "running": "{running}",
  "seconds": "{seconds}",
  "total": "{total}",
  "translator": "{translator}",
  "treshold": "{treshold}",
  "type": "{type}",
  "version": "{version}"
}

class Visitor(object):
    def visit(self, node):
        if isinstance(node, list):
            for child in node:
                self.visit(child)
            return
        if not isinstance(node, BaseNode):
            return
        nodename = type(node).__name__
        visit = getattr(self, 'visit_{}'.format(nodename), self.generic_visit)
        visit(node)

    def generic_visit(self, node):
        for propname, propvalue in vars(node).items():
            self.visit(propvalue)

class KeyLister(Visitor):
    @classmethod
    def list(cls, node):
        lister = cls()
        lister.visit(node)
        return lister.keys

    def __init__(self):
        super()
        self.keys = []

    def visit_Message(self, message):
        self.keys.append(message.id.name)
        self.generic_visit(message)

for ftl in Path('locale').rglob('*/better-bibtex.ftl'):
  dtd = 'build/' + str(ftl).replace('/better-bibtex.ftl', '/zotero-better-bibtex.dtd')
  props = 'build/' + str(ftl).replace('/better-bibtex.ftl', '/zotero-better-bibtex.properties')
  os.makedirs(os.path.dirname(dtd), exist_ok=True)
  with open(dtd, 'w') as dtd, open(props, 'w') as props:
    properties = {}
    locale = str(ftl).split('/')[1]
    bundle = FluentBundle([locale], use_isolating=False)
    resource = parse(ftl.read_text())
    bundle.add_resource(resource)
    for key in KeyLister.list(resource):
      message = bundle.get_message(key)
      if message.value is not None:
        properties[key] = bundle.format_pattern(message.value, params)[0]

      if message.attributes is not None:
        for attr, pattern in message.attributes.items():
          properties[key + '.' + attr] = bundle.format_pattern(pattern, params)[0]

    print(javaproperties.dumps(properties), file=props)
    for key, value in properties.items():
      print(f'<!ENTITY {key} "' + escape(value).replace('&#x27;', "'") + '">', file=dtd)

    if '/en-US/' in str(ftl):
      with open('gen/l10n.ts', 'w') as f:
        f.write('export default ' + json.dumps(list(properties.keys()), indent='  '))
