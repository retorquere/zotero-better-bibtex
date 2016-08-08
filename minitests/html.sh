#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
echo "var Translator = { debug: function(msg) { console.log(msg); }}, LaTeX = {};" >> minitests/test.js
if [ ! -f minitests/htmlparser.js ]; then
  wget -O - https://raw.githubusercontent.com/Munawwar/neutron-html5parser/master/htmlparser.js | sed "s/'object'/'_object'/" | sed "s/root.HTMLtoDOM/Translator.HTMLtoDOM/" > minitests/htmlparser.js
fi
cat minitests/htmlparser.js >> minitests/test.js
echo "var HTMLtoDOM = Translator.HTMLtoDOM;" >> minitests/test.js
for src in resource/translators/xregexp-all.js resource/translators/latex_unicode_mapping.js resource/translators/BetterBibTeXMarkupParser.js resource/translators/unicode_translator.js minitests/html.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
