#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
echo "var Translator = {}, LaTeX = {};" >> minitests/test.js
wget -O - https://raw.githubusercontent.com/Munawwar/neutron-html5parser/master/htmlparser.js | sed "s/'object'/'_object'/" | sed "s/root.HTMLtoDOM/Translator.HTMLtoDOM/" > minitests/htmlparser.js
cat minitests/htmlparser.js >> minitests/test.js
echo "var HTMLtoDOM = Translator.HTMLtoDOM;" >> minitests/test.js
for src in resource/translators/he.js resource/translators/latex_unicode_mapping.js  resource/translators/unicode_translator.js minitests/html.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
