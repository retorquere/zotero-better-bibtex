#!/bin/sh

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rake resource/translators/BetterBibTeXParserSupport.js
rake resource/translators/BetterBibTeXParser.js
rake minitests/parse.js

cat resource/translators/BetterBibTeXParserSupport.js resource/translators/BetterBibTeXParser.js minitests/parse.js > test.js

node test.js
