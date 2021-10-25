#!/usr/bin/env python3

from mako.template import Template
from munch import *

templates = [
  Munch(
    name='Export',
    title='Export bug/enhancement',
    about='You appear to have found a bug in BBTs export, or are proposing an enhancement to the exports.',
    labels='export',
  ),
  Munch(
    name='Export',
    title='Export question',
    about='You have a question about exporting items.',
    labels='export, question',
  ),
  Munch(
    name='General_error',
    title='General error',
    about='You are experiencing an error not covered by the other categories',
    labels='bug'
  ),
  Munch(
    name='Import',
    title='Import bug/enhancement',
    about='You appear to have found a bug in BBTs BibTeX import, or are proposing an enhancement to the import.',
    labels='import'
  ),
  Munch(
    name='Import',
    title='Import question',
    about='You have a question about importing BibTeX.',
    labels='import, question'
  ),
  Munch(
    name='Key_generation',
    title='Key generation bug/enhancement',
    about='You appear to have found a bug in BBTs citation key generation, or are proposing an enhancement to the key generation.',
    labels='citekey'
  ),
  Munch(
    name='Key_generation',
    title='Key generation question',
    about='You have a question about key generation.',
    labels='citekey, question'
  ),
  Munch(
    name='Question',
    title='Question on use not covered by the other categories above.',
    about='You want information on how to use BBT. You can also use the discussions board for this.',
    labels='question'
  ),
]

md = Template(filename='issue-template.md.mako')
for template in templates:
  name = template.name
  if ', question' in template.labels:
    name = name + '_question'
  with open(f'ISSUE_TEMPLATE/{name}.md', 'w') as f:
    print(md.render(templates=templates, template=template), file=f)
