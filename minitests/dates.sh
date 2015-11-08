#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
echo "var Zotero = { CiteProc: { CSL: { DATE_PARTS_ALL: ['year', 'month', 'day', 'season'] } }, debug: function(msg) { console.log(msg); }, BetterBibTeX: { CSLMonths: {}}  };" >> minitests/test.js

for src in chrome/content/zotero-better-bibtex/csl-dateparser.js chrome/content/zotero-better-bibtex/csl-localedata.js resource/translators/xregexp-all.js minitests/dates.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
