#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

#SRC="chrome/content/zotero-better-bibtex/lokijs.js minitests/loki.js"
SRC="minitests/loki.js"

rake $SRC
cat $SRC > minitests/test.js
#for src in resource/translators/xregexp-all.js minitests/format-preamble.js chrome/content/zotero-better-bibtex/BetterBibTeXPatternParser.js chrome/content/zotero-better-bibtex/BetterBibTeXPatternFormatter.js minitests/format.js ; do
#  rake $src
#  cat $src >> minitests/test.js
#done

node minitests/test.js
