#!/usr/bin/env python3

import json
from itertools import zip_longest

with open("node_modules/unicode2latex/dist/tables/biblatex.json") as f:
  unicode = json.load(f)

def maketable(pkg):
  cols = 4
  table = f"\n\n### {pkg}\n\n"
  table += "|" + (" **character** | **text** | **math** |" * cols) + "\n"
  table += "|" + ("---------------|----------|----------|" * cols) + "\n"

  chars = [ f" {ucode} | {tex.pop('text', '')} | {tex.pop('math', '')}" for ucode, tex in unicode['package'][pkg].items()]
  args = [iter(chars)] * cols
  rows = zip_longest(*args, fillvalue=" | | ")

  for row in rows:
    table += "| " + (" | ".join(row)) + " |\n"
  return table

with open("site/content/exporting/unicode.md") as f:
  page = f.readlines()
  page = page[:next((i for i, x in enumerate(page) if '<!--' in x), None) + 1]
  page = ''.join(page)
  for pkg in unicode['package'].keys():
    page += maketable(pkg)

with open("site/content/exporting/unicode.md", 'w') as f:
  print(page, file=f)

