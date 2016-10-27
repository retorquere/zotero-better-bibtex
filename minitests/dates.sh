#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js

SRC="minitests/dates-pre.js chrome/content/zotero-better-bibtex/lib/citeproc.js chrome/content/zotero-better-bibtex/csl-localedata.js resource/translators/xregexp-all.js chrome/content/zotero-better-bibtex/dateparser.js minitests/dates.js"

rake $SRC
cat $SRC >> minitests/test.js

sed -i'' 's/Zotero.Utilities.XRegExp/XRegExp/' minitests/test.js

node minitests/test.js
