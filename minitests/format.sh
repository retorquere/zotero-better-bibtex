#!/bin/sh

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
for src in minitests/format-preamble.js chrome/content/zotero-better-bibtex/BetterBibTeXPatternParser.js chrome/content/zotero-better-bibtex/BetterBibTeXPatternFormatter.js minitests/format.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
