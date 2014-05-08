#!/bin/sh
echo "{" > parser.pegjs
cat ../chrome/content/zotero-better-bibtex/dict.js >> parser.pegjs
sed 1d ../resource/translators/BibTeXParser.pegjs >> parser.pegjs
