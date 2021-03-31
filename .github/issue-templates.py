#!/usr/bin/env python3

from mako.template import Template
from munch import *

templates = [
  Munch(
    name='Export',
    title='Export bug/enhancement/question',
    about='You appear to have found a bug in BBTs export, are proposing an enhancement to the exports, or have a question about exporting items.',
    labels='export',
  ),
  Munch(
    name='General_error',
    title='General error',
    about='You are experiencing an error not covered by the other categories',
    labels='bug'
  ),
  Munch(
    name='Import',
    title='Import bug/enhancement/question',
    about='You appear to have found a bug in BBTs BibTeX import, are proposing an enhancement to the import, or have a question about importing BibTeX.',
    labels='import'
  ),
  Munch(
    name='Key_generation',
    title='Key generation bug/enhancement/question',
    about='You appear to have found a bug in BBTs citation key generation, are proposing an enhancement to the key generation, or have a question about key generation.',
    labels='citekey'
  ),
  Munch(
    name='Question',
    title='Question on use, or feature suggestions, not covered by the other categories above.',
    about='You want information on how to use BBT, or have an idea for improvement that is not one of the categories above.',
    labels='question'
  ),
]

md = Template(filename='issue-template.md.mako')
for template in templates:
  with open(f'ISSUE_TEMPLATE/{template.name}.md', 'w') as f:
    print(md.render(templates=templates, template=template), file=f)
