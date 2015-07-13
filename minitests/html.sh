#!/bin/sh

set -e

DIR=$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )
cd $DIR
cd ..

OFFLINE=true
rm -f minitests/test.js
for src in resource/translators/marked.js resource/translators/htmlparser.js minitests/html.js ; do
  rake $src
  cat $src >> minitests/test.js
done

node minitests/test.js
