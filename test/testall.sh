#!/bin/sh

for t in `ls import/*.bib | awk -F. '{print $2}'`; do
  echo $t

  echo "{ \"translator\": \"Better BibTeX.js\", \"command\": \"import\", \"input\": \"import/Better BibTeX.$t.bib\" }" > test-$t.json
  ./test.js test-$t.json
done
