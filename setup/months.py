#!/usr/bin/env python3

from lxml import etree
import os
import glob
import json

root = os.path.join(os.path.dirname(__file__), '..')

print('generating date parser month translations')
locales = os.path.join(root, 'submodules', 'citation-style-language-locales')

months = {}
mapping = {
  'month-01': 'january',
  'month-02': 'february',
  'month-03': 'march',
  'month-04': 'april',
  'month-05': 'may',
  'month-06': 'june',
  'month-07': 'july',
  'month-08': 'august',
  'month-09': 'september',
  'month-10': 'october',
  'month-11': 'november',
  'month-12': 'december',
  'season-01': 'spring',
  'season-02': 'summer',
  'season-03': 'autumn',
  'season-04': 'winter',
}

for locale in sorted(glob.glob(os.path.join(locales, 'locales-*.xml'))):
  strings = etree.parse(locale)
  locale = os.path.splitext(os.path.basename(locale))[0]
  for month in strings.xpath("//csl:term[starts-with(@name, 'month-') or starts-with(@name, 'season-')]", namespaces={'csl': 'http://purl.org/net/xbiblio/csl'}):
    translation = month.text.replace('.', '').lower()
    english = mapping[month.attrib['name']]

    if translation[0].isdigit(): continue

    if translation in months and months[translation] != english:
      print(f'  {translation} already mapped to {months[translation]}, ignoring {english}')
    else:
      months[translation] = english

for month in range(1, 13):
  month = str(month)
  months[f'{month}月'] = mapping[f'month-{month.rjust(2, "0")}']
with open(os.path.join(root, 'gen/dateparser-months.json'), 'w') as out:
  json.dump(months, out, indent=2, sort_keys=True, ensure_ascii=False)
