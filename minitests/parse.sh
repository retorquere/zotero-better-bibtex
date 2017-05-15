#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true

SRC="resource/translators/latex_unicode_mapping.js resource/translators/BetterBibTeXParserSupport.js resource/translators/BetterBibTeXParser.js minitests/parse.js"


echo 'var globals = {};' > test.js
rake $SRC
cat $SRC | sed -e 's/})(this)/})(globals)/' >> test.js

node test.js
