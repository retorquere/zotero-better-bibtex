#!/usr/bin/env python3

import re

with open('README.md') as f:
  readme = f.read()
warning = '<!-- WARNING: GENERATED FROM https://github.com/retorquere/zotero-better-bibtex/blob/master/README.md. EDITS WILL BE OVERWRITTEN -->'

index = f"""
---
title: Better BibTeX for Zotero
weight: 5
aliases:
  - /Home
---
{warning}
""".lstrip().split('\n')

sponsoring = f"""
---
title: Sponsoring BBT
---
{warning}
""".lstrip().split('\n')

appendto = index
for line in readme.split('\n'):
  if 'gitter' in line: continue
  if line.startswith('# ') and 'sponsor' in line.lower():
    appendto = sponsoring
    continue

  line = re.sub(r'\[!\[.*', '', line)

  line = re.sub(r'\(https:\/\/(retorquere\.github\.io|retorque\.re)\/zotero-better-bibtex(\/.*?)\/?\)', "({{< ref \"\\2\" >}})", line)
  appendto.append(line)

with open('site/content/_index.md', 'w') as f:
  print("\n".join(index), file=f)
with open('site/content/sponsoring.md', 'w') as f:
  print("\n".join(sponsoring), file=f)
