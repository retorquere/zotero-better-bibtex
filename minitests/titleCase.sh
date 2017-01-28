#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
echo "var Zotero = { BetterBibTeX: {}  };" >> minitests/test.js

for src in chrome/content/zotero-better-bibtex/lib/citeproc.js minitests/titleCase.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
