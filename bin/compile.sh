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
latexmk -silent mwe.tex
#rubber -q mwe.tex
