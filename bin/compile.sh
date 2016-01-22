#!/bin/bash

set -e

echo "=========================================================="
echo "Compiling $1"
echo "=========================================================="
echo
echo

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BIB=`realpath "$1"`
MYTMPDIR=`mktemp -d`
trap "rm -rf $MYTMPDIR" EXIT

cd "$MYTMPDIR"
"$DIR/mwe.rb" "$BIB" 

filename=$(basename "$1")
extension="${filename##*.}"

if [ "$extension" = "biblatex" ]; then
  LATEXMKOPTIONS="-xelatex"
else
  LATEXMKOPTIONS=""
fi

if [ "$2" = "verbose" ]; then
  latexmk $LATEXMKOPTIONS -halt-on-error mwe.tex
else
  latexmk $LATEXMKOPTIONS -halt-on-error mwe.tex > /dev/null
fi
#rubber -q mwe.tex
