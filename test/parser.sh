#!/bin/sh
echo "{" > ~/Dropbox/parser.pegjs
echo "var LaTeX = {toUnicode: {}};" >> ~/Dropbox/parser.pegjs
cat ../chrome/content/zotero-better-bibtex/dict.js >> ~/Dropbox/parser.pegjs
sed 1d ../resource/translators/BibTeXParser.pegjs >> ~/Dropbox/parser.pegjs
