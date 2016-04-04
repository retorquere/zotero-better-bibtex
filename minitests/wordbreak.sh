#!/bin/bash

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
if ! [ -f minitests/xregexp-all.js ]; then
  curl -o minitests/xregexp-all.js http://cdnjs.cloudflare.com/ajax/libs/xregexp/2.0.0/xregexp-all.js
fi
#./minitests/wordbreak.rb
cat minitests/xregexp-all.js >> minitests/test.js

for src in minitests/charclass.js minitests/wordbreak.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
