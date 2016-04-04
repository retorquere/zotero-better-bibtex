#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
echo "var CSL = { Output: {}  };" >> minitests/test.js

if ! [ -f minitests/csl-formatters.js ]; then
  curl -o minitests/csl-formatters.js https://bitbucket.org/fbennett/citeproc-js/raw/tip/src/formatters.js
fi
cat minitests/csl-formatters.js >> minitests/test.js
for src in minitests/titleCase.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
